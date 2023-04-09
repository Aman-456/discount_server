const Admin = require("../models/admin");
const Order = require("../models/orders");
const Vendor = require("../models/vendor");
const Contact = require("../models/contact")
const JWT = require("jsonwebtoken");
const nodemailer = require("nodemailer")
require("dotenv").config();

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

exports.Signup = async (req, res) => {
  try {
    const admin = new Admin(req.body);
    admin.password = await Admin.CreateHash(admin.password);
    admin.save(async (err) => {
      if (err && err.code === 11000) {
        const keyName = Object.keys(err.keyValue)[0];
        res.json({
          type: "failure",
          result:
            keyName.charAt(0).toUpperCase() +
            keyName.slice(1) +
            " already Exist. Choose a Different Name",
        });
      } else {
        res
          .status(200)
          .json({ type: "success", result: "Admin Registered Successfully" });
      }
    });

  } catch (error) {
    res
      .status(500)
      .json({ type: "failure", result: "Server not Responding. Try Again" });
  }
};

exports.Signin = async (req, res) => {
  try {
    console.log(req.body);
    const credientials = await Admin.findOne({
      email: req.body.email,
    });
    const admin = await Admin.findOne({ email: credientials.email });
    if (!admin) {
      res
        .status(200)
        .json({ type: "failure", result: "No User With Such Email Exists" });
    } else {
      const isEqual = await Admin.isPasswordEqual(
        req.body.password,
        admin.password
      );
      if (isEqual) {
        const token = await JWT.sign({ email: admin.email }, JWT_SECRET_KEY);
        res.status(200).json({
          type: "success",
          result: "Admin Login Successfully",
          data: {
            token: token,
            id: admin._id,
          }
        });
      } else {
        res.status(200).json({ type: "failure", result: "Wrong Password" });
      }
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ type: "failure", result: "Server not Responding. Try Again" });
  }
};
exports.getContact = async (req, res) => {
  try {
    const contact = await Contact({});
    if (contact) {
      res
        .status(200)
        .json({ type: "success", result: contact });
    }
    else {
      res
        .status(200)
        .json({ type: "failure", result: "an error occurred" });
    }

  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ type: "failure", result: "Server not Responding. Try Again" });
  }
};
exports.Contact = async (req, res) => {
  try {
    const username = req.body.username;
    const email = req.body.email;
    const subject = req.body.subject;
    const message = req.body.message;
    if (username && email && subject && message) {
      const contact = await new Contact(req.body)
      if (contact.save())
        res
          .status(200)
          .json({ type: "success", result: "Message Saved Successfully. we will get back to you as soon as possible" });

      else {
        res
          .json({ type: "failure", result: "An Error Occured" });
      }
    }
    else {
      res
        .json({ type: "failure", result: "Fill out form correctly" });
    }

  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ type: "failure", result: "Server not Responding. Try Again" });
  }
};
exports.Dashboard = async (req, res) => {
  try {
    var TotalOrders = await Order.find({}).count();
    var TotalVendors = await Vendor.find({}).count();
    console.log("Total Orders :" + TotalOrders);
    console.log("Total Vendors :" + TotalVendors);
    res
      .status(200)
      .json({ type: "success", result: "Admin Registered Successfully" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ type: "failure", result: "Server not Responding. Try Again" });
  }
};



exports.OTP = async (req, res) => {
  console.log("object" + req.body.email);
  try {
    var user = await Admin.findOne({ email: req.body.email });
    if (user) {
      sendOTP(user.email, user.name, user, res);
    } else {
      res.status(401).json({ type: "failure", result: "Email Does not Exist" });
    }
  } catch (error) {
    console.log(error + "error");
    res.status(500).json({ type: "failure", result: "Server Not Responding" });
  }
};
async function sendOTP(email, name, user, res) {
  try {
    console.log("object" + email);
    var otp = Math.floor(1000 + Math.random() * 9000);

    console.log("object" + otp);
    const now = new Date();
    const expiration_time = new Date(now.getTime() + 10 * 60000);

    user.otp = otp;
    user.expireTime = expiration_time;
    const u = await user.save();
    if (!user) {
      return res
        .status(500)
        .json({ type: "failure", result: "Server Not Responding" });
    }

    else {
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: `${process.env.EMAIL_ADDRESS} `,
          pass: `${process.env.APP_PASS || process.env.EMAIL_PASSWORD} `,
        },
      });

      const mailOptions = {
        from: `${process.env.EMAIL_ADDRESS} `,
        to: `${email} `,
        subject: "OTP: For Change Password",
        text:
          `Dear ${name} \, \n\n` +
          "OTP for Change Password is : \n\n" +
          `${otp} \n\n` +
          "This is a auto-generated email. Please do not reply to this email.\n\n",
      };

      await transporter.verify();

      //Send Email
      transporter.sendMail(mailOptions, (err, response) => {

        if (err) {
          return res
            .status(500)
            .json({ type: "failure", result: "Server Not Responding" });
        } else {
          res.status(200).json({
            type: "success",
            result: "OTP has been sent",
          });
        }
      });
    }

  } catch (error) {
    console.log(error + "error");
  }
}
exports.verifyOTP = async (req, res) => {
  console.log("OTP" + req.body.number);
  console.log("OTP Email" + req.body.email);
  if (!req.body.number || !req.body.email) {
    return res.json({ type: "failure", result: "either email or otp is undefined" })
  }
  var otp = req.body.number;
  const data = await Admin.findOne({ email: req.body.email });

  const now = new Date();
  if (now > new Date(data.expireTime)) {
    return res.status(401).json({ type: "failure", result: "OTP has been expired" });
  } else {
    if (otp === data.otp) {
      res
        .status(200)
        .json({ type: "success", result: "OTP has been verified" });
    } else {
      res.status(401).json({ type: "failure", result: "OTP is incorrect" });
    }
  }
};

exports.changePassword = async (req, res) => {
  console.log("OTP" + req.body.email + req.body.password);
  const user = await Admin.findOne({ email: req.body.email });
  user.password = await Admin.CreateHash(req.body.password);
  user
    .save()
    .then(() => {
      res.status(200).json({
        type: "success",
        result: "Password has been changed",
      });
    })
    .catch((error) => {
      res
        .status(500)
        .json({ type: "failure", result: "Server Not Responding" });
      return;
    });
};

exports.GetPendingVendors = async (req, res) => {
  try {
    var result = await Vendor.find({ status: "Pending" });
    res.status(200).json({ type: "success", result: result });
  } catch (error) {
    res
      .status(500)
      .json({ type: "failure", result: "Server Not Responding. Try Again" });
  }
};

exports.ApproveVendor = async (req, res) => {
  try {
    console.log({ body: req.body });
    var result = await Vendor.findOne({ _id: req.body.id });
    if (result) {
      result.status = "Accepted";

      const r = await result.save()
      if (r) {
        const vendors = await Vendor.find({
          status: "Pending"
        })
        res.status(200).json({ type: "success", result: vendors });
      }
      else {
        res.json({ type: "failure", result: "Could update vendor" });
      }
    }
    else {
      res.json({ type: "failure", result: "No such vendor found" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ type: "failure", result: "Server Not Responding. Try Again" });
  }
};

exports.GetVendors = async (req, res) => {
  try {

    const vendors = await Vendor.find({ status: "Accepted" })
    if (vendors)
      res.status(200).json({ type: "success", result: vendors });
    else {
      res.json({ type: "failure", result: "No  vendor found" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ type: "failure", result: "Server Not Responding. Try Again" });
  }
};
const { validationResult } = require("express-validator");
const Vendor = require("../models/vendor");
const Admin = require("../models/admin");
const OrderModal = require("../models/orders");
const mongoose = require("mongoose");
const JWT = require("jsonwebtoken");
const fs = require("fs");
require("dotenv").config();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const nodemailer = require("nodemailer");
const { AdminEmail } = require("./functions/Email");
const { sendOTP } = require("./functions/OtpEmail");
// const { AddCustomer } = require("./../externals/stripe");

exports.Signup = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (errors.errors.length != 0) {
      res.json({ type: "failure", result: errors.errors[0].msg });
      return;
    }
    const vendor = new Vendor(req.body);
    console.log("vendor " + vendor);
    vendor.email = req.body.email.toLowerCase();
    vendor.status = "Accepted";
    vendor.image = "assets/vendors/sample.jpg";
    vendor.password = await Vendor.CreateHash(vendor.password);
    vendor.completeStatus = false;
    vendor.block = false;
    vendor.latitude = "";
    vendor.longitude = "";
    vendor.address = "";
    vendor.provider = { type: "none", providerId: "none" };
    vendor.fcmToken = "";
    vendor.foodType = "";
    vendor.setUp = "";
    vendor.dietary = "";
    vendor.foodPackaging = "";
    vendor.weight = "";
    vendor.powerRequirement = "";
    vendor.hygieneRating = "";
    vendor.banner = "assets/vendors/banner.jpg";
    vendor.dimension = { width: 0, height: 0, length: 0 };
    vendor.documents = [];

    await AdminEmail(vendor, "Sign up");
    res.status(200).json({
      type: "success",
      result: "You have successfully signed up",
    });
  } catch (error) {
    res
      .status(500)
      .json({ type: "failure", result: "Server not Responding. Try Again" });
  }
};
exports.ChangePassword = async (req, res) => {
  try {
    console.log(req.query);
    var admin = await Admin.findOne({ email: "info@inuaeats.com" });
    const isEqual = await Admin.isPasswordEqual(
      req.query.cpassword,
      admin.password
    );
    if (isEqual) {
      admin.password = await Admin.CreateHash(req.query.password);
      const response = await admin.save();
      if (!response) {
        res.status(500).json({
          type: "failure",
          result: "Server not Responding. Try Again",
        });
        return;
      }
      res.status(200).json({
        type: "success",
        result: "Password has been changed successfully",
      });
    } else {
      return res.json({ type: "failure", result: "Wrong Password" });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ type: "failure", result: "Server not Responding. Try Again" });
  }
};
exports.Signin = async (req, res) => {
  try {
    var vendor = await Vendor.findOne(
      { email: req.query.email.toLowerCase() },
      "name password completeStatus block admin status hide"
    );
    if (!vendor) {
      res.json({ type: "failure", result: "No User With Such Email Exists" });
    } else {
      if (vendor.hide) {
        return res.json({
          type: "block",
          result:
            "Vendor has been deleted by admin contact info@inuaeats.com for further information",
        });
      }
      if (vendor.block) {
        return res.json({
          type: "block",
          result: "Vendor has been blocked by admin",
        });
      }
      // if (vendor.status === "Pending") {
      //   return res.json({
      //     type: "failure",
      //     result: "Reqeust Pending",
      //   });
      // }
      const isEqual = await Vendor.isPasswordEqual(
        req.query.password,
        vendor.password
      );
      if (isEqual) {
        const token = await JWT.sign({ username: vendor.name }, JWT_SECRET_KEY);
        if (req.query.fromMobile === "true") {
          await Vendor.findByIdAndUpdate(vendor._id, {
            $set: { fcmToken: req.query.fcmToken },
          });
        }
        res.status(200).json({
          type: "success",
          result: "Vendor Login Successfully",
          token: token,
          id: vendor._id,
          completeStatus: vendor.completeStatus,
        });
      } else {
        res.json({ type: "failure", result: "Wrong Password" });
      }
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ type: "failure", result: "Server not Responding. Try Again" });
  }
};

exports.GetNearByVendors = async (req, res) => {
  try {
    const currentLat = req.query.lat;
    const currentLon = req.query.lon;
    // const currentLat = "33.66912";
    // const currentLon = "72.9972736";
    const vendors = await Vendor.find(
      {},
      "name latitude longitude phone email image address"
    );
    // const nearByVendors = vendors.filter((vendor) => {
    //     const distance = Haversine.CalculateDistance(currentLat, currentLon, vendor.latitude, vendor.longitude);
    //     if (distance <= 5) {
    //         return vendor;
    //     }
    //     return false;
    // });
    // res.status(200).json({ "type": "success", "result": nearByVendors });
    res.status(200).json({ type: "success", result: vendors });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ type: "failure", result: "Server not Responding. Try Again" });
  }
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

exports.UpdateProfile = async (req, res) => {
  try {
    const vendorId = req.query.vendorId;
    const newVendor = new Vendor(req.body);
    const oldVendor = await Vendor.findById(vendorId);
    if (oldVendor.image === "assets/vendors/sample.jpg") {
    } else {
      fs.unlinkSync(oldVendor.image);
    }
    const response = await Vendor.findByIdAndUpdate(vendorId, {
      $set: {
        name: newVendor.name,
        phone: newVendor.phone,
        email: newVendor.email,
        image: newVendor.image,
        status: "Pending",
      },
    });
    if (!response) {
      res
        .status(500)
        .json({ type: "failure", result: "Server not Responding. Try Again" });
      return;
    }
    res
      .status(200)
      .json({ type: "success", result: "Item Updated Successfully" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ type: "failure", result: "Server not Responding. Try Again" });
  }
};

exports.UpdateStatus = async (req, res) => {
  try {
    const vendorId = req.query.vendorId;
    const action = req.query.action;
    const response = await Vendor.findByIdAndUpdate(vendorId, {
      $set: { status: action },
    });
    console.log(response);
    if (!response) {
      res
        .status(500)
        .json({ type: "failure", result: "Server not Responding. Try Again" });
      return;
    }
    const vendors = await Vendor.find(
      { status: "Pending" },
      "name email phone address"
    );
    sendEmail(response.email, response.name, vendors, res, action);
    // res.status(200).json({ type: "success", result: vendors });
  } catch (error) {
    res
      .status(500)
      .json({ type: "failure", result: "Server not Responding. Try Again" });
  }
};
async function sendEmail(email, name, vendors, res, action) {
  try {
    const transporter = await nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: `${process.env.EMAIL_ADDRESS}`,
        pass: `${process.env.EMAIL_PASSWORD}`,
      },
    });

    const mailOptions = {
      from: `${process.env.EMAIL_ADDRESS}`,
      to: email,
      subject: `Profile ${action}`,

      text: `Dear ${name} Your profile has been ${action} on inuaeats.com ,Please check your portal for the status`,
    };

    await transporter.verify();

    //Send Email
    await transporter.sendMail(mailOptions, (err, response) => {
      console.log(response);
      if (err) {
        res
          .status(500)
          .json({ type: "failure", result: "Server Not Responding" });
        return;
      } else {
        res.status(200).json({ type: "success", result: vendors });
      }
    });
  } catch (error) {
    console.log(error + "error");
  }
}

exports.UpdateStatusBlock = async (req, res) => {
  try {
    const vendorId = req.query.vendorId;
    const action = req.query.action;
    const response = await Vendor.findByIdAndUpdate(vendorId, {
      $set: { block: action },
    });
    if (!response) {
      res
        .status(500)
        .json({ type: "failure", result: "Server not Responding. Try Again" });
      return;
    }
    const vendors = await Vendor.find({});
    res.status(200).json({ type: "success", result: vendors });
  } catch (error) {
    res
      .status(500)
      .json({ type: "failure", result: "Server not Responding. Try Again" });
  }
};

exports.OauthGoogle = async (req, res) => {
  try {
    const { email, name, image, googleId } = req.body;
    const exist = await Vendor.findOne({ email: email });
    const token = await JWT.sign({ username: name }, JWT_SECRET_KEY);
    if (exist) {
      res.status(200).json({
        type: "success",
        result: "Already Registered",
        token: token,
        vendor: exist,
      });
      return;
    }
    const vendor = new Vendor({
      name: name,
      email: email,
      image: "assets/vendors/sample.jpg",
      provider: { type: "google", providerId: googleId },
      completeStatus: false,
      status: "Pending",
      latitude: "",
      longitude: "",
      address: "",
    });
    const response = await vendor.save();
    if (!response) {
      res
        .status(500)
        .json({ type: "failure", result: "Server not Responding. Try Again" });
      return;
    }
    res.status(200).json({
      type: "success",
      result: "Vendor Registered",
      token: token,
      vendor: response,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ type: "failure", result: "Server not Responding. Try Again" });
  }
};

exports.OauthFacebook = async (req, res) => {
  try {
    const { email, name, userId } = req.body;
    const exist = await Vendor.findOne({ email: email });
    const token = await JWT.sign({ username: name }, JWT_SECRET_KEY);
    if (exist) {
      res.status(200).json({
        type: "success",
        result: "Already Registered",
        token: token,
        vendor: exist,
      });
      return;
    }
    const vendor = new Vendor({
      name: name,
      email: email,
      image: "assets/vendors/sample.jpg",
      provider: { type: "facebook", providerId: userId },
      completeStatus: false,
      status: "Pending",
      latitude: "",
      longitude: "",
      address: "",
    });
    const response = await vendor.save();
    if (!response) {
      res
        .status(500)
        .json({ type: "failure", result: "Server not Responding. Try Again" });
      return;
    }
    res.status(200).json({
      type: "success",
      result: "Vendor Registered",
      token: token,
      vendor: response,
    });
  } catch (error) {
    res
      .status(500)
      .json({ type: "failure", result: "Server not Responding. Try Again" });
  }
};

exports.GetVendor = async (req, res) => {
  try {
    var result = await Vendor.findById(req.query.vendorId);
    res.status(200).json({ type: "success", result: result });
  } catch (error) {
    res
      .status(500)
      .json({ type: "failure", result: "Server Not Responding. Try Again" });
  }
};


exports.UpdateVendor = async (req, res) => {
  try {
    console.log(req.body);

    const vendorID = req.query.vendorId;
    let oldVendor = await Vendor.findById(vendorID);
    req.body.dayStartTime = JSON.parse(req.body.dayStartTime);
    req.body.dayEndTime = JSON.parse(req.body.dayEndTime);
    let vendor = req.body;
    let newFiles = vendor.newFiles;
    delete vendor.newFiles;
    vendor.dimension = {
      width: vendor.width,
      height: vendor.height,
      length: vendor.length,
    };
    delete vendor.width;
    delete vendor.length;
    delete vendor.height;
    vendor.completeStatus = true;
    vendor.status = "Pending";

    if (oldVendor.completeStatus) {
      for (const key in vendor) {
        if (vendor[key] === "null") {
          delete vendor[key];
        }
      }
      if (newFiles) {
        await newFiles.forEach(async (field) => {
          if (field === "image") {
            if (oldVendor[field] === "assets/vendors/sample.jpg") {
            } else {
              fs.unlinkSync(oldVendor[field]);
            }
          } else if (field === "banner") {
            if (oldVendor[field] === "assets/vendors/banner.jpg") {
            } else {
              fs.unlinkSync(oldVendor[field]);
            }
          } else {
            fs.unlinkSync(oldVendor[field]);
          }
        });
      }
      const response = await Vendor.findByIdAndUpdate(oldVendor._id, {
        $set: vendor,
      });
      await AdminEmail(vendor, "Complete Profile");

      res
        .status(200)
        .json({ type: "success", result: "Profile Updated Successfully" });
    } else {
      const response = await Vendor.findByIdAndUpdate(oldVendor._id, {
        $set: vendor,
      });
      if (response) {
        await AdminEmail(vendor, "Profile");
        res
          .status(200)
          .json({ type: "success", result: "Profile Updated Successfully" });
      } else {
        res
          .status(500)
          .json({ type: "failure", result: "Server Not Responding" });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ type: "failure", result: "Server Not Responding" });
  }
};

exports.OnLogout = async (req, res) => {
  try {
    const vendorId = req.query.vendorId;
    const response = await Vendor.findByIdAndUpdate(vendorId, {
      $set: { fcmToken: "" },
    });
    if (response) {
      res.status(200).json({ type: "success", result: "Logout Successfully" });
    } else {
      res
        .status(500)
        .json({ type: "failure", result: "Server Not Responding" });
    }
  } catch (error) {
    res.status(500).json({ type: "failure", result: "Server Not Responding" });
  }
};

exports.UpdateOnlineStatus = async (req, res, next) => {
  console.log(req.body.status);
  console.log(req.body.vendorId);
  try {
    const status = req.body.status;
    const vendorId = req.body.vendorId;
    const response = await Vendor.findByIdAndUpdate(vendorId, {
      $set: { onlineStatus: status },
    });
    if (response) {
      res.status(200).json({ type: "success", result: "Status Updated" });
    } else {
      res
        .status(500)
        .json({ type: "failure", result: "Server Not Responding" });
    }
  } catch (error) {
    res.status(500).json({ type: "failure", result: "Server Not Responding" });
  }
};

exports.GetVendors = async (req, res) => {
  try {
    const response = await Vendor.find();
    res.status(200).json({ type: "success", result: response });
  } catch (error) {
    console.log(error);
    res.status(500).json({ type: "failure", result: "Server Not Responding" });
  }
};
exports.DeleteVendor = async (req, res) => {
  try {
    const vendorId = req.query.vendorId;
    const action = req.query.action;
    const response = await Vendor.findByIdAndUpdate(vendorId, {
      $set: { hide: action },
    });
    if (!response) {
      res
        .status(500)
        .json({ type: "failure", result: "Server not Responding. Try Again" });
      return;
    }
    const vendors = await Vendor.find({});
    res.status(200).json({ type: "success", result: vendors });
  } catch (error) {
    res
      .status(500)
      .json({ type: "failure", result: "Server not Responding. Try Again" });
  }
};

exports.OTP = async (req, res) => {
  try {
    var vendor = await Vendor.findOne({ email: req.query.email });

    if (vendor) {
      sendOTP(vendor.email, vendor.name, vendor, res);
    } else {
      res.status(200).json({ type: "failure", result: "Email Does not Exist" });
    }
  } catch (error) {
    console.log(error + "error");
    res.status(500).json({ type: "failure", result: "Server Not Responding" });
  }
};

exports.UpdateVendorMap = async (req, res) => {
  try {
    const vendorID = req.query.vendorId;
    let oldVendor = await Vendor.findById(vendorID);

    const response = await Vendor.findByIdAndUpdate(oldVendor._id, {
      $set: {
        address: req.body.address,
        latitude: req.body.lat,
        longitude: req.body.long,
      },
    });

    if (response) {
      res
        .status(200)
        .json({ type: "success", result: "Location Updated Successfully" });
    } else {
      res
        .status(500)
        .json({ type: "failure", result: "Server Not Responding" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ type: "failure", result: "Server Not Responding" });
  }
};
const Secret_Key = process.env.STRIPE_SECRET_KEY_NEW;
const stripe = require("stripe")(Secret_Key);

exports.ConnectPay = async (req, res) => {
  // const account = await stripe.accounts.retrieve("acct_1Jpnas2EJRO4AqzB");
  try {
    const account = await stripe.accounts.create({
      type: "express",
      country: "GB",
    });
    // account.id  acct_1Jpmwq2EJ2RqD2RE;  acct_1Jpnas2EJRO4AqzB
    console.log(account.id);
    const vendorID = req.query.vendorId;
    let oldVendor = await Vendor.findById(vendorID);
    oldVendor.stripe_account = account.id;
    oldVendor.stripe_active = false;
    oldVendor.save();
    const accountLinks = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `https://${process.env.HOST}:${process.env.PORT}/vendor/refresh`,
      return_url: `https://${process.env.HOST}:${process.env.PORT}/vendor/updateProfile`,
      type: "account_onboarding",
    });
    // refresh_url: `http://${process.env.HOST}:${process.env.PORT}/vendor/refresh`,
    // return_url: `http://${process.env.HOST}:${process.env.PORT}/vendor/updateProfile`,
    console.log(accountLinks);
    res
      .status(200)
      .json({ success: true, type: "success", result: accountLinks });
  } catch (error) {
    console.log(error);
    res.status(500).json({ type: "failure", result: "Server Not Responding" });
  }
};

exports.ConnectComplete = async (req, res) => {
  try {
    const vendorID = req.query.vendorId;
    let oldVendor = await Vendor.findById(vendorID);
    if (oldVendor.stripe_account) {
      const account = await stripe.accounts.retrieve(oldVendor.stripe_account);
      if (account.charges_enabled === true) {
        oldVendor.stripe_active = true;
        oldVendor.save().then(() => {
          res.status(200).json({
            success: true,
            type: "success",
            result: oldVendor.stripe_account,
          });
        });
      } else {
        res.status(200).json({ success: true, type: "not found" });
      }
    } else {
      res.status(200).json({ success: true, type: "not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ type: "failure", result: "Server Not Responding" });
  }
};
exports.ConnectRefresh = async (req, res) => {
  try {
    const vendorID = req.query.vendorId;
    let oldVendor = await Vendor.findById(vendorID);
    const accountLinks = await stripe.accountLinks.create({
      account: oldVendor.stripe_account,
      refresh_url: `https://${process.env.HOST}:${process.env.PORT}/vendor/refresh`,
      return_url: `https://${process.env.HOST}:${process.env.PORT}/vendor/updateProfile`,
      type: "account_onboarding",
    });
    console.log(accountLinks);
    res
      .status(200)
      .json({ success: true, type: "success", result: accountLinks });
  } catch (error) {
    console.log(error);
    res.status(500).json({ type: "failure", result: "Server Not Responding" });
  }
};
exports.verifyOTP = async (req, res) => {
  var otp = req.body.number;
  const data = await Vendor.findOne({ email: req.body.email.toLowerCase() });

  const now = new Date();
  if (now > new Date(data.expireTime)) {
    res.status(200).json({ type: "failure", result: "OTP has been expired" });
  } else {
    if (otp === data.otp) {
      res
        .status(200)
        .json({ type: "success", result: "OTP has been verified" });
    } else {
      res.status(200).json({ type: "failure", result: "OTP is incorrect" });
    }
  }
};
exports.changePassword = async (req, res) => {
  console.log("OTP" + req.body.email + req.body.password);

  const vendor = await Vendor.findOne({ email: req.body.email });
  vendor.password = await Vendor.CreateHash(req.body.password);
  vendor
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
exports.getPayValues = async (req, res) => {

  try {
    const yearly = await OrderModal.aggregate([
      {
        $match: {
          $and: [
            { vendor: mongoose.Types.ObjectId(req.body.vendorId) },
            {
              paid: true,
            },
          ],
        },
      },
      {
        $group: {
          _id: { $year: "$createdAt" },
          total: { $sum: "$total" },
        },
      },
      {
        $project: {
          total: { $round: ["$total", 2] },
        },
      },

      {
        $sort: {
          _id: 1,
        },
      },
      {
        $group: {
          _id: null,
          data: { $push: { value: "$total", label: "$_id" } },
          // totals: { $push: "$total" },
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
    ]);
    const daily = await OrderModal.aggregate([
      {
        $match: {
          $and: [
            { vendor: mongoose.Types.ObjectId(req.body.vendorId) },
            {
              createdAt: {
                $gte: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000),
              },
            },
            {
              paid: true,
            },
          ],
        },
      },
      {
        $group: {
          _id: { $dayOfMonth: "$createdAt" },
          total: { $sum: "$total" },
        },
      },
      {
        $project: {
          total: { $round: ["$total", 2] },
        },
      },

      {
        $sort: {
          _id: 1,
        },
      },
      {
        $group: {
          _id: null,
          data: { $push: { value: "$total", label: "$_id" } },
          // totals: { $push: "$total" },
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
    ]);
    const weekly = await OrderModal.aggregate([
      {
        $match: {
          $and: [
            { vendor: mongoose.Types.ObjectId(req.body.vendorId) },
            {
              createdAt: {
                $gte: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000),
              },
            },
            {
              paid: true,
            },
          ],
        },
      },
      {
        $group: {
          _id: { $week: "$createdAt" },
          total: { $sum: "$total" },
        },
      },
      {
        $project: {
          total: { $round: ["$total", 2] },
        },
      },

      {
        $sort: {
          _id: 1,
        },
      },
      {
        $group: {
          _id: null,
          data: { $push: { value: "$total", label: "$_id" } },
          // totals: { $push: "$total" },
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
    ]);
    const monthly = await OrderModal.aggregate([
      {
        $match: {
          $and: [
            { vendor: mongoose.Types.ObjectId(req.body.vendorId) },
            {
              createdAt: {
                $gte: new Date(
                  new Date().getTime() - 365 * 24 * 60 * 60 * 1000
                ),
              },
            },
            {
              paid: true,
            },
          ],
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          total: { $sum: "$total" },
        },
      },
      {
        $project: {
          total: { $round: ["$total", 2] },
        },
      },

      {
        $sort: {
          _id: 1,
        },
      },
      {
        $group: {
          _id: null,
          data: { $push: { value: "$total", label: "$_id" } },
          // totals: { $push: "$total" },
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
    ]);

    res.status(200).json({
      type: "success",
      result: {
        calendericStats: {
          monthly: monthly,
          yearly: yearly,
          daily: daily,
          weekly: weekly,
        },
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ type: "failure", result: "Server Not Responding" });
    return;
  }
};
exports.GetOrderswithTotalEarning = async (req, res) => {
  console.log(req.body);

  try {
    const orders = await OrderModal.aggregate([
      {
        $match: {
          $and: [
            { vendor: mongoose.Types.ObjectId(req.body.vendorId) },
            {
              paid: true,
            },
          ],
        },
      },
      {
        $group: {
          _id: "$vendor",
          total: { $sum: "$total" },
        },
      },
    ]);
    const ordersAll = await OrderModal.aggregate([
      {
        $match: {
          $and: [
            { vendor: mongoose.Types.ObjectId(req.body.vendorId) },
            {
              paid: true,
            },
          ],
        },
      },
    ]);
    res.status(200).json({
      type: "success",
      total: orders[0].total,
      orders: ordersAll,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ type: "failure", result: "Server Not Responding" });
    return;
  }
};

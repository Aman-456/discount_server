const Customer = require("../models/customer");
const Vendor = require("../models/vendor");
// const Haversine = require("./functions/HaversineFormula");
const nodemailer = require("nodemailer");
var handlebars = require("handlebars");
var fs = require("fs");
const path = require("path")

require("dotenv").config();



exports.Signup = async (req, res) => {
  try {
    console.log(req.body);
    const exist = await Customer.findOne({ email: req.body.email });
    if (exist && exist.hide === false) {
      return res.json({ type: "failure", result: "Email already exist" });
    }
    const pass_customer = await Customer.CreateHash(req.body.password);
    if (exist && exist.hide === true) {
      const response = await Customer.findByIdAndUpdate(exist._id, {
        $set: {
          hide: false,
          name: req.body.name,
          password: pass_customer,
          phone: req.body.phone,
          address: req.body.address
        },
      });
      if (!response) {
        res.status(500).json({
          type: "failure",
          result: "Server not Responding. Try Again",
        });
        return;
      }

      return res.status(200).json({
        type: "active",
        result: "Customer Registered Successfully",
      });
    }

    const customer = new Customer(req.body);
    customer.password = pass_customer;

    sendEmail(customer.email, customer.name, customer, res);

  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ type: "failure", result: "Server not Responding. Try Again" });
  }
};

var readHTMLFile = function (path, callback) {
  fs.readFile(path, { encoding: "utf-8" }, function (err, html) {
    if (err) {
      callback(err);
      throw err;
    } else {
      callback(null, html);
    }
  });
};

async function sendEmail(email, name, user, res) {
  try {
    console.log(
      "object" + email + process.env.EMAIL_ADDRESS + process.env.EMAIL_PASSWORD
    );
    const transporter = await nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: `${process.env.EMAIL_ADDRESS}`,
        pass: `${process.env.APP_PASS || process.env.EMAIL_PASSWORD}`,
      },
    });
    // const URL = `https://discountbazar.netlify.app/customer/verify?token=${user._id} `;
    const URL = `http://localhost:${process.env.PORT || 5000}/customer/verify?token=${user._id} `;
    readHTMLFile(
      "./templates/emailverification.html",
      async function (err, html) {
        var template = handlebars.compile(html);
        var replacements = {
          name: user.name,
          link: URL,
        };
        var htmlToSend = template(replacements);

        const mailOptions = {
          from: `${process.env.EMAIL_ADDRESS} `,
          to: email,
          subject: "Please confirm account",
          html: htmlToSend,
        };

        await transporter.verify();

        //Send Email
        transporter.sendMail(mailOptions, async (err, response) => {
          console.log(response);
          if (err) {
            res
              .status(500)
              .json({ type: "failure", result: "Server Not Responding" });
            return;
          } else {

            const cus = await user.save();
            if (cus) {
              res.status(200).json({
                type: "success",
                result: "Please verify your email!",
              });
            }
            else {
              res.status(200).json({
                type: "failue",
                result: "Customer Registeration Error",
              });
            }
          }
        });
      }
    );
  } catch (error) {
    console.log(error + "error");
  }
}
exports.Verify = async (req, res) => {
  const Id = req.query.token;
  var user = await Customer.findOne({ _id: Id });
  if (user) {
    if (user.verify == true) {
      return res.redirect(`${process.env.HOST == "localhost" ? "http://localhost:3000" : "https://discountbazar.netlify.app"}`)
    }
    user.verify = true;
    await user.save()
    return res.sendFile(
      path.join(__dirname + "../../templates/emailverified.html")
    );

  }
  else {
    res.json({ type: "failure", result: "Server Not Responding" });
  }

};
exports.OTP = async (req, res) => {
  console.log("object" + req.body.email);
  try {
    var user = await Customer.findOne({ email: req.body.email });
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
  const data = await Customer.findOne({ email: req.body.email });

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
  const user = await Customer.findOne({ email: req.body.email });
  user.password = await Customer.CreateHash(req.body.password);
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
exports.Signin = async (req, res) => {
  try {
    const customer = new Customer({
      email: req.body.email,
      password: req.body.password,
    });
    const Foundcustomer = await Customer.findOne({ email: customer.email });
    console.log(Foundcustomer);

    if (!Foundcustomer) {
      res.json({ type: "failure", result: "No User With Such Email Exists" });
    } else {
      if (Foundcustomer.hide === true) {
        return res.json({
          type: "failure",
          result: "Account has been deleted",
        });
      }
      if (Foundcustomer.verify === false) {
        return res
          .status(401)
          .json({ type: "failureEmail", result: "Email is not verified" });
      }
      const isEqual = await Customer.isPasswordEqual(
        customer.password,
        Foundcustomer.password
      );
      if (isEqual) {
        res.status(200).json({
          type: "success",
          result: "Customer Logged In Successfully",
          customer: {
            _id: Foundcustomer._id,
            name: Foundcustomer.name,
            phone: Foundcustomer.phone,
            email: Foundcustomer.email,
            address: Foundcustomer.address,
            image: Foundcustomer.image,
            cards: Foundcustomer.cards,
            favouriteVendors: Foundcustomer.favouriteVendors,
          },
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

exports.Update = async (req, res) => {
  try {
    const customer = req.body
    const Foundcustomer = await Customer.findOne({ email: customer.email });
    console.log(Foundcustomer);

    if (!Foundcustomer) {
      res.json({ type: "failure", result: "No User With Such Email Exists" });
    } else {
      if (Foundcustomer.hide === true) {
        return res.json({
          type: "failure",
          result: "Account has been deleted",
        });
      }
      if (Foundcustomer.verify === false) {
        return res
          .status(401)
          .json({ type: "failureEmail", result: "Email is not verified" });
      }
      Foundcustomer = req.body;
      await Foundcustomer.save()
      if (isEqual) {

        if (req.body.image) {
          const filename = Foundcustomer.image;
          if (fs.existsSync(filename)) {
            fs.unlinkSync(filename);
            console.log(`${filename} deleted successfully`);
          } else {
            console.log(`${filename} does not exist`);
          }
        }

        res.status(200).json({
          type: "success",
          result: "Customer Logged In Successfully",
          customer: {
            id: Foundcustomer._id,
            name: Foundcustomer.name,
            phone: Foundcustomer.phone,
            email: Foundcustomer.email,
            address: Foundcustomer.address,
            image: Foundcustomer.image,
            cards: Foundcustomer.cards,
            favouriteVendors: Foundcustomer.favouriteVendors,
          },
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

exports.GetCustomer = async (req, res) => {
  try {
    const customer_id = req.query.customerId;

    const customer = await Customer.findById(customer_id);

    if (!customer) {
      res
        .status(500)
        .json({ type: "failure", result: "Server not Responding. Try Again" });
    } else {
      res.json({ type: "success", result: customer });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ type: "failure", result: "Server not Responding. Try Again" });
  }
};

exports.GetLocationsForVendorsAndEvents = async (req, res) => {
  try {
    const currentLat = req.query.lat;
    const currentLon = req.query.lon;
    const events = await Event.find({ completeStatus: true }).lean();
    const vendors = await Vendor.find({
      completeStatus: true,
      status: "Accepted",
    }).lean();
    const nearByVendors = await vendors.filter((vendor) => {
      const distance = Haversine.CalculateDistance(
        currentLat,
        currentLon,
        vendor.latitude,
        vendor.longitude
      );

      vendor["distance"] = distance;
      return vendor;
    });
    const nearByEvents = await events.filter((event) => {
      const distance = Haversine.CalculateDistance(
        currentLat,
        currentLon,
        event.latitude,
        event.longitude
      );

      event["distance"] = distance;
      return event;
    });
    const data = [...nearByEvents, ...nearByVendors];
    res.status(200).json({ type: "success", result: data });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ type: "failure", result: "Server not Responding. Try Again" });
  }
};

exports.GetLocationsForVendorsAndEventsNearby = async (req, res) => {
  try {
    const currentLat = req.query.lat;
    const currentLon = req.query.lon;
    const events = await Event.find({ completeStatus: true }).lean();
    const vendors = await Vendor.find({
      completeStatus: true,
      status: "Accepted",
    }).lean();
    const nearByVendors = await vendors.filter((vendor) => {
      const distance = Haversine.CalculateDistance(
        currentLat,
        currentLon,
        vendor.latitude,
        vendor.longitude
      );
      if (distance <= 20) {
        vendor["distance"] = distance;
        return vendor;
      }
      return false;
    });
    const nearByEvents = await events.filter((event) => {
      const distance = Haversine.CalculateDistance(
        currentLat,
        currentLon,
        event.latitude,
        event.longitude
      );
      if (distance <= 20) {
        event["distance"] = distance;
        return event;
      }
      return false;
    });
    const data = [...nearByEvents, ...nearByVendors];
    res.status(200).json({ type: "success", result: data });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ type: "failure", result: "Server not Responding. Try Again" });
  }
};
exports.OnLogout = async (req, res) => {
  try {
    const customerId = req.query.customerId;
    const response = await Customer.findByIdAndUpdate(customerId, {
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


exports.UpdatePassword = async (req, res) => {
  try {
    console.log(req.query);

    const customerId = req.query.customerId;
    const customerFound = await Customer.findById(customerId);
    const passResponse = await Customer.isPasswordEqual(
      req.body.currentPassword,
      customerFound.password
    );
    console.log("object" + passResponse);
    if (passResponse) {
      customerFound.password = await Customer.CreateHash(req.body.newPassword);
    } else {
      res
        .status(401)
        .json({ type: "failure", result: "Current Password is incorrect" });
      return;
    }
    customerFound
      .save()
      .then(() => {
        res
          .status(200)
          .json({ type: "success", result: "Password has been Changed" });
      })
      .catch((error) => {
        res
          .status(500)
          .json({ type: "failure", result: "Server Not Responding" });
        return;
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ type: "failure", result: "Server Not Responding" });
  }
};
exports.UpdateProfile = async (req, res) => {
  try {
    console.log(req.query);

    const customerId = req.query.customerId;
    const customerFound = await Customer.findById(customerId);
    if (customerFound) {
      customerFound.name = req.body.name;
      customerFound.phone = req.body.phone;

      customerFound
        .save()
        .then(async () => {
          const customerFound2 = await Customer.findById(customerId);

          res.status(200).json({
            type: "success",
            result: "Profile has been updated!",
            data: {
              id: customerFound2._id,
              name: customerFound2.name,
              phone: customerFound2.phone,
              email: customerFound2.email,
              cards: customerFound2.cards,
              favouriteVendors: customerFound2.favouriteVendors,
            },
          });
        })
        .catch((error) => {
          res
            .status(500)
            .json({ type: "failure", result: "Server Not Responding" });
          return;
        });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ type: "failure", result: "Server Not Responding" });
  }
};

exports.MakeFavourite = async (req, res) => {
  try {
    const vendorId = req.body.vendorId;
    const customerId = req.body.customerId;
    const response = await Customer.find({ favouriteVendors: vendorId });
    if (response.length > 0) {
      res
        .status(500)
        .json({ type: "failure", result: "Vendor Already Favourited" });
    } else {
      await Customer.findByIdAndUpdate(customerId, {
        $push: { favouriteVendors: [vendorId] },
      });
      res.status(200).json({ type: "success", result: "Vendor Favourited" });
    }
  } catch (error) {
    res.status(500).json({ type: "failure", result: "Server Not Responding" });
  }
};

exports.MakeUnFavourite = async (req, res) => {
  try {
    const vendorId = req.body.vendorId;
    const customerId = req.body.customerId;
    await Customer.findByIdAndUpdate(customerId, {
      $pullAll: { favouriteVendors: [vendorId] },
    });
    res.status(200).json({ type: "success", result: "Vendor UnFavourited" });
  } catch (error) {
    res.status(500).json({ type: "failure", result: "Server Not Responding" });
  }
};



exports.GetCustomers = async (req, res) => {
  try {
    const response = await Customer.find();
    res.status(200).json({ type: "success", result: response });
  } catch (error) {
    console.log(error);
    res.status(500).json({ type: "failure", result: "Server Not Responding" });
  }
};
exports.DeleteCustomerAccount = async (req, res) => {
  try {
    console.log(req.query);
    const response = await Customer.findByIdAndUpdate(req.query.id, {
      $set: { hide: true },
    });
    if (!response) {
      res
        .status(500)
        .json({ type: "failure", result: "Server not Responding. Try Again" });
      return;
    }

    res.status(200).json({
      type: "success",
      result: "Yor account has been deleted successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ type: "failure", result: "Server not Responding. Try Again" });
  }
};
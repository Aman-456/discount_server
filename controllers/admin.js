const Admin = require("../models/admin");
const Order = require("../models/orders");
const Vendor = require("../models/vendor");
const JWT = require("jsonwebtoken");
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
    const credientials = new Admin({
      email: req.query.email,
      password: req.query.password,
    });
    const admin = await Admin.findOne({ email: credientials.email });
    if (!admin) {
      res
        .status(200)
        .json({ type: "failure", result: "No User With Such Email Exists" });
    } else {
      const isEqual = await Admin.isPasswordEqual(
        credientials.password,
        admin.password
      );
      if (isEqual) {
        const token = await JWT.sign({ username: admin.name }, JWT_SECRET_KEY);
        res.status(200).json({
          type: "success",
          result: "Admin Login Successfully",
          token: token,
          id: admin._id,
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
exports.Contact = async (req, res) => {
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

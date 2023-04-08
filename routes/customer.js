const express = require("express");

const customerController = require("../controllers/customer");
const customerMulter = require("../middlewares/customerMulter");
const router = express.Router();

router.post(
  "/signup",
  customerMulter.upload.single("image"),
  customerController.Signup
);
router.get("/verify", customerController.Verify);
router.post("/otpsend", customerController.OTP);
router.post("/verifyotp", customerController.verifyOTP);
router.post("/passwordchange", customerController.changePassword);
router.post("/signin", customerController.Signin);
router.post("/update", customerController.Update);
router.post("/getCustomer", customerController.GetCustomer);

router.post("/makeFavourite", customerController.MakeFavourite);
router.post("/makeUnFavourite", customerController.MakeUnFavourite);

router.get("/getCustomers", customerController.GetCustomers);
router.get("/deletecustomeraccount", customerController.DeleteCustomerAccount);
router.put("/updateProfile", customerController.UpdateProfile);
router.put("/updatePassword", customerController.UpdatePassword);

exports.routes = router;

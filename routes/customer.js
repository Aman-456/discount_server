const express = require("express");

const customerController = require("../controllers/customer");
const customerHandler = require("../handlers/customer");
const customerMulter = require("../middlewares/customerMulter");
const router = express.Router();

router.post(
  "/signup",
  // customerHandler.customerHandler,
  customerMulter.upload.single("image"),
  customerController.Signup
);
router.get("/verify", customerController.Verify);
router.post("/otpsend", customerController.OTP);
router.post("/verifyotp", customerController.verifyOTP);
router.post("/passwordchange", customerController.changePassword);
router.get("/signin", customerController.Signin);
router.post("/getCustomer", customerController.GetCustomer);
router.get("/getLocations", customerController.GetLocationsForVendorsAndEvents);
router.get(
  "/getLocationsnearby",
  customerController.GetLocationsForVendorsAndEventsNearby
);

router.get("/onLogout", customerController.OnLogout);
router.post("/makeFavourite", customerController.MakeFavourite);
router.post("/makeUnFavourite", customerController.MakeUnFavourite);

router.get("/getCustomers", customerController.GetCustomers);
router.get("/deletecustomeraccount", customerController.DeleteCustomerAccount);
router.post("/insertCard", customerController.InsertCard);
router.put("/updateProfile", customerController.UpdateProfile);
router.put("/updatePassword", customerController.UpdatePassword);

exports.routes = router;

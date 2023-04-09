const express = require("express");

const adminHandler = require("../handlers/admin");

const adminController = require("../controllers/admin");


const router = express.Router(); 

router.post("/signup", adminHandler.adminHandler, adminController.Signup);
router.post("/signin", adminController.Signin);
router.get("/dashboard", adminController.Dashboard);

router.post("/otpsend", adminController.OTP);
router.post("/verifyotp", adminController.verifyOTP);
router.post("/passwordchange", adminController.changePassword);

router.post("/contact", adminController.Contact);
router.get("/getcontacts", adminController.getContact);
router.get("/getvendorsrequests", adminController.GetPendingVendors);

router.post("/updatestatus", adminController.UpdateVendor);
router.get("/getvendors", adminController.GetVendors);
router.get("/getusers", adminController.GetUsers);
router.post("/deleteuser", adminController.DeleteUser);
router.get("/getnotices", adminController.GetNotices);
router.post("/completenotice", adminController.NoticeComplete);

exports.routes = router;

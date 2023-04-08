const express = require("express");

const adminHandler = require("../handlers/admin");

const adminController = require("../controllers/admin");


const router = express.Router();

router.post("/signup", adminHandler.adminHandler, adminController.Signup);
router.get("/signin", adminController.Signin);
router.get("/dashboard", adminController.Dashboard);

router.post("/otpsend", adminController.OTP);
router.post("/verifyotp", adminController.verifyOTP);
router.post("/passwordchange", adminController.changePassword);

router.post("/contact", adminController.Contact);
router.get("/getcontacts", adminController.getContact);

exports.routes = router;

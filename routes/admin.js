const express = require("express");

const adminHandler = require("../handlers/admin");

const adminController = require("../controllers/admin");

const Authenticator = require("../middlewares/authenticate");

const router = express.Router();

router.post("/signup", adminHandler.adminHandler, adminController.Signup);
router.get("/signin", adminController.Signin);
router.get("/dashboard", adminController.Dashboard);
router.get("/contact", adminController.Contact);

exports.routes = router;

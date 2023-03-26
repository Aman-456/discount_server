const express = require("express");

const applicationController = require('../controllers/application');

var Authenticator = require("../middlewares/authenticate");

const router = express.Router();

router.post("/addApplication", Authenticator.athenticate, applicationController.AddApplication);
router.get("/getApplications", Authenticator.athenticate, applicationController.GetApplications);
router.get("/getApplicationsByVendor", Authenticator.athenticate, applicationController.GetApplicationsByVendor);
router.post("/sendInvoice", Authenticator.athenticate, applicationController.SendInvoice);

exports.routes = router;

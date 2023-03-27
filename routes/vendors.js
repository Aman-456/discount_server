const express = require("express");

const vendorHandler = require("../handlers/vendor");

const vendorControllers = require("../controllers/vendors");

const Authenticator = require("../middlewares/authenticate");
const MulterMiddleware = require("../middlewares/VendorMulter");
const router = express.Router();

router.post("/signup", vendorHandler.vendorHandler, vendorControllers.Signup);

router.post("/googleOauth", vendorControllers.OauthGoogle);
router.post("/facebookOauth", vendorControllers.OauthFacebook);

router.get("/signin", vendorControllers.Signin);
router.get("/changepassword", vendorControllers.ChangePassword);
router.get("/getNearByVendors", vendorControllers.GetNearByVendors);
router.get(
  "/getPendingVendors",
  Authenticator.athenticate,
  vendorControllers.GetPendingVendors
);
router.put("/updateStatus", vendorControllers.UpdateStatus);
router.put("/updateStatusblock", vendorControllers.UpdateStatusBlock);
router.post("/updateStatusdelete", vendorControllers.DeleteVendor);

router.put(
  "/updateVendor",
  MulterMiddleware.upload,
  vendorControllers.UpdateVendor
);
router.post("/updateVendorMap", vendorControllers.UpdateVendorMap);
router.get(
  "/getVendor",
  // Authenticator.athenticate,
  vendorControllers.GetVendor
);

router.post(
  "/statusUpdated",
  Authenticator.athenticate,
  vendorControllers.UpdateOnlineStatus
);
router.get("/getvendors", vendorControllers.GetVendors);
router.get("/onLogout", vendorControllers.OnLogout);
router.post("/connectpay", vendorControllers.ConnectPay);
router.post("/connectcomplete", vendorControllers.ConnectComplete);
router.post("/connectrefresh", vendorControllers.ConnectRefresh);

router.get("/sendotp", vendorControllers.OTP);
router.post("/verifyotp", vendorControllers.verifyOTP);
router.post("/changepassword", vendorControllers.changePassword);
router.post("/getpayvalues", vendorControllers.getPayValues);
router.post(
  "/getOrderswithtotalearning",
  vendorControllers.GetOrderswithTotalEarning
);
exports.routes = router;

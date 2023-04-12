const express = require("express");

const vendorControllers = require("../controllers/vendors");

const Authenticator = require("../middlewares/authenticate");
const MulterMiddleware = require("../middlewares/VendorMulter");
const router = express.Router();

router.post("/signup",
  MulterMiddleware.upload.single("image"),
  vendorControllers.Signup
);


router.post("/signin", vendorControllers.Signin);
router.get("/changepassword", vendorControllers.ChangePassword);
router.get("/getNearByVendors", vendorControllers.GetNearByVendors);

router.post(
  "/updateVendor",
  MulterMiddleware.upload.single("image"),
  vendorControllers.UpdateVendor
);
router.post("/updateVendorMap", vendorControllers.UpdateVendorMap);
router.post(
  "/getVendor",
  vendorControllers.GetVendor
);

router.post(
  "/statusUpdated",
  Authenticator.athenticate,
  vendorControllers.UpdateOnlineStatus
);
router.get("/getvendors", vendorControllers.GetVendors);
router.get("/onLogout", vendorControllers.OnLogout);

router.post("/otpsend", vendorControllers.OTP);
router.post("/verifyotp", vendorControllers.verifyOTP);
router.post("/passwordchange", vendorControllers.changePassword);
router.post(
  "/getOrderswithtotalearning",
  vendorControllers.GetOrderswithTotalEarning
);
exports.routes = router;

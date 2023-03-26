const express = require("express");

const notificationControllers = require("../controllers/notifications");

const Authenticator = require("../middlewares/authenticate");
const router = express.Router();

router.get(
  "/getNotificationsByVendor",
  Authenticator.athenticate,
  notificationControllers.GetNotificationsByVendor
);
router.get("/actionOnOrder", notificationControllers.OrderAcceptOrReject);
router.get("/actionOnOrdercancel", notificationControllers.OrderCancel);
router.get("/testorder", notificationControllers.TestOrderNotification);
router.get("/testnotification", notificationControllers.TestNotification);
router.get("/testnotification2", notificationControllers.TestNotification2);
router.get(
  "/sendTimeNotification",
  notificationControllers.SendTimeNotification
);
router.get(
  "/getCustomerNotifications",
  notificationControllers.GetNotficationsForCustomer
);
router.get(
  "/getCustomerNotificationsCount",
  notificationControllers.GetNotficationsForCustomerCount
);
exports.routes = router;

const express = require("express");

// const paypalController = require('../controllers/paypal');
const stripeController = require("../controllers/stripe");
const orderController = require("../controllers/order");

const router = express.Router();

// router.post("/paypal", paypalController.PaypalPayment);
// router.get("/success", paypalController.SuccessPaypal);
// router.get("/cancel", paypalController.CancelPaypal);

router.post("/stripe", stripeController.StripePayment);
router.get("/getOrder", orderController.GetOrder);
router.get("/getallOrders", orderController.GetAllOrder);
router.get("/getOrdersByVendor", orderController.GetOrdersByVendorForMobile);
router.get("/getOrdersByVendorW", orderController.GetOrdersByVendorForWebsite);
router.get("/getVendorByEarning", orderController.GetVendorByEarning);
router.get("/getUserOrders", orderController.GetUserOrders);
router.get("/getUserOrdersDeliver", orderController.GetUserOrdersDelivered);
router.put("/review", orderController.GiveReview);
router.put(
  "/updatereviewnotification",
  orderController.UpdateReviewNotification
);
router.get("/getReviewsByVendor", orderController.GetReviewsByVendor);
router.get("/getDeliveredOrders", orderController.GetDeliveredOrdersByVendor);
router.put("/orderDelivered", orderController.OrderDelivered);

exports.routes = router;

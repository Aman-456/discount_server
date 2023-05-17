const express = require("express");
const router = express.Router();
const checkoutController = require("../controllers/checkout");

router.post("/add", checkoutController.addItem);
router.post("/checkoutaccept", checkoutController.checkoutaccept);
router.delete("/delete", checkoutController.deleteItem);
router.post("/get", checkoutController.getCheckout);

exports.routes = router;

const express = require("express");
const router = express.Router();
const checkoutController = require("../controllers/checkout");

router.post("/add", checkoutController.addItem);
// router.post("/update", cartController.updateItem);
router.delete("/delete", checkoutController.deleteItem);
router.get("/get", checkoutController.getCart);

exports.routes = router;
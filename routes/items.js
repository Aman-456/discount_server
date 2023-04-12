const express = require("express");


const itemController = require("../controllers/items");

var Authenticator = require("../middlewares/authenticate");
var MultipartData = require("../middlewares/ItemMulter");
var Resizer = require("../middlewares/ResizeImage");

const router = express.Router();

router.post(
  "/addItem",
  MultipartData.upload.single("image"),
  Resizer.ResizeImage,
  itemController.AddItem
);
router.get("/getItem", Authenticator.athenticate, itemController.GetItem);
router.post("/getItemsByVendor", itemController.GetItemsByVendor);

router.post("/deleteItem", itemController.DeleteItem);
router.post(
  "/updateItem",
  MultipartData.upload.single("image"),
  Resizer.ResizeImage,
  itemController.UpdateItem
);

exports.routes = router;

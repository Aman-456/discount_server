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
router.get("/getItemsByVendor", itemController.GetItemsByVendor);

router.delete("/deleteItem", itemController.DeleteItem);
router.put(
  "/updateItem",
  MultipartData.upload.single("image"),
  Authenticator.athenticate,
  Resizer.ResizeImage,
  itemController.UpdateItem
);
router.put(
  "/updateItemWithoutImage",
  Authenticator.athenticate,
  itemController.UpdateItemWithoutImage
);

exports.routes = router;

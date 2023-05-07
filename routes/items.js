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
router.post("/getItem", itemController.GetItem);
router.get("/getlatestsix", itemController.GetLatest6);
router.post("/getItemsByVendor", itemController.GetItemsByVendor);
router.get("/getfeatured", itemController.GetFeaturedProducts);
router.get("/getall", itemController.GetAll);
router.post("/addtofav", itemController.AddItemtoFav);
router.post("/removefromfav", itemController.RemoveItemfromFav);
router.post("/deleteItem", itemController.DeleteItem);
router.post(
  "/updateItem",
  MultipartData.upload.single("image"),
  Resizer.ResizeImage,
  itemController.UpdateItem
);

exports.routes = router;

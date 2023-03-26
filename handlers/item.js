const { body } = require("express-validator");

exports.itemHandler = [
  body("name").notEmpty().withMessage("Name is Missing"),
  body("price")
    .notEmpty()
    .withMessage("Price is Missing")
    .isNumeric()
    .withMessage("Price should be a number"),
  body("description").notEmpty().withMessage("Description is Missing"),
  body("discount")
    .notEmpty()
    .withMessage("Discount is Missing")
    .isNumeric()
    .withMessage("Discount should be in number"),
  body("category").notEmpty().withMessage("Category is Missing"),
];

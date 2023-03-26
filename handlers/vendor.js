const { body } = require("express-validator");

exports.vendorHandler = [
  body("name").notEmpty().withMessage("Name is Missing").isLength({ min: 1, max: 30 }).withMessage("Name length Should be between 1 to 30 Character Long"),
  body("email").notEmpty().withMessage("Email is Missing").isEmail().withMessage("Invalid Email Format"),
];
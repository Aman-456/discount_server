const { body } = require("express-validator");

exports.customerHandler = [
    body("email").notEmpty().withMessage("Email is Missing").isEmail().withMessage("Invalid Email Format"),
    body("password").notEmpty().withMessage("Password is Missing").isLength({ min: 8, max: 20 }).withMessage("Password length Should be between 8 to 20 Character Long"),
    body("phone").notEmpty().withMessage("Phone is Missing"),
    body("name").notEmpty().withMessage("Name is Missing"),
    body("image").custom((value, { req }) => {
        if (!req.file) {
            throw new Error("Image is Missing");
        }
        return true;
    })
];

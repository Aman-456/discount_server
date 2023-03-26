const { body } = require("express-validator");

exports.eventHandler = [
    body("name").notEmpty().withMessage("Name is Missing"),
    body("startDate").notEmpty().withMessage("Name is Missing"),
    body("startTime").notEmpty().withMessage("Name is Missing"),
    body("startTime").notEmpty().withMessage("Name is Missing"),
    body("endTime").notEmpty().withMessage("Name is Missing"),
    body("capacity").isNumeric().withMessage("Capacity must be a Number"),
];

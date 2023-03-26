const express = require("express");

const messageBirdController = require('../controllers/messagebird');

const router = express.Router();
router.post("/sendMessage", messageBirdController.SendMessage);
router.get("/verifyMessage", messageBirdController.OnVerifyMessage);

exports.routes = router;

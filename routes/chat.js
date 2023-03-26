const express = require("express");

const chatController = require('../controllers/chat');

const router = express.Router();

router.post("/sendMessage", chatController.SendMessage);
router.post("/getChat", chatController.GetGet);
router.post("/getAllChats", chatController.GetAllChats);

exports.routes = router;
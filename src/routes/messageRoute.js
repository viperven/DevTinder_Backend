//user routes
const express = require("express");
const router = express.Router();

const { userAuth } = require("../middlewares/auth");
const {sendMessage,getConversations,fetchAllMessages} = require("../controller/messageController");

router.post("/send", userAuth, sendMessage);
router.get("/conversations", userAuth, getConversations);
router.get("/allMessage", userAuth, fetchAllMessages);

module.exports = router;

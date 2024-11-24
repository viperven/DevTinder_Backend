//user routes
const express = require("express");
const router = express.Router();

const { userAuth } = require("../middlewares/auth");
const { send, review } = require("../controller/connectionController");

router.post("/send/:status/:receiverID", userAuth, send);
router.post("/review/:status/:senderID", userAuth, review);

module.exports = router;

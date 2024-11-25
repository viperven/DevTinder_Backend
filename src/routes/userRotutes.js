//user routes
const express = require("express");
const router = express.Router();

const { userAuth } = require("../middlewares/auth");
const { received, connections, feed } = require("../controller/userController");

router.post("/received", userAuth, received);
router.post("/connections", userAuth, connections);
router.get("/feed", userAuth, feed);

module.exports = router;

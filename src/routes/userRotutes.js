//user routes
const express = require("express");
const router = express.Router();

const { userAuth } = require("../middlewares/auth");
const { received, connections } = require("../controller/userController");

router.post("/received", userAuth, received);
router.post("/connections", userAuth, connections);

module.exports = router;

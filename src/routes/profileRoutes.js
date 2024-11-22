//user routes
const express = require("express");
const router = express.Router();

const { userAuth } = require("../middlewares/auth");
const { view } = require("../controller/profileController");

router.get("/view", userAuth, view);

module.exports = router;

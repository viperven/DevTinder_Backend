//user routes
const express = require("express");
const router = express.Router();

const { createNewUser } = require("../controller/userController");
const { signUp } = require("../controller/authController");

// router.post("/create-user", createNewUser);
router.post("/signup", signUp);

module.exports = router;

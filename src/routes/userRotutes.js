//user routes
const express = require("express");
const router = express.Router();

const { createNewUser } = require("../controller/userController");

router.post("/create-user", createNewUser);

module.exports = router;

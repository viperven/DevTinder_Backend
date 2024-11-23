//user routes
const express = require("express");
const router = express.Router();

const { userAuth } = require("../middlewares/auth");
const { view, edit } = require("../controller/profileController");

router.get("/view", userAuth, view);
router.patch("/edit", userAuth, edit);

module.exports = router;

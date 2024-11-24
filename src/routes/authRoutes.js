//user routes
const express = require("express");
const router = express.Router();

const {
  signUp,
  login,
  logout,
  forgetPassword,
} = require("../controller/authController");

router.post("/signup", signUp);
router.post("/login", login);
router.get("/logout", logout);
router.post("/updatePassword", forgetPassword);

module.exports = router;

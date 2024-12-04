//user routes
const express = require("express");
const router = express.Router();

const { userAuth } = require("../middlewares/auth");
const {
  received,
  connections,
  feed,
  ignore,
} = require("../controller/userController");

router.get("/received", userAuth, received);
router.post("/connections", userAuth, connections);
router.get("/feed", userAuth, feed);
router.get("/ignore", userAuth, ignore);

module.exports = router;

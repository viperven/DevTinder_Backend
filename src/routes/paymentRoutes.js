//user routes
const express = require("express");
const router = express.Router();

const {
  razorpayPaymentWebhook,
  createOrder,
} = require("../controller/paymentController");

router.post("/razorpay-webhook", razorpayPaymentWebhook);
router.post("/create-order", createOrder);

module.exports = router;

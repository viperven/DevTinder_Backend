const express = require("express");
const Razorpay = require("razorpay");
const paymentModel = require("../models/payment");
require("dotenv").config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

const razorpayPaymentWebhook = async (req, res) => {
  console.log("Webhook called........:");
  const webhookSecret = process.env.RAZORPAY_SECRET; // set when adding webhook in Razorpay dashboard

  const crypto = require("crypto");
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(req.rawBody)
    .digest("hex");

  const receivedSignature = req.headers["x-razorpay-signature"];

  if (expectedSignature === receivedSignature) {
    const event = req.body;

    if (event.event === "payment.captured") {
      const paymentId = event.payload.payment.entity?.id;
      const orderId = event.payload.payment.entity?.order_id;
      const amount = event.payload.payment.entity?.amount;
      const plan = event.payload?.payment?.entity?.notes?.plan;
      const userId = event.payload?.payment?.entity?.notes?.userId;
      console.log(event.payload?.payment?.entity);
      console.log("✅ Payment captured:", {
        paymentId,
        orderId,
        amount,
        plan,
        userId,
      });

      let status = "pending";
      if (event.event === "payment.captured") {
        status = "completed";
      } else if (event.event === "payment.failed") {
        status = "failed";
      }

      const savePaymentDetails = await paymentModel.create({
        userId: userId,
        plan,
        amount,
        paymentDate: new Date(),
        paymentId,
        orderId,
        paymentMethod: "razorpay",
        status,
      });

      console.log("✅ Payment saved:", savePaymentDetails);
      res.status(200).json({ status: "ok" });
    } else {
      console.warn("❌ Invalid signature!");
      res.status(400).send("Invalid signature");
    }
  }
};

const createOrder = async (req, res) => {
  try {
    const { amount, plan, userId } = req.body;

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_order_${Math.random() * 1000}`,
      notes: { plan, userId },
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong");
  }
};

module.exports = { razorpayPaymentWebhook, createOrder };

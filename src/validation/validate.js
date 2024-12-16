const User = require("../models/user");
const Connection = require("../models/connection");
const validator = require("validator");
const mongoose = require("mongoose");

//signup validation

const validateSignUpData = (req) => {
  const { email, password, userOtp } = req.body;

  if (!email || !password) {
    const customError = new Error("Please provide both email and password!");
    customError.statusCode = 400;
    throw customError;
  }

  if (!validator.isEmail(email)) {
    const customError = new Error("Invalid email address !");
    customError.statusCode = 400;
    throw customError;
  }

  if (!userOtp) {
    const customError = new Error("OTP is madatory !");
    customError.statusCode = 400;
    throw customError;
  }
  // if (
  //   !validator.isStrongPassword(password, {
  //     minLength: 8,
  //     minLowercase: 1,
  //     minUppercase: 1,
  //     minNumbers: 1,
  //   })
  // ) {
  //   throw new Error(
  //     "Password is not strong required one capital,small letter ,number of minimum of 8 digit."
  //   );
  // }
};

const validateLoginData = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    const customError = new Error("Please provide both email and password!");
    customError.statusCode = 400;
    throw customError;
  }

  if (!validator.isEmail(email)) {
    const customError = new Error("Invalid email address.");
    customError.statusCode = 400; // Bad Request
    throw customError;
  }
};

const validateOtpData = (req) => {
  const { emailId, newPassword, step } = req.body;

  if (!emailId || !newPassword) {
    throw new Error("Please provide both email and newPassword !");
  }

  if (!validator.isEmail(emailId)) {
    throw new Error("Invalid email address.");
  }

  // if (
  //   !validator.isStrongPassword(password, {
  //     minLength: 8,
  //     minLowercase: 1,
  //     minUppercase: 1,
  //     minNumbers: 1,
  //   })
  // ) {
  //   throw new Error(
  //     "Password is not strong required one capital,small letter ,number of minimum of 8 digit."
  //   );
  // }
};

const validateSendMessageData = async (req) => {
  const user = req.user;
  const senderID = new mongoose.Types.ObjectId(user._id);
  const { receiverID } = req.body;

  if (!senderID || !receiverID) {
    const customError = new Error("Sender and Receiver are required !");
    customError.statusCode = 400; // Bad Request
    throw customError;
  }

  const isReceiverConnection = await Connection.findOne({
    $or: [
      { senderID: senderID, receiverID: receiverID, status: "accepted" },
      { senderID: receiverID, receiverID: senderID, status: "accepted" },
    ],
  });

  if (!isReceiverConnection) {
    const customError = new Error(
      "Receiver does not exist or is not your connection !"
    );
    customError.statusCode = 400; // Bad Request
    throw customError;
  }
};

const validateGetAllMessageById = async (req) => {
  const { receiverId } = req.query;

  const user = req.user;
  const loggedInUser = new mongoose.Types.ObjectId(user._id);

  if (!receiverId || !validator.isMongoId(receiverId.toString())) {
    const customError = new Error("Invalid mongoid not presenet or invalid.");
    customError.statusCode = 400;
    throw customError;
  }

  const connectionExists = await Connection.findOne({
    $or: [
      { senderID: loggedInUser, receiverID: receiverId, status: "accepted" },
      { senderID: receiverId, receiverID: loggedInUser, status: "accepted" },
    ],
  });

  if (!connectionExists) {
    const customError = new Error("sender and receiver must be friends.");
    customError.statusCode = 400;
    throw customError;
  }
};

module.exports = {
  validateSignUpData,
  validateLoginData,
  validateOtpData,
  validateSendMessageData,
  validateGetAllMessageById,
};

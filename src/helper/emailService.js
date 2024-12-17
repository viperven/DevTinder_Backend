const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.email_user,
    pass: process.env.email_password,
  },
});

const sendSignUpMail = async (receiverMailId, receiverName = "user") => {
  const mailOptions = {
    from: process.env.email_user,
    to: receiverMailId,
    subject: "Welcome to Dev Tinder Family...",
    text:
      "Hi " +
      receiverName +
      " my name is Rupesh Jha We are glad to have you in the Developers community. Thank you " +
      receiverName +
      " for signing up! ",
  };
  try {
    const info = transporter.sendMail(mailOptions); // No manual promise wrapping needed
    return "Email sent: " + info.response;
  } catch (error) {
    throw new Error("Error occurred: " + error.message);
  }
};

const sendOTPMail = async (receiverMailId, otp) => {
  const mailOptions = {
    from: process.env.email_user,
    to: receiverMailId,
    subject: "OTP for signup",
    text: `Yout OTP is ${otp} and valid only for 10 minutes ... Dev Tinder`,
  };
  try {
    const info = await transporter.sendMail(mailOptions); // No manual promise wrapping needed
    return "Email sent: " + info.response;
  } catch (error) {
    throw new Error("Error occurred: " + error.message);
  }
};

const sendDeleteOTPMail = async (receiverMailId, otp) => {
  const mailOptions = {
    from: process.env.email_user,
    to: receiverMailId,
    subject: "Attention Your Account will be permanently deleted",
    text: `Yout OTP is ${otp} and valid only for 10 minutes ... Dev Tinder`,
  };
  try {
    const info = await transporter.sendMail(mailOptions); // No manual promise wrapping needed
    return "Email sent: " + info.response;
  } catch (error) {
    throw new Error("Error occurred: " + error.message);
  }
};

module.exports = { sendSignUpMail, sendOTPMail, sendDeleteOTPMail };

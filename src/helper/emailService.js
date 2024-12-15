const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.email_user,
    pass: process.env.email_password,
  },
});

const sendSignUpMail = async (receiverMailId) => {
  const mailOptions = {
    from: process.env.email_user,
    to: receiverMailId,
    subject: "Welcome to Dev Tinder Family...",
    text: "Hi, my name is Rupesh Jha. Thank you for signing up! We are glad to have you in the Developers community.",
  };

  try {
    const info = await transporter.sendMail(mailOptions); // No manual promise wrapping needed
    return "Email sent: " + info.response;
  } catch (error) {
    throw new Error("Error occurred: " + error.message);
  }
};

module.exports = { sendSignUpMail };

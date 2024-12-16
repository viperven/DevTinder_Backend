const OTP = require("../models/otp");

const generateRandomNumber = (length = 1) => {
  let num = "";
  for (let i = 0; i < length; i++) {
    num = num + Math.floor(Math.random() * 10); // 0 to 9;
  }
  return num;
};

//otp is not valid after 10 minutes
const checkOtpExpire = (dateString) => {
  const givenTime = new Date(dateString?.toString());
  const tenMinutesLater = new Date(givenTime?.getTime() + 10 * 60 * 1000); // 10 minutes
  const currentTime = new Date();
  return currentTime > tenMinutesLater; // true if OTP is still valid
};

//generate otp with email id ans store in db
const generateOtpAndStore = async (emailID) => {
  if (!emailID) {
    return "emailID is mandatory";
  }
  let otp = await OTP.findOneAndUpdate(
    { emailId: emailID },
    { otp: generateRandomNumber(4), createdAt: new Date() },
    { upsert: true, new: true }
  );
  return otp;
};

module.exports = { generateRandomNumber, checkOtpExpire, generateOtpAndStore };

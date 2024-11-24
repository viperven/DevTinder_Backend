const generateRandomNumber = (length = 1) => {
  let num = "";
  for (let i = 0; i < length; i++) {
    num = num + Math.floor(Math.random() * 10); // 0 to 9;
  }
  return num;
};

//otp is not valid after 10 minutes
const checkOtpExpire = (dateString) => {
  const givenTime = new Date(dateString.toString());
  const tenMinutesLater = new Date(givenTime.getTime() + 10 * 60 * 1000); // 10 minutes
  const currentTime = new Date();

  return currentTime <= tenMinutesLater; // true if OTP is still valid
};

module.exports = { generateRandomNumber, checkOtpExpire };

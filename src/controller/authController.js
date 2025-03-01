//user controller.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const OTP = require("../models/otp");
const {
  validateSignUpData,
  validateLoginData,
  validateOtpData,
} = require("../validation/validate");
const {
  generateRandomNumber,
  checkOtpExpire,
  generateOtpAndStore,
} = require("../helper/commonFunction");

const Connection = require("../models/connection");
const Conversation = require("../models/conversations");
const Message = require("../models/message");
const {
  sendSignUpMail,
  sendOTPMail,
  sendDeleteOTPMail,
} = require("../helper/emailService");

//send otp for registration
const sendOtp = async (req, res) => {
  try {
    const { emailID } = req.body;

    if (!emailID) {
      res
        .status(400)
        .send({ isSuccess: false, message: "email id is required" });
    }
    const isEmailIdExists = await User.findOne({ emailId: emailID });

    if (isEmailIdExists) {
      return res.status(400).send({
        isSuccess: false,
        message: "email id already exists.",
      });
    }

    const otp = await generateOtpAndStore(emailID);
    await sendOTPMail(emailID, otp?.otp);
    res.status(200).send({
      isSuccess: true,
      message: "OTP sent succesfully.",
    });
  } catch (err) {
    console.log(err?.message);
    if (err.statusCode === 400) {
      return res.status(err.statusCode).json({
        isSuccess: false,
        message: err.message,
        field: err.field, // Optionally include the problematic field
      });
    }

    res.status(500).json({
      isSuccess: false,
      message: "Server error. Please try again later.",
    });
  }
};

const signUp = async (req, res) => {
  try {
    validateSignUpData(req, res); //validating request
    const { name, email, password, userOtp } = req.body;

    const isUserOtpExists = await OTP.findOne({ emailId: email });
    const isOtpExpired = checkOtpExpire(isUserOtpExists?.updatedAt);

    if (!isUserOtpExists || isOtpExpired) {
      return res.status(401).json({
        isSuccess: false,
        message: "user otp not found or expired",
      });
    }

    if (isUserOtpExists.otp !== userOtp) {
      return res.status(401).json({
        isSuccess: false,
        message: "otp mismatch",
      });
    }

    const user = new User({
      firstName: name,
      emailId: email,
      password: password,
    });

    const newUser = await user.save();

    const returnUserInfo = {
      name: newUser.firstName,
      id: newUser._id,
      createAt: newUser.createdAt,
    };

    const token = await newUser.generateAuthToken();
    // res.cookie("token", token, {
    //   expires: new Date(Date.now() + 8 * 3600000),
    // });

    sendSignUpMail(email, name);

    return res.status(200).json({
      isSuccess: true,
      message: "user created sucessfully",
      apiData: returnUserInfo,
      token: token,
    });
  } catch (err) {
    console.error(err.message);

    if (err.statusCode === 400) {
      return res.status(err.statusCode).json({
        isSuccess: false,
        message: err.message,
        field: err.field, // Optionally include the problematic field
      });
    }

    res.status(500).json({
      isSuccess: false,
      message: "Server error. Please try again later.",
    });
  }
};

const login = async (req, res) => {
  try {
    validateLoginData(req, res);

    const { email, password } = req.body;

    const userExists = await User.findOne({ emailId: email });

    if (!userExists) {
      return res.status(400).json({
        isSucess: false,
        message: `User With Email : ${email} not found , please try with different email`,
      });
    }

    const isPasswordMatched = await userExists.validatePassword(password);
    if (!isPasswordMatched) {
      return res.status(400).json({
        isSuccess: false,
        message: `${password} is incorrect password `,
      });
    }

    const token = await userExists.generateAuthToken();

    // res.cookie("token", token, {
    //   expires: new Date(Date.now() + 8 * 3600000),
    // });

    const safeData = {
      id: userExists._id,
      firstName: userExists.firstName,
      lastName: userExists.lastName,
      gender: userExists.gender,
      keySkills: userExists.keySkills,
      summary: userExists.summary,
      location: userExists.location,
      age: userExists.age,
      photoUrl: userExists.photoUrl,
      emailID: userExists.emailID,
    };

    res.status(200).json({
      isSuccess: true,
      message: "logged in sucessfulyy",
      apiData: safeData,
      token: token,
    });
  } catch (err) {
    if (err.statusCode === 400) {
      return res.status(err.statusCode).json({
        isSuccess: false,
        message: err.message,
        field: err.field, // Optionally include the problematic field
      });
    }

    res
      .status(500)
      .json({ isSuccess: false, message: "Internal Server Error" });
  }
};

const logout = async (req, res) => {
  try {
    res.cookie("token", null, {
      expires: new Date(Date.now()),
    });
    res.status(200).json({ isSucess: true, message: "logout sucessfully" });
  } catch (err) {
    console.log(err.message);
  }
};

//can be used for change password as well
const forgetPassword = async (req, res) => {
  try {
    validateOtpData(req);

    const { emailId, newPassword, userOtp, step } = req.body;

    if (!["0", "1"].includes(step)) {
      return res.status(400).json({
        isSuccess: false,
        message: "Invalid step value",
      });
    }

    const userExits = await User.findOne({ emailId: emailId });

    if (!userExits) {
      return res.status(401).json({
        isSuccess: false,
        message: "user not found",
      });
    }

    if (step == 0) {
      await OTP.findOneAndUpdate(
        { emailId: emailId },
        { otp: generateRandomNumber(4), createdAt: new Date() },
        { upsert: true, new: true }
      );
      //code to send otp on mail in async way
      return res
        .status(200)
        .json({ isSuccess: true, message: "otp sended sucessfully" });
    }

    if (step == 1) {
      const isUserOtpExists = await OTP.findOne({ emailId: emailId });
      const isOtpExpired = checkOtpExpire(isUserOtpExists?.updatedAt);

      if (!isUserOtpExists || isOtpExpired) {
        return res.status(401).json({
          isSuccess: false,
          message: "user otp not found or expired",
        });
      }

      if (isUserOtpExists.otp == userOtp) {
        const hashedPassword = await bcrypt.hash(newPassword, 10); // Manually hash the password same as user db
        const updatePassword = await User.findByIdAndUpdate(
          userExits._id,
          { password: hashedPassword },
          { new: true } // Optional: returns the updated document
        );
        return res.status(200).json({
          isSucess: true,
          message: "password chnaged sucessfully",
        });
      }

      return res.status(401).json({
        isSucess: false,
        message: "otp  mismatched",
      });
    }
  } catch (err) {
    console.log(err?.message);

    if (err.statusCode === 400) {
      return res.status(err.statusCode).json({
        isSuccess: false,
        message: err.message,
        field: err.field, // Optionally include the problematic field
      });
    }

    res.status(500).json({
      isSuccess: false,
      message: "Server error. Please try again later.",
    });
  }
};

const sendOtpForDeleteUser = async (req, res) => {
  try {
    const user = req.user;
    const loggedInUser = new mongoose.Types.ObjectId(user._id);

    const userDeatils = await User.findById(loggedInUser);
    const otp = await generateOtpAndStore(userDeatils?.emailId);
    console.log(userDeatils?.emailId);

    await sendDeleteOTPMail(userDeatils?.emailId, otp);
    res.status(200).json({ isSuccess: true, message: "otp send sucessfully" });
  } catch (err) {
    console.log(err?.message);
    res.status(500).json({
      isSuccess: false,
      message: "Server error. Please try again later.",
    });
  }
};

//just take otp and match
const deleteUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    const { userOtp } = req.body;

    if (!user) {
      return res
        .status(400)
        .json({ isSuccess: false, message: "User not found!" });
    }

    if (!userOtp) {
      return res
        .status(400)
        .json({ isSuccess: false, message: "otp is mandatory!" });
    }

    const isUserOtpExists = await OTP.findOne({ emailId: user?.emailId });
    const isOtpExpired = checkOtpExpire(isUserOtpExists?.updatedAt);

    if (!isUserOtpExists || isOtpExpired) {
      return res.status(401).json({
        isSuccess: false,
        message: "user otp not found or expired",
      });
    }

    if (isUserOtpExists.otp !== userOtp) {
      return res.status(401).json({
        isSuccess: false,
        message: "user otp mismatch ",
      });
    }

    // Manually trigger cascade deletions
    await Promise.all([
      Connection.deleteMany({
        $or: [{ senderID: userId }, { receiverID: userId }],
      }),
      Message.deleteMany({
        $or: [{ senderID: userId }, { receiverID: userId }],
      }),
      Conversation.deleteMany({
        $or: [{ senderID: userId }, { receiverID: userId }],
      }),
      User.deleteOne({ _id: userId }),
    ]);

    res
      .status(200)
      .json({ isSuccess: true, message: "User deleted successfully" });
  } catch (err) {
    console.log(err?.message);

    if (err.statusCode === 400) {
      return res.status(err.statusCode).json({
        isSuccess: false,
        message: err.message,
        field: err.field, // Optionally include the problematic field
      });
    }

    res.status(500).json({
      isSuccess: false,
      message: "Server error. Please try again later.",
    });
  }
};

module.exports = {
  signUp,
  login,
  logout,
  forgetPassword,
  deleteUser,
  sendOtp,
  sendOtpForDeleteUser,
};

//user controller.js
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
} = require("../helper/commonFunction");

const Connection = require("../models/connection");
const Conversation = require("../models/conversations");
const Message = require("../models/message");

const signUp = async (req, res) => {
  try {
    validateSignUpData(req, res); //validating request

    const { name, email, password } = req.body;
    const exsistingUser = await User.findOne({ emailId: email });

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

//can be used for chnage password as well
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
        { upsert: true }
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

const deleteUser = async (req, res) => {
  try {
    const userId = req.user._id; // Already validated in middleware
    const user = await User.findById(userId); // Ensure it's a Mongoose document

    if (!user) {
      return res
        .status(400)
        .json({ isSuccess: false, message: "User not found!" });
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

module.exports = { signUp, login, logout, forgetPassword, deleteUser };

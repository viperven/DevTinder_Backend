//user controller.js

const User = require("../models/user");
const {
  validateSignUpData,
  validateLoginData,
} = require("../validation/validate");

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

    const token = await User.generateAuthToken();
    res.cookie("token", token, {
      expires: new Date(Date.now() + 8 * 3600000),
    });

    return res.status(200).json({
      isSucess: true,
      message: "user created sucessfully",
      apiData: returnUserInfo,
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
    res.cookie("token", token, {
      expires: new Date(Date.now() + 8 * 3600000),
    });

    res.status(200).json({
      isSuccess: true,
      message: "logged in sucessfulyy",
      apiData: JSON.stringify(userExists),
    });
  } catch (err) {
    console.log(err.message);

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

module.exports = { signUp, login, logout };

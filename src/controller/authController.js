//user controller.js

const User = require("../models/user");
const { validateSignUpData } = require("../validation/validate");

const signUp = async (req, res) => {
  try {
    validateSignUpData(req, res); //validating request

    const { email, password } = req.body;
    const exsistingUser = User.findOne({ emailId: email });

    if (!exsistingUser) {
      return res.status(400).json({
        isSucess: false,
        message: `User with ${email} already exists`,
      });
    }
    const user = new User({ emailId: email, password: password });
    const newUser = await user.save();
    return res.status(200).json({
      isSucess: true,
      message: "user created sucessfully",
      apiData: newUser,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error" + err);
  }
};

const createNewUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      gender,
      keySkills,
      summary,
      location,
      age,
      emailId,
      password,
      photoUrl,
    } = req.body;

    const user = new User({
      firstName,
      lastName,
      gender,
      keySkills,
      summary,
      location,
      age,
      emailId,
      password,
      photoUrl,
    });

    const savedUser = await user.save();
    const token = await savedUser.generateAuthToken();

    res.cookie("token", token, {
      expires: new Date(Date.now() + 8 * 3600000),
    });

    res
      .status(200)
      .json({ message: "User Added successfully!", data: savedUser });
  } catch (err) {
    console.log("err", err.message);
    res.status(400).json({ isSucess: false, message: err.message });
  }
};

module.exports = { createNewUser, signUp };

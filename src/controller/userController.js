//user controller.js

const User = require("../models/user");

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

module.exports = { createNewUser };

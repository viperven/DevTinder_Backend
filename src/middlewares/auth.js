const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    // const { token } = req.cookies;

    const header = req.headers.authorization;
    const token = header.split(" ").pop();

    if (!token) {
      return res
        .status(401)
        .json({ isSuccess: false, message: "Please Login !" });
    }

    const decodeToken = await jwt.verify(token, "devTinder123");
    const { id } = decodeToken;

    const user = await User.findById(id);
    if (!user) {
      return res
        .status(400)
        .json({ isSuccess: false, message: "User Not Found !" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.log(err.message);
    res
      .status(400)
      .json({
        isSuccess: false,
        message: "please login ! token expired: " + err.message,
      });
  }
};

module.exports = { userAuth };

const validator = require("validator");

//signup validation

const validateSignUpData = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    // return res.status(400).json({
    //   isSucess: false,
    //   message: "Please provide both email and password.",
    // });
    throw new Error("Please provide both email and password!");
  }

  console.log("chiga poga");

  if (!validator.isEmail(email)) {
    // return res.status(400).json({
    //   isSucess: false,
    //   message: "Invalid email address.",
    // });
    throw new Error("Invalid email address.");
  }

  if (
    !validator.isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
    })
  ) {
    // return res.status(400).json({
    //   isSucess: false,
    //   message:
    //     "Password is not strong required one capital,small letter ,number of minimum of 8 digit.",
    // });
    throw new Error(
      "Password is not strong required one capital,small letter ,number of minimum of 8 digit."
    );
  }
};

module.exports = {
  validateSignUpData,
};

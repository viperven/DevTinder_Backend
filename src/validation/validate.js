const validator = require("validator");

//signup validation

const validateSignUpData = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new Error("Please provide both email and password!");
  }

  if (!validator.isEmail(email)) {
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
    throw new Error(
      "Password is not strong required one capital,small letter ,number of minimum of 8 digit."
    );
  }
};

const validateLoginData = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new Error("Please provide both email and password!");
  }

  if (!validator.isEmail(email)) {
    throw new Error("Invalid email address.");
  }
};

module.exports = {
  validateSignUpData,
  validateLoginData,
};

const User = require("../models/user");

const view = async (req, res) => {
  try {
    const user = req.user;
    res.status(200).json({
      isSuccess: true,
      message: "profile data fetched sucessfully",
      apiData: user,
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

    res.status(500).json({
      isSuccess: false,
      message: "Server error. Please try again later.",
    });
  }
};

module.exports = { view };

const User = require("../models/user");

const view = async (req, res) => {
  try {
    const user = req.user;

    const allowedUserObject = {
      _id: user?._id,
      firstName: user?.firstName,
      lastName: user?.lastName,
      gender: user?.gender,
      keySkills: user?.keySkills,
      summary: user?.summary,
      location: user?.location,
      age: user?.age,
      photoUrl: user?.photoUrl,
    };

    res.status(200).json({
      isSuccess: true,
      message: "profile data fetched sucessfully",
      apiData: allowedUserObject,
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

const edit = async (req, res) => {
  try {
    const user = req.user;

    const {
      firstName,
      lastName,
      gender,
      keySkills,
      summary,
      location,
      age,
      photoUrl,
    } = req.body;

    const allowedFeildsToEdit = {
      firstName: firstName,
      lastName: lastName,
      gender: gender,
      keySkills: keySkills,
      summary: summary,
      location: location,
      age: age,
      photoUrl: photoUrl,
      simba: "chiku poku",
    };

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      allowedFeildsToEdit,
      { runValidators: true },
      { returnDocument: "after" }
    );

    res.status(200).json({
      isSuccess: true,
      message: "profile updated sucessfully",
      apiData: updatedUser,
    });
  } catch (err) {
    console.log(err);

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

module.exports = { view, edit };

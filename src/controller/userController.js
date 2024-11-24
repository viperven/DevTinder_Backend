const mongoose = require("mongoose");
const User = require("../models/user");
const Connection = require("../models/connection");

//all request conections recceived
const received = async (req, res) => {
  try {
    const user = req.user;
    const receiverID = new mongoose.Types.ObjectId(user._id);

    const findAllConnections = await Connection.find({
      receiverID: receiverID,
      status: "interested",
    })
      .select("status createdAt updatedAt receiverID") // Limit fields in `connectionRequest`
      .populate(
        "senderID",
        "_id firstName lastName keySkills photoUrl summary gender"
      );

    res.status(200).json({
      isSuccess: true,
      message: "connections fetched sucessfully",
      apiData: findAllConnections,
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

//all my connections
const connections = async (req, res) => {
  try {
    const user = req.user;
    const logedInUser = new mongoose.Types.ObjectId(user._id);

    const findAllConnections = await Connection.find({
      $or: [
        { senderID: logedInUser, status: "accepted" },
        { receiverID: logedInUser, status: "accepted" },
      ],
    })
      .select("status createdAt updatedAt receiverID") // Limit fields in `connectionRequest`
      .populate("senderID", "_id firstName lastName")
      .populate(
        "receiverID",
        "_id firstName lastName keySkills photoUrl summary gender"
      );

    res.status(200).json({
      isSuccess: true,
      message: "connections fetched sucessfully",
      apiData: findAllConnections,
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

module.exports = {
  received,
  connections,
};

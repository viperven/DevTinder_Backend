const User = require("../models/user");
const connectionRequest = require("../models/connection");
const mongoose = require("mongoose");

//in this controller i can either show intrested or rejected connection

const send = async (req, res) => {
  try {
    const user = req.user;
    const { receiverID, status } = req.params;
    const allowedStatus = ["interested", "rejected"];

    if (!allowedStatus.includes(status)) {
      return res
        .status(401)
        .json({ isSuccess: false, message: `status : ${status} is invalid ` });
    }

    // Convert IDs to ObjectId
    const senderID = new mongoose.Types.ObjectId(user._id);
    const receiverIDMongodbId = new mongoose.Types.ObjectId(receiverID);

    // Check if receiver id  exists
    const receiverIdExists = await User.findById(receiverIDMongodbId);
    if (!receiverIdExists) {
      return res.status(401).json({
        isSuccess: false,
        message: "User not found",
      });
    }

    // Check if request already exists
    const requestExists = await connectionRequest.find({
      $or: [
        { senderID: senderID, receiverID: receiverIDMongodbId },
        { senderID: receiverIDMongodbId, receiverID: senderID },
      ],
    });

    if (requestExists.length > 0) {
      return res.status(401).json({
        isSuccess: false,
        message: `${status} request already exists`,
      });
    }

    // Save new connection request
    const requestSaved = new connectionRequest({
      senderID: senderID,
      receiverID: receiverIDMongodbId,
      status: status.toLowerCase(),
    });
    const savedRequest = await requestSaved.save();

    res.status(200).json({
      isSuccess: true,
      message: "Request consumed successfully",
      apiData: savedRequest,
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

// in this contoller i can accept or ignore incoming request
const review = async (req, res) => {
  try {
    // from auth get logged in user
    // receiverid should match with loggedin user with status intrested
    // if found change status to ignored,accepted
    // i cannot ignore,accept my own account
    //validations

    const user = req.user;
    const { senderID, status } = req.params;

    const receiverID = new mongoose.Types.ObjectId(user._id);

    const allowedStatus = ["accepeted", "ignored"];
    if (!allowedStatus.includes(status)) {
      return res
        .status(401)
        .json({ isSuccess: false, message: `status : ${status} is invalid ` });
    }

    const fetchConnectionRequest = await connectionRequest
      .findOne({
        $and: [{ senderID: senderID }, { status: "interested" }],
      })
      .select("status createdAt updatedAt receiverID") // Limit fields in `connectionRequest`
      .populate(
        "senderID",
        "_id firstName lastName keySkills photoUrl summary gender"
      );

    if (!fetchConnectionRequest) {
      return res.status(401).json({
        isSuccess: false,
        message: "no connections request found !",
      });
    }

    const changeConnectionStatus = await connectionRequest
      .findByIdAndUpdate(
        fetchConnectionRequest._id,
        { status: status },
        { returnDocument: "after" }
      )
      .select("status createdAt updatedAt receiverID") // Limit fields in `connectionRequest`
      .populate(
        "senderID",
        "_id firstName lastName keySkills photoUrl summary gender"
      )
      .populate("receiverID", "_id firstName r");

    res.status(200).json({
      isSuccess: true,
      message: "connection request send sucessfully",
      apiData: changeConnectionStatus,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      isSuccess: false,
      message: "Server error. Please try again later.",
    });
  }
};

module.exports = {
  send,
  review,
};

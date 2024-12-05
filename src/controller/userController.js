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
      .populate("senderID", "_id firstName lastName keySkills photoUrl summary gender")
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

//feed api when user opens api send them people recommdations
const feed = async (req, res) => {
  try {
    //my account should not show to me
    //my connctions,rejection or i already sended
    //request should not be seen in feed
    //just check in connection schema my logged in user id should  be in sender or receiver id
    // then i will get suppose 10 request
    // then add this in one array use sets for unique id
    //then search in users collection that the id should not match from set
    //and id should not match with mine
    //here solution ends

    //but i want when searching in users whith no id should match fromm array also match
    //key skills of logged in user as i have set indexed on key skill

    const user = req.user;

    const loggedInUser = new mongoose.Types.ObjectId(user._id);

    let pageSize = parseInt(req.query.pageSize) || 5;
    const pageIndex = parseInt(req.query.pageIndex) || 1;
    pageSize = pageSize > 5 ? 5 : pageSize;
    const skip = (pageIndex - 1) * pageSize;

    const findMyConnectionRequest = await Connection.find({
      $or: [{ senderID: loggedInUser }, { receiverID: loggedInUser }],
    }).select("senderID receiverID");

    const requestUniqueIds = new Set();
    findMyConnectionRequest.forEach((id) => {
      requestUniqueIds.add(id.senderID.toString()),
        requestUniqueIds.add(id.receiverID.toString());
    });

    const fetchUsersForFeed = await User.find({
      $and: [
        { _id: { $nin: [...requestUniqueIds] } },
        { _id: { $ne: loggedInUser } },
        // { keySkills: { $in: user.keySkills } || [] }, uncooment to check key skills also
      ],
    })
      .select("firstName lastName keySkills photoUrl summary gender age")
      .skip(skip)
      .limit(pageSize)
      .lean();

    res.status(200).json({
      isSuccess: true,
      message: "successfully fetched feed data",
      apiData: fetchUsersForFeed,
    });
  } catch (err) {
    console.log(err?.message);
    res
      .status(500)
      .json({ isSuccess: false, message: "internal server error" });
  }
};

//get all ignored list
const ignore = async (req, res) => {
  try {
    const user = req.user;
    const loggedInUser = new mongoose.Types.ObjectId(user._id);

    const listOfIgnoredUser = await Connection.find({
      receiverID: loggedInUser,
      status: "ignored",
    })
      .select("_id status createdAt updatedAt senderID receiverID")
      .populate(
        "senderID",
        "_id firstName lastName keySkills photoUrl summary gender"
      )
      .populate("receiverID", "_id firstName lastName")
      .lean();

    res.status(200).json({
      isSuccess: true,
      message: "user list fetched sucessfully",
      apiData: listOfIgnoredUser,
    });
  } catch (err) {
    console.log(err?.message);
    res
      .status(500)
      .json({ isSuccess: false, message: "internal server error" });
  }
};

module.exports = {
  received,
  connections,
  feed,
  ignore,
};

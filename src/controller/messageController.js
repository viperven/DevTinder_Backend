const Conversation = require("../models/conversations");
const Message = require("../models/message");
const mongoose = require("mongoose");
const { validateSendMessageData, validateGetAllMessageById } = require("../validation/validate");

//send message to connection only
const sendMessage = async (req, res) => {
  try {
    await validateSendMessageData(req);

    const user = req.user;
    const senderID = new mongoose.Types.ObjectId(user._id);
    const { receiverID, content, media, mediaType } = req.body;
    // const io = req.app.get("io"); // Access the global `io` instance

    // Find or create a conversation
    let conversation = await Conversation.findOne({
      $or: [
        { senderID, receiverID },
        { senderID: receiverID, receiverID: senderID },
      ],
    });

    if (!conversation) {
      conversation = await Conversation.create({ senderID, receiverID });
    }

    // Save the message
    const message = await Message.create({
      conversationID: conversation._id,
      senderID,
      receiverID,
      content,
      media,
      mediaType,
    });

    // Update the conversation's last activity
    conversation.updatedAt = Date.now();
    conversation.lastMessage = message._id;
    await conversation.save();

    // Populate sender and receiver details for the message
    const populatedMessage = await Message.findById(message._id)
      .populate("senderID", "firstName lastName summary age gender photoUrl createdAt") // Select only the required fields
      .populate("receiverID", "firstName lastName summary age gender photoUrl createdAt");

    return res.status(200).json({
      isSuccess: true,
      message: "Message sent successfully",
      data: populatedMessage,
    });
  } catch (err) {

    if (err.statusCode === 400) {
      return res.status(err.statusCode).json({
        isSuccess: false,
        message: err.message,
        field: err.field, // Optionally include the problematic field
      });
    }
    return res.status(err.statusCode || 500).json({
      isSuccess: false,
      message: err.message || "Internal server error",
    });
  }
};

// this will show all last conversation of all which i have send message or received
const getConversations = async (req, res) => {
  try {
    const user = req.user;
    const loggedInUser = new mongoose.Types.ObjectId(user._id);

    const conversations = await Conversation.find({
      $or: [{ senderID: loggedInUser }, { receiverID: loggedInUser }],
    })
      .populate("senderID", "firstName lastName summary age gender photoUrl")
      .populate("receiverID", "firstName lastName summary age gender photoUrl")
      .populate("lastMessage", "content media mediaType")
      .sort({ updatedAt: -1 });

    res.status(200).json({
      isSuccess: true,
      message: "all conversation fetched sucessfully",
      apiData: conversations,
    });
  } catch (err) {
    console.error(err.message);
    res
      .status(500)
      .json({ isSuccess: false, message: "Internal server error" });
  }
};

//fetch all messages of two persons by conversationID
const fetchAllMessages = async (req, res) => {
  try {
    const user = req.user;
    const loggedInUser = new mongoose.Types.ObjectId(user._id);

    let { conversationID } = req.query;

    let conversation = await Conversation.findOne({
      $and: [
        { _id: conversationID },
        {
          $or: [{ senderID: loggedInUser }, { receiverID: loggedInUser }],
        },
      ],
    });

    if (!conversation) {
      return res.status(404).json({
        isSuccess: false,
        message: "No conversation found for the provided ID and user.",
      });
    }

    const allConversations = await Message.find({
      conversationID: conversationID,
    })
      .populate(
        "senderID",
        "firstName lastName summary age gender photoUrl createdAt"
      )
      .populate(
        "receiverID",
        "firstName lastName summary age gender photoUrl createdAt"
      )
      .sort({ timestamp: 1 });

    res.status(200).send({
      isSuccess: true,
      message: "message fetched sucessfully",
      apiData: allConversations,
    });
  } catch (err) {
    console.log(err?.message);
    res
      .status(500)
      .json({ isSuccess: false, message: "internal server error" });
  }
};

//fetch message by receiver id and sender id
const getAllMessageById = async (req, res) => {
  try {
   await validateGetAllMessageById(req);
    const user = req.user;
    const { receiverId } = req.query;
    const loggedInUser = new mongoose.Types.ObjectId(user._id);

    const conversationExists = await Conversation.findOne({
      $or: [{ senderID: loggedInUser, receiverID: receiverId }, { senderID: receiverId, receiverID: loggedInUser }]
    })

    if (!conversationExists) {
      return res.status(404).json({
        isSuccess: true,
        message: "no chat found .",
      });
    }

    const getAllMessageByConversationId = await Message.find({
      conversationID: conversationExists?._id,
    })
      .populate(
        "senderID",
        "firstName lastName summary age gender photoUrl createdAt"
      )
      .populate(
        "receiverID",
        "firstName lastName summary age gender photoUrl createdAt"
      )
      .sort({ timestamp: 1 });

    res.status(200).json({
      isSuccess: true, message: "data fetched sucessfully", apiData: getAllMessageByConversationId
    })

  }
  catch (err) {
    console.log(err?.message);

    if (err.statusCode === 400) {
      return res.status(err.statusCode).json({
        isSuccess: false,
        message: err.message,
        field: err.field,
      });
    }

    res.status(500).json({
      isSuccess: false,
      message: "Server error. Please try again later.",
    });

  }
}

module.exports = { sendMessage, getConversations, fetchAllMessages, getAllMessageById };

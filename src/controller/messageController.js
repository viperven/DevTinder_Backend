const Conversation = require("../models/conversations");
const Message = require("../models/message");
const mongoose = require("mongoose");
const { validateSendMessageData } = require("../validation/validate");

//send message to connection only
const sendMessage = async (req, res) => {
  try {
   await validateSendMessageData(req);

    const user = req.user;
    const senderID = new mongoose.Types.ObjectId(user._id);
    const { receiverID, content, media, mediaType } = req.body;

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

    return res.status(200).json({
      isSuccess: true,
      message: "Message sent successfully",
      data: message,
    });
  } catch (err) {
    console.error(err.message, "sss");
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
    }).sort({ timestamp: 1 });

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

module.exports = { sendMessage, getConversations, fetchAllMessages };

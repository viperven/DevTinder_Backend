const User = require("../models/user");
const connectionRequest = require("../models/connection");
const Conversation = require("../models/conversations");
const Message = require("../models/message");
const mongoose = require("mongoose");

//send message 
const sendMessage = async (req, res) => {
    try {
        const user = req.user;
        const senderID = new mongoose.Types.ObjectId(user._id);
        const { receiverID, content, media, mediaType } = req.body;

        if (!senderID || !receiverID) {
            return res.status(400).json({ isSuccess: false, message: "Sender and Receiver are required" });
        }

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
        console.error(err.message);
        res.status(500).json({ isSuccess: false, message: "Internal server error" });
    }
};

// this will show all last conversation of all which i have send message or received
const getConversations = async (req, res) => {
    try {
        const user = req.user;
        const loggedInUser = new mongoose.Types.ObjectId(user._id);

        // const conversations = await Message.find({
        //     $or: [{ senderID: loggedInUser }, { receiverID: loggedInUser }]
        // })
        //     .populate("senderID", "firstName lastName summary age gender")
        //     .populate("receiverID", "firstName lastName summary age gender")
        //     .sort({ updatedAt: -1 }); // Sort by latest activity

        const conversations = await Conversation.find({
            $or: [
                { senderID: loggedInUser },
                { receiverID: loggedInUser },
            ],
        })
            .populate("senderID", "firstName lastName summary age gender")
            .populate("receiverID", "firstName lastName summary age gender")
            .populate("lastMessage", "content media mediaType")
            .sort({ updatedAt: -1 });


        res.status(200).json({ isSuccess: true, message: "all conversation fetched sucessfully", apiData: conversations });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ isSuccess: false, message: "Internal server error" });
    }
};

//fetch all messages of two persons by conversationID
const fetchAllMessages = async (req, res) => {
    try {
        //get loggedin user from auth
        // get conversation id from body
        //find all conversation with conversation id and send with all details

        const user = req.user;
        const loggedInUser = new mongoose.Types.ObjectId(user._id);
        let { conversationID } = req.query;
        let ab = new mongoose.Types.ObjectId(conversationID)
        console.log(conversationID);
        console.log(ab);

        const allConversations = await Message
            .find({ conversationID: ab })
        console.log(allConversations);


        res.status(200).send({ isSuccess: true, message: "message fetched sucessfully", apiData: allConversations })

    }
    catch (err) {
        console.log(err?.message);
        res.status(500).json({ isSuccess: false, message: "internal server error" })
    }
}



module.exports = { sendMessage, getConversations, fetchAllMessages }
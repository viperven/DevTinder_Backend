const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema({
    senderID: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiverID: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" }, // optional, for the latest message
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }, // update this when a new message is added
});


const Conversation = mongoose.model("Conversation", conversationSchema);

module.exports = Conversation;



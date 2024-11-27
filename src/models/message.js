const mongoose = require("mongoose");


const messageSchema = new mongoose.Schema({
    conversationID: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true },
    senderID: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiverID: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: false }, // Text message
    media: { type: String, required: false }, // Media file URL
    mediaType: { type: String, enum: ["image", "video", "audio", "document"], required: false },
    timestamp: { type: Date, default: Date.now },
    status: { type: String, enum: ["sent", "delivered", "read"], default: "sent" },
}, {
    timestamps: true
});

messageSchema.index({ senderID: 1, receiverID: 1 });


const Message = mongoose.model("Message", messageSchema);

module.exports = Message;

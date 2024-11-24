const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const handleDuplicateKeyError = require("../helper/errorValidations");
const User = require("../models/user");

const connectionRequestSchema = new mongoose.Schema(
  {
    senderID: {
      required: true,
      type: mongoose.Schema.Types.ObjectId,
      ref: User,
    },
    receiverID: {
      required: true,
      type: mongoose.Schema.Types.ObjectId,
      ref: User,
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ["ignored", "interested", "accepeted", "rejected"],
        message: (props) =>
          `mention  status:  ${props.value} value is not allowed ! `,
      },
    },
  },
  {
    timestamps: true,
  }
);

connectionRequestSchema.index({ senderID: 1, receiverID: 1, status: 1 });

connectionRequestSchema.pre("save", function (next) {
  const connectionRequest = this;

  const senderID = new mongoose.Types.ObjectId(connectionRequest.senderID);
  const receiverID = new mongoose.Types.ObjectId(connectionRequest.receiverID);

  if (senderID.equals(receiverID)) {
    throw new Error("Cannot send connection request to yourself!");
  }

  next();
});

const connectionModel = mongoose.model(
  "ConnectionRequest",
  connectionRequestSchema
);

module.exports = connectionModel;

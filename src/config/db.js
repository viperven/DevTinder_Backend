const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://jharupesh669:F1a4FSKQSmP3nfOG@tenderdb.ztpgn.mongodb.net/devTenderDB"
  );
};

module.exports = connectDB;

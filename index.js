const express = require("express");
const connectDB = require("./src/config/db");
const app = express();
const User = require("./src/models/user");

app.use(express.json()); //parse json bodies

//all Routes

// app.use("/user", require("./src/routes/authRoutes"));
app.use("/auth", require("./src/routes/authRoutes"));

//first connect to db then start listening to api calls
connectDB()
  .then(() => {
    console.log("Database connection established");
    app.listen(4000, () => {
      console.log("server working at 4000");
    });
  })
  .catch((err) => {
    console.log("database connection error", err?.message);
  });

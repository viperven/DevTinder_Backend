const express = require("express");
const connectDB = require("./src/config/db");
const app = express();
const cookieParser = require("cookie-parser");

app.use(express.json()); //parse json bodies
app.use(cookieParser()); //parse cookies

//all Routes

// app.use("/user", require("./src/routes/authRoutes"));
app.use("/auth", require("./src/routes/authRoutes"));
app.use("/profile", require("./src/routes/profileRoutes"));

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

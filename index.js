const express = require("express");
const connectDB = require("./src/config/db");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");

app.use(express.json()); //parse json bodies
app.use(cookieParser()); //parse cookies
app.use(
  cors({
    origin: "http://localhost:5173", // Replace with your allowed domain
    methods: ["GET", "POST", "PUT", "PATCH"], // Allowed methods
    credentials: true,
    // For legacy browser support
  })
);

//all Routes

app.use("/auth", require("./src/routes/authRoutes"));
app.use("/profile", require("./src/routes/profileRoutes"));
app.use("/request", require("./src/routes/connectionRoutes"));
app.use("/user", require("./src/routes/userRotutes"));
app.use("/message", require("./src/routes/messageRoute"));

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

const express = require("express");
const connectDB = require("./src/config/db");
const cookieParser = require("cookie-parser");
const http = require("http"); // For creating the HTTP server
const { Server } = require("socket.io"); // Import Socket.IO
const cors = require("cors");
const serverless = require("serverless-http");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5173"],
    methods: ["GET", "POST"],
  },
});
app.set("io", io);
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH"],
    credentials: true,
  })
);

//all Routes

app.use("/auth", require("./src/routes/authRoutes"));
app.use("/profile", require("./src/routes/profileRoutes"));
app.use("/request", require("./src/routes/connectionRoutes"));
app.use("/user", require("./src/routes/userRotutes"));
app.use("/message", require("./src/routes/messageRoute"));

//first connect to db then start listening to api calls
// connectDB()
//   .then(() => {
//     console.log("Database connection established");
//     server.listen(4000, () => {
//       console.log("server working at 4000");
//     });
//   })
//   .catch((err) => {
//     console.log("database connection error", err);
//   });


//   // Socket.IO configuration
// io.on("connection", (socket) => {
//   console.log("A user connected:", socket.id);

//   // Listen for chat messages
//   socket.on("sendMessage", (message) => {
//     console.log("Message received:", message);
//     // Broadcast message to all connected clients
//     io.emit("receiveMessage", message);
//   });

//   // Handle disconnection
//   socket.on("disconnect", () => {
//     console.log("A user disconnected:", socket.id);
//   });
// });



// This handler function will be invoked by AWS Lambda
module.exports.handler = async (event, context) => {
  try {

    connectDB()
      .then(() => {
        console.log("Database connection established");
        server.listen(4000, () => {
          console.log("server working at 4000");
        });
      })
      .catch((err) => {
        console.log("database connection error", err);
      });


    // Socket.IO configuration
    io.on("connection", (socket) => {
      console.log("A user connected:", socket.id);

      // Listen for chat messages
      socket.on("sendMessage", (message) => {
        console.log("Message received:", message);
        // Broadcast message to all connected clients
        io.emit("receiveMessage", message);
      });

      // Handle disconnection
      socket.on("disconnect", () => {
        console.log("A user disconnected:", socket.id);
      });
    });

    // Now, you can continue with your regular logic
    return serverless(app)(event, context);
  } catch (err) {
    console.error("Error connecting to MSSQL database:", err);
    // Handle the error appropriately
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Internal Server Error",
      }),
    };
  }
};

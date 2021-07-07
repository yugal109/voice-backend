const express = require("express");
const cors = require("cors");
const app = express();
const jwt = require("jsonwebtoken");
const connect = require("./database");
const UserRegisterRoutes = require("./routes/UserRegisterRoutes");
const LoginRoutes = require("./routes/LoginRoute");
const ReactionRoutes=require("./routes/ReactionRoutes")
require("dotenv").config();
const socketio = require("socket.io");
const Chat = require("./models/ChatModel");
const auth = require("./middleware/auth");
const messageSocket=require("./sockets/messageSocket")
connect();


//MIDDLEWARES

//FOR CROSS-ORIGIN
app.use(cors());
app.use(express.json());

// REGISTER ROUTES
app.use("/users", UserRegisterRoutes);

//LOGIN ROUTES
app.use("/login", LoginRoutes);

//REACTION ROUTES
app.use("/react",ReactionRoutes)

app.post("/create", [auth], async (req, res) => {
  const room = new Chat({
    admin: req.user,
  });

  await room.save();
  const roomId = jwt.sign({ roomid: room._id }, process.env.SECRET_KEY);
  res.send({ roomId });
});

const PORT = process.env.PORT || 5002;

const server = app.listen(PORT, () => {
  console.log(`Server is running on the port ${PORT}`);
});

const io = socketio(server, {
  cors: {
    origin: "*",
  },
});

messageSocket(io)






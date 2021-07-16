const express = require("express");
const cors = require("cors");
const app = express();
const jwt = require("jsonwebtoken");
const connect = require("./database");
const UserRegisterRoutes = require("./routes/UserRegisterRoutes");
const LoginRoutes = require("./routes/LoginRoute");
const ReactionRoutes = require("./routes/ReactionRoutes");
const RequestRoutes=require("./routes/RequestRoute")
require("dotenv").config();
const socketio = require("socket.io");
const Chat = require("./models/ChatModel");
const User=require("./models/Users")
const React=require("./models/ReactionModel")
const auth = require("./middleware/auth");
const messageSocket = require("./sockets/messageSocket");
const LikeSocket = require("./sockets/LikeSocket");
const requestSocket=require("./sockets/requestSocket")
const asyncHandler = require("express-async-handler");

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
app.use("/react", ReactionRoutes);

//REQUEST ROUTES
app.use("/requests",RequestRoutes)

//GET SEARCHED USERS
app.get(
  "/search",
  [auth],
  asyncHandler(async (req, res) => {
    const username=req.query.username
    const users=await User.find({"username" : { $regex:username, $options:"$i" }})
    res.send(users)
  })
);

//GET FRIENDS
app.get(
  "/friends/:userId",
  [auth],
  asyncHandler(async (req, res) => {
    const users=await User.findById(req.params.userId).populate({
      path:"friends",
      populate:[
        {path:"userId",model:"User"}
      ]
    })
    res.send(users.friends)
  })
);



//CREATING CHAT ROOM
app.post(
  "/create",
  [auth],
  asyncHandler(async (req, res) => {
    const room = new Chat({
      admin: req.user,
      name: req.body.name,
    });
    await room.save();
    const roomId = jwt.sign({ roomid: room._id }, process.env.SECRET_KEY);
    res.send({ roomId });
  })
);

//INBOX DATA
app.post(
  "/inbox",
  [auth],
  asyncHandler(async (req, res) => {
    const inboxlist = await Chat.find({ admin: req.body.id });
    res.send(inboxlist);
  })
);

//USERS IN ROOM
app.get(
  "/users_in_room/:roomid",
  [auth],
  asyncHandler(async (req, res) => {
    const usersList = await Chat.findById(req.params.roomid).populate({
      path:"users",model:"User",
      populate:[
        {
          path:"userId",model:"User"
        }
      ]
    });
    const admin=await Chat.findById(req.params.roomid).select({admin:1}).populate("admin")
    res.send({usersList:usersList,admin:admin});
  })
);

//REACTIONS IN MESSAGE
app.get(
  "/reactions/:messageid",
  [auth],
  asyncHandler(async (req, res) => {
    const reactionList = await React.find({messageId:req.params.messageid})
    .populate({
      path:"userId",model:"User"
    });
    res.send(reactionList);
  })
);




const PORT = process.env.PORT || 5002;

const server = app.listen(PORT, () => {
  console.log(`Server is running on the port ${PORT}`);
});


const io = socketio(server, {
  cors: {
    origin: "*",
  },
});
app.set("socketio",io)

messageSocket(io);
LikeSocket(io);
requestSocket(io)

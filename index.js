const express = require("express");
const cors = require("cors");
const app = express();
const webpush = require("web-push");
const connect = require("./database");
const UserRegisterRoutes = require("./routes/UserRegisterRoutes");
const LoginRoutes = require("./routes/LoginRoute");
const ReactionRoutes = require("./routes/ReactionRoutes");
const RequestRoutes = require("./routes/RequestRoute");
const ChatRoutes = require("./routes/ChatRoute");
require("dotenv").config();
const socketio = require("socket.io");
const Chat = require("./models/ChatModel");
const User = require("./models/Users");
const React = require("./models/ReactionModel");
const Request = require("./models/RequestModel");
const auth = require("./middleware/auth");
const messageSocket = require("./sockets/messageSocket");
const LikeSocket = require("./sockets/LikeSocket");
const requestSocket = require("./sockets/requestSocket");
const asyncHandler = require("express-async-handler");
// const client=require("./cache/redis")
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
app.use("/requests", RequestRoutes);

//CHAT routes
app.use("/chat", ChatRoutes);

//GET SEARCHED USERS
app.get(
  "/search",
  [auth],
  asyncHandler(async (req, res) => {
    const username = req.query.username;
    const users = await User.find({
      username: { $regex: username, $options: "$i" },
    });
    res.send(users);
  })
);

//GET FRIENDS
app.get(
  "/friends/:userId",
  [auth],
  asyncHandler(async (req, res) => {
    // client.get("friends",async(error,friends)=>{
    //   if(friends!=null){
    //     res.send(JSON.parse(friends))
    //     console.log(JSON.parse(friends))

    //   }else{

    const users = await User.findById(req.params.userId).populate({
      path: "friends",
      populate: [{ path: "userId", model: "User" }],
    });
    // client.setex("friends",3600,JSON.stringify(users.friends))
    res.send(users.friends);

    // }
    // }
    // )
  })
);

//CREATING CHAT ROOM
app.post(
  "/create",
  [auth],
  asyncHandler(async (req, res) => {
    // console.log("THe data is",req.body)
    const room = new Chat({
      admin: req.user._id,
      name: req.body.name,
    });
    await room.save();
    // const roomId = jwt.sign({ roomid: room._id }, process.env.SECRET_KEY);
    res.send(room);
  })
);

//INBOX DATA
app.get(
  "/inbox",
  [auth],
  asyncHandler(async (req, res) => {
    const inboxlist = await Chat.find({
      $or: [
        { users: { $elemMatch: { userId: req.user._id } } },
        { admin: req.user._id },
      ],
    });
    res.send(inboxlist);
  })
);

//latest message

app.get(
  "/latest_room",
  [auth],
  asyncHandler(async (req, res) => {
    const inboxlist = await Chat.find({
      $or: [
        { admin: req.user._id },
        { users: { $elemMatch: { userId: req.user._id } } },
      ],
    });
    // console.log(inboxlist);
    res.send(inboxlist);
  })
);

//USERS IN ROOM
app.get(
  "/users_in_room/:roomid",
  [auth],
  asyncHandler(async (req, res) => {
    const usersList = await Chat.findById(req.params.roomid).populate({
      path: "users admin",
      populate: {
        path: "userId",
        model: "User",
      },
    });
    // const present=usersList.users.some(e=>e.userId._id == req.user._id)
    // if(present || (usersList.admin==req.user._id)){

    //   res.send(true)
    // }else{
    //   res.send(false)
    // }

    res.send(usersList);
  })
);

//users is present or not
app.get(
  "/user_in_room/:roomid",
  [auth],
  asyncHandler(async (req, res) => {
    const chat = await Chat.findById(req.params.roomid);
    const user = chat.users.find((e) => e.userId == req.user._id);
    if (chat.admin == req.user._id || user) {
      res.send(true);
    } else {
      res.send(false);
    }
  })
);

//removing users from chat room
app.post(
  "/remove_user/:roomid",
  [auth],
  asyncHandler(async (req, res) => {
    const chat = await Chat.findById(req.params.roomid);
    const { acceptor } = req.body;
    const users = chat.users.filter((e) => e.userId == req.user._id);
    chat.users = users;
    await Request.findOneAndDelete({
      status: "accepted",
      requestType: "invitation",
      requestor: req.user._id,
      acceptor,
    });
    await chat.save();
    res.send("Removed");
  })
);

//removing friends
app.post(
  "/remove_friend",
  [auth],
  asyncHandler(async (req, res) => {
    const { friend } = req.body;
    const user = await User.findById(friend);
    const frnd = user.friends.filter((e) => e.userId != req.user._id);
    user.friends = frnd;
    await user.save();
    await Request.findOneAndDelete({
      requestor: req.user._id,
      acceptor: friend,
      requestType: "friend_request",
    });
    res.send("follow");
  })
);

//REACTIONS IN MESSAGE
app.get(
  "/reactions/:messageid",
  [auth],
  asyncHandler(async (req, res) => {
    const reactionList = await React.find({
      messageId: req.params.messageid,
    }).populate({
      path: "userId",
      model: "User",
    });
    res.send(reactionList);
  })
);

app.get("/requestlength", [auth], async (req, res) => {
  const requests = await Request.find({
    acceptor: req.user._id,
    status: "pending",
  });
  // console.log(requests)
  res.send({ length: requests.length });
});

// webpush.setVapidDetails(
//   "mailto:yugalkhati570@gmail.com",
//   process.env.PUBLIC_VAPID_KEY,
//   process.env.PRIVATE_VAPID_KEY
// );

//subscrive route
app.post("/subscribe", (req, res) => {
  const subscription = req.body;
  res.status(201).send({});
  const payload=JSON.stringify({title:"Pushed"})
  webpush.sendNotification(subscription,payload)
  .catch((error)=>{
    console.log(error)
  })
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

app.set("socketio", io);

messageSocket(io);
// LikeSocket(io);
requestSocket(io);

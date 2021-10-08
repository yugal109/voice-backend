const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");
const auth = require("../middleware/auth");
const Request = require("../models/RequestModel");
const User = require("../models/Users");
const io = require("../index");
const Chat = require("../models/ChatModel");

router.get(
  "/",
  [auth],
  asyncHandler(async (req, res) => {
    const requests = await Request.find({
      acceptor: req.user._id,
      //  status:"pending"
    }).populate("requestor");


    //  console.log(requests)
    res.send(requests);
  })
);

router.get(
  "/addfriend",
  [auth],
  asyncHandler(async (req, res) => {
    const requests = await Request.find({
      acceptor: req.user._id,
      status: "pending",
    }).populate("requestor");
    res.send(requests);
  })
);

router.get(
  "/friendaccepted",
  [auth],
  asyncHandler(async (req, res) => {
    const requests = await Request.find({
      requestor: req.user._id,
      status: "accepted",
    }).populate("acceptor");
    res.send(requests);
  })
);

router.post(
  "/addfriend",
  [auth],
  asyncHandler(async (req, res) => {
    const { requestor } = req.body;
    const request = await Request.findOne({
      requestor,
      acceptor: req.user._id,
      requestType: "friend_request",
    });
    request.status = "accepted";
    await request.save();
    let other = await User.findById(req.user._id);
    other.friends.push({ userId: requestor });
    await other.save();

    res.send(request);
  })
);

router.post(
  "/deleterequest_by_requestor",
  [auth],

  asyncHandler(async (req, res) => {
    const { acceptor } = req.body;
    const requests = await Request.findOneAndDelete({
      requestor: req.user._id,
      acceptor,
      requestType: "friend_request",
      status: "pending",
    });

    res.send("follow");
  })
);

router.delete(
  "/deleterequest/:id",
  [auth],
  asyncHandler(async (req, res) => {
    const requests = await Request.findByIdAndDelete(req.params.id);

    res.send("Succesfully Deleted");
  })
);

router.get(
  "/requested_or_not",
  [auth],
  asyncHandler(async (req, res) => {
    const { acceptor } = req;
    const requests = await Request.find({
      acceptor,
      requestor: req.user._id,
      requestType: "friend_request",
    });
    res.send(requests);
  })
);

router.post(
  "/",
  [auth],
  asyncHandler(async (req, res) => {
    const { requestType, requestor, acceptor } = req.body;
    const REQ = await Request.findOne({ acceptor, requestor, requestType });
    // console.log(REQ)
    if (!REQ && requestor !== acceptor) {
      const request = new Request({
        requestType,
        requestor,
        acceptor,
      });
      await request.save();

      const io=req.app.get("socketio")

      const reqs=await Request.find({
        acceptor: acceptor,
        //  status:"pending"
      }).populate("requestor");
  
      
      io.of("/requests").to(acceptor).emit("allRequests",reqs.length)

      res.send(request.status);
    }
  })
);

router.get(
  "/status/:id",
  [auth],
  asyncHandler(async (req, res) => {
    const requests = await Request.findOne({
      acceptor: req.params.id,
      requestor: req.user._id,
      requestType: "friend_request",
      status: "pending",
    });
    res.send(requests);
  })
);

router.get(
  "/invite",
  [auth],
  asyncHandler(async (req, res) => {
    const requests = await Request.find({
      acceptor: req.user._id,
      requestType: "invitation",
    }).populate("requestor");
    res.send(requests);
  })
);

router.post(
  "/invite",
  [auth],
  asyncHandler(async (req, res) => {
    const { userList, roomId } = req.body;
      
    // console.log(userList)
    // const { acceptor, requestor, roomId, roomName } = req.body;
    const room=await Chat.findById(roomId)
    const io=req.app.get("socketio")

    for (let i = 0; i < userList.length; i++) {

      
      const acceptor=userList[i].userId
      console.log(acceptor)

      const request = new Request({
        acceptor:acceptor._id,
        requestType: "invitation",
        requestor: req.user._id,
        roomId,
        roomName: room.name
      });
      await request.save();
      console.log((acceptor._id).toString())
      const accep=acceptor._id
      const reqs=await Request.find({
        acceptor: accep,
        //  status:"pending"
      }).populate("requestor");
      io.of("/requests").to(accep).emit("allRequests",reqs.length)

    }

    res.send("Successfully invited");
  })
);

router.get(
  "/invite/:userId",
  [auth],
  asyncHandler(async (req, res) => {
    const requests = await Request.find({
      acceptor: req.params.userId,
      requestType: "invitation",
      status: "accepted",
    });
    res.send(requests);
  })
);

router.post(
  "/accept/:id",
  [auth],
  asyncHandler(async (req, res) => {
    const acceptor = req.body.acceptor;
    // console.log(req.body.roomId)
    const chat = await Chat.findById(req.body.roomId);
    // console.log(chat)
    chat.users.push({ userId: req.user._id });
    console.log(chat);
    await chat.save();
    const request = await Request.findById(req.params.id);

    request.status = "accepted";

    await request.save();

    res.send(request);
  })
);

module.exports = router;

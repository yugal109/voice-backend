const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");
const auth = require("../middleware/auth");
const Request = require("../models/RequestModel");
const User = require("../models/Users");
const io = require("../index");

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
    let other = await User.findById(requestor);
    other.friends.push({ userId: req.user._id });
    await other.save();
    const noti = await Request.find({
      acceptor: req.user._id,
      // requestType: "friend_request",
      status: "pending",
    });
   
    const io = req.app.get("socketio");
    io.of("/requests").to(req.user._id).emit("notifications", noti.length);
    io.of("/requests").to(requestor).emit("accepted","Accepted")
    res.send(request);
  })
);

router.delete(
  "/deleterequest/:id",
  [auth],
  asyncHandler(async (req, res) => {
    const requests = await Request.findOneAndDelete({ _id: req.params.id });
    console.log(req.user);
    const noti = await Request.find({
      acceptor: req.user._id,
      requestType: "friend_request",
      status: "pending",
    });
    const io = req.app.get("socketio");
    io.of("/requests").to(req.user._id).emit("notifications", noti.length);
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
    const request = new Request({
      requestType,
      requestor,
      acceptor,
    });
    await request.save();
    const requests = await Request.find({ acceptor, status: "pending" });
    const io = req.app.get("socketio");
    io.of("/requests").to(acceptor).emit("notifications", requests.length);
    res.send(requests);
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
    const { acceptor, requestor, link, roomName } = req.body;
    const request = new Request({
      acceptor: acceptor,
      requestType: "invitation",
      requestor: requestor,
      link,
      roomName,
    });
    await request.save();
    const requests = await Request.find({ acceptor, status: "pending" });
    const io = req.app.get("socketio");
    io.of("/requests").to(acceptor).emit("notifications", requests.length);
    res.send(requests);
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
    const request = await Request.findById(req.params.id);
    request.status = "accepted";
    await request.save();
    const requests = await Request.find({ acceptor, status: "pending" });
    const io = req.app.get("socketio");
    io.of("/requests").to(acceptor).emit("notifications", requests.length);
    res.send(requests);
  })
);

module.exports = router;

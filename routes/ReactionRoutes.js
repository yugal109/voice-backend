const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");
const Message = require("../models/MessageModal");
const auth = require("../middleware/auth");
const React = require("../models/ReactionModel");

router.get(
  "/:msgid",
  asyncHandler(async (req, res) => {
    const react = await React.find({ messageId: req.params.msgid });
    res.send(react);
  })
);

router.post("/:id", [auth], async (req, res) => {
  const messageId = req.params.id;
  const message = await Message.findOne({ "reactions.userId": req.user._id });
  if (message) {
   await Message.updateOne(
      {},
      { $pull: { reactions: { userId: req.user._id } } }
    );
    res.send({ status: 0 });
  } else {
    const msg = await Message.findOne({ _id: messageId });
    msg.reactions.push({ userId: req.user._id });
    await msg.save();
    res.send({ status: 1 });
  }
});

module.exports = router;

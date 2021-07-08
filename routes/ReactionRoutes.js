const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");
const React = require("../models/ReactionModel");

router.get(
  "/:msgid",
  asyncHandler(async (req, res) => {
    const react = await React.find({ messageId: req.params.msgid });
    res.send(react);
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { messageId, userId, reacts } = req.body;
    let react = await React.findOne({ messageId });
    if (react) {
      if (react.reacts == reacts) {
        await React.deleteOne({ messageId, userId });
        res.send("deleted");
      } else {
        react.reacts = reacts;
        await react.save();
        res.send(react);
      }
    } else {
      react = new React({
        messageId,
        userId,
        reacts,
      });
      await react.save();
      res.send(react);
    }
  })
);

module.exports = router;

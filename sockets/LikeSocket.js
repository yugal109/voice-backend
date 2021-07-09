const mongoose = require("mongoose");
const React = require("../models/ReactionModel");

function LikeSocket(io) {
  io.of("/reactions").on("connection", async (socket) => {
    socket.on("join", async ({messageId}) => {
      const react = await React.find({ messageId: messageId});
      socket.emit("getallreacts", { react:react.length });
      socket.join(messageId);
    });

    socket.on("reaction", async ({ messageId, userId, reacts }) => {
      let react = await React.findOne({ messageId, userId });
      if (react) {
        if (react.reacts == reacts) {
          await React.deleteOne({ messageId, userId });
          const rxt=await React.find({ messageId });
          io.of("/reactions").to(messageId).emit("getallreacts", { react:rxt.length });
        } else {
          react.reacts = reacts;
          await react.save();
          const rxt=await React.find({ messageId });
          io.of("/reactions").to(messageId).emit("getallreacts", { react:rxt.length });
        }
      } else {
        const rct = new React({
          messageId,
          userId,
          reacts,
        });
        await rct.save();
        const react = await React.find({ messageId });
        io.of("/reactions").to(messageId).emit("getallreacts", { react:react.length });
      }
    });

    socket.on("disconnect", () => {
      console.log("Reaction is lost.");
    });
  });
}

module.exports = LikeSocket;

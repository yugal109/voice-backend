const mongoose = require("mongoose");
const React = require("../models/ReactionModel");

// function LikeSocket(io) {
//   io.of("/reactions").on("connection", async (socket) => {
//     socket.on("join", async ({messageId}) => {
//       const react = await React.find({ messageId: messageId});
//       socket.emit("getallreacts", { react:react.length });
//       socket.join(messageId);
//     });

//     socket.on("reaction", async ({ messageId, userId, reacts }) => {
//       let react = await React.findOne({ messageId, userId });
//       if (react) {
//         if (react.reacts == reacts) {
//           await React.deleteOne({ messageId, userId });
//           const rxt=await React.find({ messageId });
//           io.of("/reactions").to(messageId).emit("getallreacts", { react:rxt.length });
//         } else {
//           react.reacts = reacts;
//           await react.save();
//           const rxt=await React.find({ messageId });
//           io.of("/reactions").to(messageId).emit("getallreacts", { react:rxt.length });
//         }
//       } else {
//         const rct = new React({
//           messageId,
//           userId,
//           reacts,
//         });
//         await rct.save();
//         const react = await React.find({ messageId });
//         io.of("/reactions").to(messageId).emit("getallreacts", { react:react.length });
//       }
//     });

//     socket.on("disconnect", () => {
//       console.log("Reaction is lost.");
//     });
//   });
// }

function LikeSocket(io) {
  io.of("/reactions").on("connection", async (socket) => {
    console.log("Connected.....");
    socket.on("join", async ({ messageId }) => {
      const rm = await React.findOne({ messageId });
      socket.emit("getallreacts", { react: rm?.reactions.length });
      socket.join(messageId);
    });
    socket.on("reaction", async ({ messageId, userId, reacts }) => {
      const react = await React.findOne({ messageId });
      const rxt = react?.reactions.find(e=>e.userId==userId);
      if (rxt) {
        if (rxt.reacts == reacts) {
        //   Dive.update({ _id: diveId }, { "$pull": { "divers": { "user": userIdToRemove } }}, { safe: true, multi:true }, function(err, obj) {
        //     //do something smart
        // });
          // react.reactions.pull({userId})
          // await react?.save();
          //  const RXT = await React.findOne({ messageId });
          // io.of("/reactions")
          //   .to(messageId)
          //   .emit("getallreacts", { react: RXT?.reactions?.length });
        } else {
          rxt.reacts = reacts;
          await react?.save();
          const rm = await React.findOne({ messageId });
          io.of("/reactions")
            .to(messageId)
            .emit("getallreacts", { react: rm?.reactions?.length });
        }
      } else {
        const react=new React({
          messageId,
          reactions:[{userId,reacts}]
        })
        await react.save()
        io.of("/reactions")
          .to(messageId)
          .emit("getallreacts", { react: react?.reactions?.length });
      }
    });
    socket.on("disconnect", () => {
      console.log("Reaction is lost.");
    });
  });
}
module.exports = LikeSocket;

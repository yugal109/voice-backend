const User = require("../models/Users");
const Chat = require("../models/ChatModel");
const client = require("../cache/redis");
const Message = require("../models/MessageModal");
const res = require("express/lib/response");

function messageSocket(io) {
  io.on("connection", (socket) => {
    socket.on("join", async ({ id, room }) => {
      console.log("JOINEDDDDDDDD", room);
      // const user = await User.findById(id);
      // if (!user) return callback({ error: "User doesnot exist" });
      socket.join(room);
    });

    socket.on("messageSend", async ({ message, userId, room }, callback) => {
      let mssg = new Message({
        chatRoom: room,
        message,
        user: userId,
      });

      await mssg.save();

      const chat = await Chat.findById(room);
      chat.lastMessage = {
        user: userId,
        message: message,
        created_at: new Date(),
      };
      await chat.save();

      const messages = await Message.findOne({ _id: mssg._id }).populate(
        "user"
      );

      io.to(room).emit("messageFromServer", { msg: messages });
      // console.log(chat.admin);
      // console.log(userId);

      // console.log(chat.admin == userId);

      if (chat.admin == userId) {
        const inboxlist = await Chat.find({
          $or: [
            { users: { $elemMatch: { userId: userId } } },
            { admin: userId },
          ],
        }).sort({ "lastMessage.created_at": -1 })
        const socket=io.of("/inbox")
        socket.to(chat.admin.toString()).emit("inboxList", inboxlist);
      } 
      else{

        const inboxlist = await Chat.find({
          $or: [
            { users: { $elemMatch: { userId: chat.admin } } },
            { admin: chat.admin },
          ],
        }).sort({ "lastMessage.created_at": -1 })
        const socket=io.of("/inbox")
        socket.to(chat.admin.toString()).emit("inboxList", inboxlist);

      }

        for (let i = 0; i < chat.users.length; i++) {
          // if (chat.users[i].admin.toString() != userId) {
            // console.log(chat.users[i].userId,typeof(chat.users[i].userId))
            // console.log(userId,typeof(userId))
            const inboxlist = await Chat.find({
              $or: [
                {
                  users: {
                    $elemMatch: {
                      userId:
                        chat.users[i].userId && chat.users[i].userId.toString(),
                    },
                  },
                },
                { admin: chat.users[i].userId.toString() },
              ],
            }).sort({ "lastMessage.created_at": -1 });

            console.log("The chats are",inboxlist)

            const socket=io.of("/inbox");

            socket.to(chat.users[i].userId.toString())
              .emit("inboxList", inboxlist);
          // }
        // }
      }

      // socket.emit("sentMessage",{msg:messages[0]})
    });

    socket.on("typing", ({ user }) => {
      // console.log(user)
      socket.broadcast.emit("userTyping", { message: user });
    });

    socket.on("likeMessage", async ({ messageId, userId, room }) => {
      const message = await Message.findOne({
        _id: messageId,
        "reactions.userId": userId,
      });
      if (message) {
        await Message.updateOne(
          { _id: messageId },
          { $pull: { reactions: { userId: userId } } }
        );
        io.to(room).emit("reactionInMessage", { status: 0, msgId: messageId });
      } else {
        const msg = await Message.findOne({ _id: messageId });
        msg.reactions.push({ userId: userId });
        await msg.save();
        io.to(room).emit("reactionInMessage", { status: 1, msgId: messageId });
      }
    });

    socket.on("yugal", (data) => {
      console.log("TYPING.........");
    });

    socket.on("disconnect", () => {
      console.log("User was lost.");
      socket.disconnect();
    });
  });
}

module.exports = messageSocket;

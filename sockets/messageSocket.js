const User = require("../models/Users");
const Chat = require("../models/ChatModel");

function messageSocket(io) {
  io.on("connection", async (socket) => {
    socket.on("join", async ({ id, room }, callback) => {
      const user = await User.findById(id);
      if (!user) return callback({ error: "User doesnot exist" });

      const rm = await Chat.findById(room).populate({
        path: "messages",
        populate: [
          {
            path: "user",
            model: "User",
          },
        ],
      });
      socket.emit("room",rm)
      // const userExist = rm?.users?.find((users) => users?.userId == id);

      // if (!userExist && rm?.admin._id != id) {
      //   rm?.users.push({ userId: id });
      //   await rm?.save();
      // }
      
      if (!rm) return callback({ error: "This room doesnot exist." });

      socket.emit("message", {
        user: rm?.admin.username,
        text: `Welcome ${user.username} `,
      });
      socket.broadcast.to(room).emit("message", {
        user: rm?.admin.username,
        text: `${user.username} has joined the chat.`,
      });
      socket.emit("allmessage", { messages: rm?.messages });
      socket.join(room);
    });

    socket.on("sendMessage", async (information, callback) => {
      const user = await User.findById(information.id);
      const rm = await Chat.findById(information.room);
      rm?.messages.push({ user: user._id, message: information.message });
      await rm?.save();
      const RM = await Chat.findById(information.room).populate({
        path: "messages",
        populate: [
          {
            path: "user",
            model: "User",
          },
        ],
      });
      io.to(information.room).emit("allmessage", { messages: RM?.messages });
     
    });

    socket.on("yugal", (data) => {
      console.log("TYPING.........");
    });

    socket.on("disconnect", () => {
      console.log("User was lost.");
    });
  });
}

module.exports = messageSocket;

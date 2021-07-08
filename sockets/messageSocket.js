const User = require("../models/Users");
const Chat=require('../models/ChatModel')

function messageSocket(io){

    io.on("connection", async (socket) => {
        socket.on("join", async ({ id, room }, callback) => {
          const user = await User.findById(id);
          if (!user) return callback({ error: "User doesnot exist" });
      
          const rm = await Chat.findById(room).populate("admin");
      
          if (!rm) return callback({ error: "This room doesnot exist." });
      
          socket.emit("message", {
            user: rm.admin.username,
            text: `Welcome ${user.username} `,
          });
          socket.broadcast
            .to(room)
            .emit("message", {
              user: rm.admin.username,
              text: `${user.username} has joined the chat.`,
            });
      
          socket.emit("allmessage", { messages: rm.messages });
          socket.join(room);
        });
      
        socket.on("sendMessage", async (information, callback) => {
          const user = await User.findById(information.id);
          const rm = await Chat.findById(information.room);
          rm.users.push({userId:user._id})
          rm.messages.push({ user: user._id, message: information.message });
          await rm.save();
          io.to(information.room).emit("allmessage", { messages: rm.messages });
        });
      
        socket.on("yugal", (data) => {
          console.log("TYPING.........");
        });
      
        socket.on("disconnect", () => {
          console.log("User was lost.");
        });
      });
      

}

module.exports=messageSocket;
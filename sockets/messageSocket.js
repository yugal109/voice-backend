const User = require("../models/Users");
const Chat = require("../models/ChatModel");
const client = require("../cache/redis");
const Message = require("../models/MessageModal");
const res = require("express/lib/response");

function messageSocket(io) {
  io.on("connection",(socket) => {

    socket.on("join", async ({ id, room }) => {
      console.log("JOINEDDDDDDDD",room);
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

      const chat=await Chat.findById(room)
      chat.lastMessage={
        user:userId,
        message:message,
        created_at:new Date()
      }
      await chat.save();

      const messages = await Message.findOne({ _id: mssg._id }).populate(
        "user"
      );
      
      io.to(room).emit("messageFromServer", { msg: messages });
      

      const inboxlist = await Chat.find({
        $or: [
          { users: { $elemMatch: { userId: userId} } },
          { admin: userId },
        ],
      }).sort({"lastMessage.created_at":-1});
      io.of("/inbox").to((chat.admin).toString()).emit("inboxList",inboxlist)
   

      for(let i=0;i<chat.users.length;i++){

          io.of("/inbox").to((chat.users[i].userId).toString()).emit("inboxList",inboxlist)
        
      }

      // socket.emit("sentMessage",{msg:messages[0]})
    });

    socket.on("typing", ({ user }) => {
      // console.log(user)
      socket.broadcast.emit("userTyping", { message: user });
    });

    

    // socket.on("sendMessage", async (information, callback) => {
    //   const user = await User.findById(information.id);
    //   const rm = await Chat.findById(information.room);
    //   rm?.messages.push({ user: user._id, message: information.message });
    //   await rm?.save();
    //   const RM = await Chat.findById(information.room).populate({
    //     path: "messages",
    //     populate: [
    //       {
    //         path: "user",
    //         model: "User",
    //       },
    //     ],
    //   });
    //   io.to(information.room).emit("allmessage", { messages: RM?.messages });
    // });

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

const User = require("../models/Users");
const Chat = require("../models/ChatModel");
const client = require("../cache/redis");
const Message = require("../models/MessageModal");
const res = require("express/lib/response");

function messageSocket(io) {
  io.on("connection", async (socket) => {
    // console.log("connected")
    // socket.emit("conn",{data:`Connected ${socket.id}`})

    socket.on("join", async ({ id, room }, callback) => {
          console.log("JOINEDDDDDDDD")
          const user = await User.findById(id);
          if (!user) return callback({ error: "User doesnot exist" });

          // const chatRoom=await Chat.findById(room)
              
          // const present =chatRoom.users.some(e=>e.userId._id==id)|| chatRoom.admin==id

          // if(present){

          // //   const messages=await Message.find({chatRoom:room}).populate('user')
          // // socket.emit("allMessage",{messages})
          // // socket.join(room);

          // }

          socket.join(room);
          console.log("JOINEDDDDDDD",socket.id)

    });

    socket.on("messageSend",async({message,userId,room},callback)=>{
      let mssg=new Message({
        chatRoom:room,
        message,
        user:userId
      })

      await mssg.save()
      // console.log(mssg)

      const messages=await Message.find({_id:mssg._id}).populate('user')
      console.log(messages)


      io.to(room).emit("sentMessage",{msg:messages[0]})
      // socket.emit("sentMessage",{msg:messages[0]})
      
    })

    socket.on("typing",({user})=>{
      // console.log(user)
      socket.broadcast.emit("userTyping",{message:user})
    })



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
    });
  });
}

module.exports = messageSocket;

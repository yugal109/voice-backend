const User = require("../models/Users");
const Chat = require("../models/ChatModel");
const client = require("../cache/redis");
const Message = require("../models/MessageModal");
const res = require("express/lib/response");

function messageSocket(io) {
  io.on("connection", (socket) => {


    socket.on("join", async ({ id, room }) => {
      const user=await User.findById(id)
      socket.join(room);

      socket.emit("welcome",{user:user})

      socket.broadcast.emit("notification",{user:user})
    });

///VIDEO CHAT RELATED
  socket.emit("me", socket.id);

	socket.on("disconnect", () => {
		socket.broadcast.emit("callEnded")
	});

	socket.on("callUser", ({ userToCall, signalData, from, name }) => {
		io.to(userToCall).emit("callUser", { signal: signalData, from, name });
	});

	socket.on("answerCall", (data) => {
		io.to(data.to).emit("callAccepted", data.signal)
	});

  //VIDEO CHAT RELATED


    socket.on("messageSend", async ({ message, userId, room,url }, callback) => {
      if(url===""){
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
      }

      }else{
        let mssg = new Message({
          chatRoom: room,
          image:url,
          user: userId,
        });
  
        await mssg.save();

        const chat = await Chat.findById(room);
        chat.lastMessage = {
          user: userId,
          message: "Image was sent .",
          created_at: new Date(),
        };
        await chat.save();
  
        const messages = await Message.findOne({ _id: mssg._id }).populate(
          "user"
        );

        io.to(room).emit("messageFromServer", { msg: messages });


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
      }
      
      }

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

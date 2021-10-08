const Chat=require("../models/ChatModel")

const inboxSocket=(io)=>{

    io.of("/inbox").on("connection",async (socket)=>{
        console.log("Connected to Inbox Socket.")
        socket.on("join",async(data)=>{
            socket.join(data.userId)

            const inboxlist = await Chat.find({
                $or: [
                  { users: { $elemMatch: { userId: data.userId} } },
                  { admin: data.userId },
                ],
              });
              socket.emit("inboxList",inboxlist)

        })
    })


}

module.exports =inboxSocket
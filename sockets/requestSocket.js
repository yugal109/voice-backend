const Request = require("../models/RequestModel");
const Chat = require("../models/ChatModel");
const User = require("../models/Users");

const requestSocket = (io) => {

  io.of("/requests").on("connection", async (socket) => {
    console.log("Connected to NAVBAR.");
   
    socket.on("join",async(data)=>{
      socket.join(data.userId)
      
      const requests = await Request.find({
        acceptor: data.userId,
        //  status:"pending"
      }).populate("requestor");

      socket.emit("allRequests",requests.length)
    })

    socket.on("disconnect",()=>{
      console.log("Notifiactions removed.")
    })

  

    // socket.on("join", (data) => {
    //   socket.join(data);
    // });

    // socket.on("allrequests", async (data) => {
    //   const requests = await Request.find({ acceptor: data.id }).populate(
    //     "requestor acceptor"
    //   );
    //   socket.emit("get_all_requests", { requests });
    // });

    // socket.on("accept_friend_request", async (data) => {
    //   const request = await Request.findById(data.requestId);
    //   request.status = "accepted";
    //   await request.save();
    //   const user = await User.findById(data.userId);

    //   user.friends.push({ userId: data.requestorId });
    //   await user.save();
    //   const requests = await Request.find({ acceptor: data.userId }).populate(
    //     "requestor"
    //   );
    //   io.of("/requests").to(data.userId).emit("notifications", requests.length);
    //   io.of("/requests").to(data.userId).emit("get_all_requests", { requests });
    // });

    // socket.on("delete_friend_request", async (data) => {
    //   const request = await Request.findByIdAndDelete(data.requestId);

    //   const requests = await Request.find({ acceptor: data.userId }).populate(
    //     "requestor"
    //   );
    //   io.of("/requests").to(data.userId).emit("notifications", requests.length);
    //   io.of("/requests").to(data.userId).emit("get_all_requests", { requests });
    // });

    // socket.on("inviteusers", async (data) => {
    //   const { acceptor, requestor, roomId, roomName } = data;

    //   const request = new Request({
    //     acceptor: acceptor,
    //     requestType: "invitation",
    //     requestor: requestor,
    //     roomId,
    //     roomName,
    //   });
    //   await request.save();
    //   console.log(request);
    //   const requests = await Request.find({ acceptor }).populate("requestor");
    //   io.of("/requests").to(acceptor).emit("notifications", requests.length);
    //   io.of("/requests").to(acceptor).emit("get_all_requests", { requests });
    // });

    // socket.on("invite_all_users",  (invitationList) => {
    //   invitationList.map(async (invite) => {
    //     const REQ = await Request.findOne({
    //       acceptor: invite.acceptor,
    //       requestType: "invitation",
    //       roomId: invite.roomId,
    //       requestor: invite.requestor,
    //     });
    //     if (!REQ) {
    //       const request = new Request({
    //         acceptor: invite.acceptor,
    //         requestType: "invitation",
    //         requestor: invite.requestor,
    //         roomId: invite.roomId,
    //         roomName: invite.roomName,
    //       });
    //       await request.save();
    //       const requests = await Request.find({
    //         acceptor: invite.acceptor,
    //       }).populate("requestor");
    //       io.of("/requests")
    //         .to(invite.acceptor)
    //         .emit("notifications", requests.length);
    //       io.of("/requests")
    //         .to(invite.acceptor)
    //         .emit("get_all_requests", { requests });
    //     }else{
    //       console.log("Request already exists.")
    //     }
    //   });
    // });

    // socket.on("accept_request", async ({ userId, roomId, requestId }) => {
    //   const chat = await Chat.findById(roomId);
    //   chat.users.push({ userId });
    //   await chat.save();
    //   const request = await Request.findById(requestId);
    //   request.status = "accepted";
    //   await request.save();
    //   const requests = await Request.find({ acceptor: userId });
    //   io.of("/requests").to(userId).emit("notifications", requests.length);
    //   socket.emit("success",{success:true})
    // });
  });
};

module.exports = requestSocket;

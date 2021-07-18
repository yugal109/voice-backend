const Request = require("../models/RequestModel");
const Chat =require("../models/ChatModel")
const requestSocket = (io) => {
  io.of("/requests").on("connection", async (socket) => {
    console.log("Connection..............");

    socket.on("join", (data) => {
      socket.join(data);
    });

    socket.on("allrequests", async (data) => {
      const requests = await Request.find({ acceptor: data.id }).populate(
        "requestor"
      );
      socket.emit("get_all_requests", { requests });
    });

    socket.on("inviteusers", async (data) => {
      const { acceptor, requestor, roomId, roomName } = data;
      

      const request = new Request({
        acceptor: acceptor,
        requestType: "invitation",
        requestor: requestor,
        roomId,
        roomName,
      });
      await request.save();
      console.log(request)
      const requests = await Request.find({ acceptor }).populate("requestor");
      io.of("/requests").to(acceptor).emit("notifications", requests.length);
      io.of("/requests").to(acceptor).emit("get_all_requests", { requests });
    });

    socket.on("accept_request", async ({ userId, roomId,requestId}) => {
      const chat = await Chat.findById(roomId);
      chat?.users.push({ userId });
      await chat.save();
      const request = await Request.findById(requestId);
      request.status = "accepted";
      await request.save();
      const requests = await Request.find({ acceptor:userId });
      io.of("/requests").to(userId).emit("notifications", requests.length);

    });
  });
};

module.exports = requestSocket;

const Request = require("../models/RequestModel");
const Chat = require("../models/ChatModel");
const User = require("../models/Users");

const requestSocket = (io) => {
  io.of("/requests").on("connection", async (socket) => {
    console.log("Connected to NAVBAR.");

    socket.on("join", async (data) => {
      socket.join(data.userId);

      const requests = await Request.find({
        acceptor: data.userId,
        //  status:"pending"
      }).populate("requestor");

      socket.emit("allRequests", requests.length);
    });

    socket.on("disconnect", () => {
      console.log("Notifiactions removed.");
    });
  });
};

module.exports = requestSocket;

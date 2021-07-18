const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
  requestType: {
    type: String,
    enum: ["invitation", "friend_request"],
    required: true,
  },
  requestor: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  acceptor: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  status:{
      type:String,
      enum:["pending","accepted"],
      required:true,
      default:"pending"
  },
  roomId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chat",
  },
  roomName:{
    type:String,
    maxlength:100
  }

});

const Request = mongoose.model("Request", requestSchema);

module.exports = Request;

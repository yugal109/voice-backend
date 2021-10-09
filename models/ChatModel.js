const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    message: {
      type: String,
      min: 1,
    },
  },
  { timestamps: true }
);

const userListSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
});

const chatSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 100,
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  users: [userListSchema],
  roomType: {
    type: String,
    required: true,
    enum: ["open", "closed"],
    default: "closed",
  },
  lastMessage: {
    user: {
      type: mongoose.Schema.Types.ObjectId,
     
      ref: "User",
   
    },
    message: {
      type:String,
   
    },
    created_at:{type:Date,default:Date.now}
  },
  expire_at: { type: Date, expires: 86400 },
});

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;

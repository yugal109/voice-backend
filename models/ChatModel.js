const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  message: {
    type: String,
    min: 1,
  },
});

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
  messages: [
    messageSchema,
    {
      timestamps: true,
    },
  ],
  expire_at: { type: Date, default: Date.now, expires: 86400 },
});

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;

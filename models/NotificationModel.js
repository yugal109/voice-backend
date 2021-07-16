const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  notificationType: {
    type: String,
    enum: ["invitation", "friend_request"],
    required: true,
  },
  generator: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  reciver: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  }
});

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = ReqNotificationuest;

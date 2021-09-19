const express = require("express");
const Message = require("../models/MessageModal");
const router = express.Router();
const Chat = require("../models/ChatModel");
const auth = require("../middleware/auth");

router.get("/:chatRoomId", [auth], async (req, res) => {
  const chatRoomId = req.params.chatRoomId;

  const rom = await Chat.findById(chatRoomId);
  console.log(rom.users.filter(e=>e.userId!==req.user._id))
  console.log(rom.admin==req.user._id)
  if(rom.users.filter(e=>e.userId!==req.user._id).length !== 0 || rom.admin==req.user._id){

    const messages = await Message.find({
      chatRoom: chatRoomId,
    }).populate("user");
  
    return res.send(messages);
  }else{
    throw new Error("FUCKKKKKK")
    res.send("Not Found")
  }

});

module.exports = router;

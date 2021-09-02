const express=require("express")
const Message=require("../models/MessageModal")
const router=express.Router()
const auth=require("../middleware/auth")


router.get("/:chatRoomId",[auth],async(req,res)=>{

    const messages=await Message.find({chatRoom:req.params.chatRoomId}).populate('user')
    return res.send(messages)

})

module.exports =router
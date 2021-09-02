const mongoose=require("mongoose")

const messageSchema = new mongoose.Schema({
    chatRoom:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"Chat"
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    message: {
      type: String,
      min: 1,
    },
  },{timestamps:true});

  const Message=mongoose.model("Message",messageSchema)

  module.exports=Message
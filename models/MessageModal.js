const mongoose=require("mongoose")

const reactionSchema= new mongoose.Schema({
  
    userId:{
      type:mongoose.Schema.Types.ObjectId,
      required:true,
      ref:"User"
    }
  
})

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
    image:{
      type:String
    },
    reactions:{
      type:[reactionSchema],
      default:[]
    }
  },{timestamps:true});

  const Message=mongoose.model("Message",messageSchema)

  module.exports=Message
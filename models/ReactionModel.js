const mongoose =require("mongoose")


const reactSchema=new mongoose.Schema({
    messageId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'

    },
    reacts:{
        type:String,
        enum:["like","haha","love","angry","cry"],
        required:true
    }
})

const React=mongoose.model("React",reactSchema)
module.exports=React
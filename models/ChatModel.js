const mongoose =require("mongoose")

const reactSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    reaction:{
        type:String,
        enum:["love","like","haha"]
    }
})

const messageSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    message:{
    type:String,
    min:1
    },
    reacts:[reactSchema]

    
})
const chatSchema=new mongoose.Schema({
        admin:{
            type:mongoose.Schema.Types.ObjectId,
            required:true,
            ref:"User"
        },
        messages:[messageSchema,{
            timestamps:true
        }]

})

const Chat=mongoose.model("Chat",chatSchema)

module.exports=Chat;
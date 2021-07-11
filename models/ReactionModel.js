const mongoose = require("mongoose");

// const reactSchema=new mongoose.Schema({
//     messageId:{
//         type:mongoose.Schema.Types.ObjectId,
//         required:true,
//     },
//     userId:{
//         type:mongoose.Schema.Types.ObjectId,
//         required:true,
//         ref:'User'

//     },
//     reacts:{
//         type:String,
//         enum:["like","haha","love","angry","sad"],
//         required:true
//     }
// })

const reactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  reacts: {
    type: String,
    enum: ["like", "haha", "love", "angry", "sad"],
    required: true,
  },
});

const reactSchema = new mongoose.Schema({
  messageId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  reactions: [reactionSchema],
});

const React = mongoose.model("React", reactSchema);
module.exports = React;

const mongoose=require("mongoose")
const jwt=require("jsonwebtoken")
require('dotenv').config()

const userSchema=new mongoose.Schema({
    fullname:{
        type:String,
        min_length:3,
        max_length:255,
        required:true
    },
    username:{
        type:String,
        min_length:3,
        max_length:255,
        required:true
    },
    email:{
        type:String,
        unique:true,
        required:true
    },
    password:{
        type:String,
        min_length:10,
        max_length:500,
        required:true
    },
    accountType:{
        type:String,
        enum:["private","public"],
        default:"public"  
    },
    isAdmin:{
        type:Boolean,
        default:false
    },
    image:{
        type:String,
        default:"https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwincomm-cdn-prod-westus.azureedge.net%2Flibs%2Fassets%2Fimg%2Fdefault-user-placeholder.png&f=1&nofb=1"
    }
})

userSchema.methods.generateToken=function(){
    const token=jwt.sign({_id:this._id,isAdmin:this.isAdmin,accountType:this.accountType},process.env.SECRET_KEY)
    return token;
}


const User=mongoose.model("User",userSchema)

module.exports=User
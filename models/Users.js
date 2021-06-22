const mongoose=require("mongoose")
const jwt=require("jsonwebtoken")
require('dotenv').config()

const userSchema=new mongoose.Schema({
    firstname:{
        type:String,
        min_length:3,
        max_length:255,
        required:true
    },
    lastname:{
        type:String,
        min_length:1,
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
        // validate:{
        //     validator:function(value){

        //     }
        // }
    },
    password:{
        type:String,
        min_length:10,
        max_length:500,
        required:true
    },
    phonenumber:{
        type:String,
        min_length:10,
        max_length:10,
        required:true
    },
    address:{
        type:String,
        min_length:5,
        max_length:100,
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
    const token=jwt.sign({_id:this._id,isAdmin:this.isAdmin,userType:this.userType},process.env.SECRET_KEY)
    return token;
}


const User=mongoose.model("User",userSchema)

module.exports=User
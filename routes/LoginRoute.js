const express=require("express")
const bcrypt=require("bcrypt")
const User=require("../models/Users")
const asyncHandler=require("express-async-handler")
const router=express.Router()

router.post("/",asyncHandler(async(req,res)=>{
    const {email,password}=req.body;
    
    const user=await User.findOne({email})
    if(!email) return res.status(404).send("Wrong email or password.")

    const validUser=await bcrypt.compare(password,user.password)
    if(!validUser) return res.status(404).send("Wrong email or password.")

    const token=user.generateToken()
    res.send(token)
}))

module.exports=router
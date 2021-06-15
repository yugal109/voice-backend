const Joi=require("joi")
const express=require("express")
const _=require("lodash")
const bcrypt=require("bcrypt")
const User=require("../models/Users")
const asyncHandler=require("express-async-handler")
const router=express.Router()

router.get("",(req,res)=>{
    res.send("Dumb whores.")
})

router.post("/",asyncHandler(async(req,res)=>{
    const {value,error}=validate(req.body)
    //IF ERROR IN POSTING DATA
    if(error) return res.send({message:error.details[0].message})
    
    const {firstname,lastname,address,username,email,password,userType,phonenumber}=req.body

    //HASHING THE PASSWORD
    const salt=await bcrypt.genSalt(10)
    const hashedPassword=await bcrypt.hash(password,salt)
    
    //CREATING USER 
    const user=new User({
        firstname,
        lastname,
        username,
        email,
        password:hashedPassword,
        address,
        userType,
        phonenumber  

    })
    await user.save()
    let result=_.pick(user,["firstname","lastname","username","email","address","userType","phonenumber"])
    // result=_.concat(result,user.generateToken())
    res.send(result)
}
)
)


module.exports=router;

function validate(data){
    const schema=Joi.object({
        firstname: Joi.string()
        .min(3)
        .max(30)
        .required(),

        lastname: Joi.string()
        .min(3)
        .max(30)
        .required(),

        username: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required(),

        email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),

        password: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),

        phonenumber:Joi.string().min(5).max(10).required(),

        userType:Joi.string().min(5).required(),

        address: Joi.string()
        .alphanum()
        .min(5)
        .max(100)
        .required(),

    })
    return schema.validate(data)

}

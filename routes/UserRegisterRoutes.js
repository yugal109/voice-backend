const Joi = require("joi")
const express = require("express")
const _ = require("lodash")
const bcrypt = require("bcrypt")
const User = require("../models/Users")
const asyncHandler = require("express-async-handler")
const router = express.Router()
const auth = require("../middleware/auth")
const isTeacher = require("../middleware/isTeacher")

// ONLY TEACHERS CAN ACCESS THIS --->> LIST OF ALL THE STUDENTENTS
router.get("/", [auth], asyncHandler(async (req, res) => {
    const users = await User.find().sort({ name: 1 })
    res.send(users)
}))


router.get("/:id", [auth], asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).send("User not found.")

   
        res.send({
            id: user.id,
            username: user.username,
            email: user.email,
            fullname:user.fullname,
            accountType: user.accountType,
            image: user.image

        })
    

}))

//CREATING A USER
router.post("/", asyncHandler(async (req, res) => {
    const { value, error } = validate(req.body)
    //IF ERROR IN POSTING DATA
    if (error) return res.send({ message: error.details[0].message })

    const { fullname, username, email, password, userType } = req.body

    //HASHING THE PASSWORD
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    //CREATING USER 
    const user = new User({
        fullname,
        username,
        email,
        password: hashedPassword,
        userType
        

    })
    await user.save()
    let result = _.pick(user, ["fullname", "username", "email", "address", "accountType"])
    res.send(result)
}
)
)

//update only for acoount privacy
router.put("/:id",[auth],asyncHandler(async(req,res)=>{
    const user=await User.findById(req.params.id)
    if(!user) return res.status(404).send("User not found")
   
    if(req.user._id==user._id){
    if(user.accountType=="public"){
        user.accountType="private"
        
    }else{
        user.accountType="public"

    }
    await user.save()
    res.send("Updated")
    }else{
        res.status(403).send("Not Authorized.")
    }
    
}))

router.put("/all/:id",[auth],asyncHandler(async(req,res)=>{
    const {username}=req.body
    const user=await User.findById(req.params.id)
    if(!user) return res.status(404).send("User not found")
   
    if(req.user._id=user._id){
    user.username=username;
    await user.save()
    res.send("Updated")
    }else{
        res.status(403).send("Not Authorized.")
    }
    
}))


module.exports = router;

function validate(data) {
    const schema = Joi.object({
        fullname: Joi.string()
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

        userType: Joi.string().min(5),

        

    })
    return schema.validate(data)

}

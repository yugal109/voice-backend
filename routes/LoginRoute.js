const express = require("express")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { OAuth2Client } = require('google-auth-library');
const User = require("../models/Users")
const asyncHandler = require("express-async-handler")
const router = express.Router()
require("dotenv").config()


const client = new OAuth2Client(process.env.CLIENT_ID)


router.post("/", asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email })
    
    if (user==null) return res.status(404).send("Wrong email or password.")

    const validUser = await bcrypt.compare(password, user.password)
    if (!validUser) return res.status(404).send("Wrong email or password.")

    const token = user.generateToken()
    
    res.send({
        id: user._id,
        username: user.username,
        email: user.email,
        fullname: user.fullname,
        accountType: user.accountType,
        image:user.image,
        token
    })
}))

router.post("/googlelogin", asyncHandler(async (req, res) => {
    
    const tokenId = req.body.tokenId;
    
    client.verifyIdToken({ idToken: tokenId, audience: process.env.CLIENT_ID })
        .then(async (response) => {
            const { email_verified, name, given_name,picture:image, family_name, email, picture } = response.payload;
            if (email_verified) {
                const user = await User.findOne({ email })
                if (user) {
                    const token = user.generateToken();
                    res.send({
                        id: user._id,
                        username: user.username,
                        email: user.email,
                        fullname: user.fullname,
                        accountType: user.accountType,
                        image:user.image,
                        token
                    })
                } else {
                    const salt = await bcrypt.genSalt(10)
                    const hashedPassword = await bcrypt.hash(email + process.env.SECRET_KEY, salt)

                    let user = new User({
                        fullname:given_name+" "+family_name,
                        username: name,
                        email,
                        image: picture,
                        password: hashedPassword,
                        image:image

                    })
                    await user.save()
                    const token = user.generateToken();
                    res.send({
                        id: user._id,
                        username: user.username,
                        email: user.email,
                        firstname: user.fullname,
                        accountType: user.accountType,
                        image:user.image,
                        token
                    })
                }
            }

        })
        .catch((error) => {
            console.log(error)
        })

}))


router.post("/facebooklogin", asyncHandler(async (req, res) => {
    const { name, email, picture } = req.body.data;

    const user = await User.findOne({ email })
    if (user) {
        res.send({
            id: user._id,
            username: user.username,
            email: user.email,
            fullname: user.fullname,
            token: user.generateToken()
        })


    }
    else {


        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(email + process.env.SECRET_KEY, salt)

        const user = new User({
            fullname: "fullname",
            username: name,
            email,
            password: hashedPassword,
            image: picture.data.url,
        })

        await user.save()
        const token = jwt.sign({ _id: user._id, isAdmin: user.isAdmin, userType: user.userType },
            process.env.SECRET_KEY)

        res.send({
            id: user._id,
            username: user.username,
            email: user.email,
            firstname: user.fullname,
            token
        })


    }

}))


module.exports = router
const express = require("express")
const bcrypt = require("bcrypt")
const { OAuth2Client } = require('google-auth-library');
const User = require("../models/Users")
const asyncHandler = require("express-async-handler")
const router = express.Router()
require("dotenv").config()


const client = new OAuth2Client(process.env.CLIENT_ID)


router.post("/", asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email })
    if (!email) return res.status(404).send("Wrong email or password.")

    const validUser = await bcrypt.compare(password, user.password)
    if (!validUser) return res.status(404).send("Wrong email or password.")

    const token = user.generateToken()
    res.send({
        id: user._id,
        username: user.username,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        token
    })
}))

router.post("/googlelogin", asyncHandler(async (req, res) => {

    const tokenId = req.body.tokenId;
    client.verifyIdToken({ idToken: tokenId, audience: process.env.CLIENT_ID })
        .then(async (response) => {
            const { email_verified, name, given_name, family_name, email, picture } = response.payload;
            if (email_verified) {
                const usr = await User.findOne({ email })
                if (usr) {
                    res.status(404).send({message:"User with this google account already exists."})
                } else {
                    const salt = await bcrypt.genSalt(10)
                    const hashedPassword = await bcrypt.hash(email+process.env.SECRET_KEY, salt)

                    let user = new User({
                        firstname:given_name,
                        lastname:family_name,
                        username:name,
                        email,
                        image:picture,
                        password:hashedPassword,
                        address:"No address",
                        phonenumber:"9800000000",
                        
                    })
                    await user.save()
                    const token=user.generateToken();
                    res.send({
                        id: user._id,
                        username: user.username,
                        email: user.email,
                        firstname: user.firstname,
                        lastname: user.lastname,
                        token
                    })
                }
            }

        })
        .catch((error) => {
            console.log(error)
        })

}))



module.exports = router
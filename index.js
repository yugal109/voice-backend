const express=require("express")
const cors=require("cors")
const app=express()
const connect=require("./database")
const UserRegisterRoutes=require("./routes/UserRegisterRoutes")
const LoginRoutes=require("./routes/LoginRoute")
require('dotenv').config()
connect();

//MIDDLEWARES

//FOR CROSS-ORIGIN
app.use(cors())
//



app.use(express.json())

// REGISTER ROUTES 
app.use("/users",UserRegisterRoutes)

//LOGIN ROUTES
app.use("/login",LoginRoutes)



const PORT=process.env.PORT || 5002

app.listen(PORT,()=>{
    console.log(`Server is running on the port ${PORT}`)
})






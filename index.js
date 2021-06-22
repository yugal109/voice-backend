const express=require("express")
const cors=require("cors")
const app=express()
const connect=require("./database")
const UserRegisterRoutes=require("./routes/UserRegisterRoutes")
const LoginRoutes=require("./routes/LoginRoute")
require('dotenv').config()
const socketio=require("socket.io")
const Chat=require("./models/ChatModel")
const User=require("./models/Users")
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

const server=app.listen(PORT,()=>{
    console.log(`Server is running on the port ${PORT}`)
})

const io=socketio(server, {cors: {
    origin: '*',
  }})


io.on("connection",async (socket)=>{
    console.log("He have a connection")
    
    socket.on("join",async ({id,room},callback)=>{

        const user=await User.findById(id)
        if(!user) return callback({error:"User doesnot exist"})

        
        const rm=await Chat.findById(room).populate('admin')
        if(!rm) return callback({error:"This room doesnot exist."})
        

        socket.emit("message",{user:rm.admin.username,text:`Welcome ${user.username} `})
        socket.broadcast.to(room).emit("message",{user:rm.admin.username,text:`${user.username} has joined the chat.`})

        socket.emit("allmessage",{messages: rm.messages})
        socket.join(room);
    })

    socket.on("sendMessage",async (information,callback)=>{
        const user=await User.findById(information.id);
        const rm=await Chat.findById(information.room)
        rm.messages.push({user:user._id,message:information.message})
        await rm.save();
        
        io.to(information.room).emit('allmessage',{messages:rm.messages});
    })

    socket.on("disconnect",()=>{
        console.log("User was lost.")
    })
})

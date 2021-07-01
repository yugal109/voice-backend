const express=require("express")
const cors=require("cors")
const app=express()
const jwt=require("jsonwebtoken")
const connect=require("./database")
const UserRegisterRoutes=require("./routes/UserRegisterRoutes")
const LoginRoutes=require("./routes/LoginRoute")
require('dotenv').config()
const socketio=require("socket.io")
const Chat=require("./models/ChatModel")
const User=require("./models/Users")
const auth=require("./middleware/auth")
const Redis=require("redis")
connect();


//MIDDLEWARES

//FOR CROSS-ORIGIN
app.use(cors())
app.use(express.json())


const redisClient=Redis.createClient()
const EXPIRATION_TIME=3600;




// REGISTER ROUTES 
app.use("/users",UserRegisterRoutes)

//LOGIN ROUTES
app.use("/login",LoginRoutes)

app.post("/create",[auth],(async(req,res)=>{
    const room=new Chat({
        admin:req.user
    })

    await room.save()

    const roomId=jwt.sign({roomid:room._id},process.env.SECRET_KEY)
    res.send({roomId})
    
}))

const PORT=process.env.PORT || 5002

const server=app.listen(PORT,()=>{
    console.log(`Server is running on the port ${PORT}`)
})

const io=socketio(server, {cors: {
    origin: '*',
  }})


io.on("connection",async (socket)=>{
    socket.on("join",async ({id,room},callback)=>{
        // redisClient.get("rm",async(error,rm)=>{
        //     if(error){
        //         console.error(error)
        //     }
        //     if(error!=null){
        //     const rm=JSON.parse(rm)
        //     socket.emit("message",{user:rm.admin.username,text:`Welcome ${user.username} `})
        //     socket.broadcast.to(room).emit("message",{user:rm.admin.username,text:`${user.username} has joined the chat.`})
        //     socket.emit("allmessage",{messages: rm.messages})
        //     socket.join(room);
        //     }else{
            const user=await User.findById(id)
            if(!user) return callback({error:"User doesnot exist"})

            const rm=await Chat.findById(room).populate('admin')
            
            if(!rm) return callback({error:"This room doesnot exist."})

            redisClient.setex("rm",EXPIRATION_TIME,JSON.stringify(rm))
            
            socket.emit("message",{user:rm.admin.username,text:`Welcome ${user.username} `})
            socket.broadcast.to(room).emit("message",{user:rm.admin.username,text:`${user.username} has joined the chat.`})
            
            socket.emit("allmessage",{messages: rm.messages})
            socket.join(room);

        //     }
        // })

        
    })

    // socket.on("individul_reaction",async ({room,msgid})=>{
    //     const rm=await Chat.findById(room)
    //     const rxn=rm.messages.find(e=>e._id==msgid).reacts
    //     io.emit("rxn",{rxn})
    // })


    // socket.on("reacting",async(data)=>{
    //     const rm=await Chat.findById(data.room)
    //     const msg=rm.messages.find(e=>e._id==data.msgid)
    //     msg.reacts.push({user:data.id,reaction:data.react})
    //     await rm.save()
    //     // io.to(data.room)("allmessage",{messages: rm.messages})
    //     const rxn=rm.messages.find(e=>e._id==data.msgid).reacts
    //     io.emit("rxn",{rxn})
    // })

    

    socket.on("sendMessage",async (information,callback)=>{
        const user=await User.findById(information.id);
        const rm=await Chat.findById(information.room)
        rm.messages.push({user:user._id,message:information.message})
        await rm.save();
        io.to(information.room).emit('allmessage',{messages:rm.messages});
    })

    socket.on("yugal",(data)=>{
        console.log("TYPING.........")
    })

    socket.on("disconnect",()=>{
        console.log("User was lost.")
    })
})

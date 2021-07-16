const Request =require("../models/RequestModel")

const requestSocket=(io)=>{
 io.of("/requests").on("connection",async(socket)=>{
     console.log("Connection..............")
     socket.on("join",data=>{
         socket.join(data)
     })
     
 })
}

module.exports=requestSocket
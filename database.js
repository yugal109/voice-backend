const mongoose=require("mongoose")
require('dotenv').config()
const URL=process.env.MONGO_URL

function connect(){
    mongoose.connect(URL, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true
    });
    
    const db = mongoose.connection;
    db.on("error", console.error.bind(console, "connection error:"));
    db.once("open", ()=> {
        console.log("Successfully connected to database.");
    });
}

module.exports=connect;
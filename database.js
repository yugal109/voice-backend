const mongoose = require("mongoose");
require("dotenv").config();
const URL = process.env.MONGO_URL;

function connect() {
    mongoose.connect(URL,{
        useUnifiedTopology: true,
        useNewUrlParser: true
    })
    .then(()=>{
        console.log("Conneccted to data........")
    })
  .catch(error=>{
      console.log(error)
  });
}



module.exports = connect;

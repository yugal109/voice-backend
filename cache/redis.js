const Redis = require("redis");
require("dotenv").config();

try {
    console.log(process.env.REDIS_TLS_URL)
  const client = Redis.createClient(process.env.REDIS_TLS_URL,{
      tls:{
        rejectUnauthorized: false
      }
  });

  client.on_connect("error", (error) => {
    console.log(error);
  });

  module.exports = client;
} catch (error) {
  console.log(error);
}

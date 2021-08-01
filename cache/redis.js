const Redis = require("redis");

const client = Redis.createClient({
  host: "127.0.0.1",
  port: 6379,
  // password: 'pythonjs'
});

module.exports=client
const Joi = require("joi");
const express = require("express");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const User = require("../models/Users");
const Request = require("../models/RequestModel");
const asyncHandler = require("express-async-handler");
const router = express.Router();
const auth = require("../middleware/auth");
const client = require("../cache/redis");

router.get(
  "/",
  // [auth],
  asyncHandler(async (req, res) => {
    const users = await User.find({}).sort({ name: 1 });
    res.send(users);
  })
);

router.get(
  "/:id",
  [auth],
  asyncHandler(async (req, res) => {
    // client.set("name",JSON.stringify("Yugal"))
    client.get(`USER-${req.params.id}`, async (error, USER) => {
      if (error) {
        console.log(error);
      } else {
        if (USER == null) {
          console.log("FIRST TIME ");
          const user = await User.findById(req.params.id);
          if (!user) return res.status(404).send("User not found.");

          client.setex(
            `USER-${user._id}`,
            100,
            JSON.stringify({
              _id: user.id,
              username: user.username,
              email: user.email,
              fullname: user.fullname,
              accountType: user.accountType,
              image: user.image,
            })
          );

          res.send({
            _id: user.id,
            username: user.username,
            email: user.email,
            fullname: user.fullname,
            accountType: user.accountType,
            image: user.image,
            from: "MONGO",
          });
        } else {
          res.send(JSON.parse(USER));
        }
      }
    });
  })
);

//CREATING A USER
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { value, error } = validate(req.body);
    //IF ERROR IN POSTING DATA
    if (error) return res.send({ message: error.details[0].message });

    const { fullname, username, email, password, userType } = req.body;

    //HASHING THE PASSWORD
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //CREATING USER
    const user = new User({
      fullname,
      username,
      email,
      password: hashedPassword,
      userType,
    });
    await user.save();
    let result = _.pick(user, [
      "fullname",
      "username",
      "email",
      "address",
      "accountType",
    ]);
    res.send(result);
  })
);

//get user account type
router.get(
  "/accountType/:id",
  [auth],
  asyncHandler(async (req, res) => {
    // client.get("accountType", async (error, aType) => {
    //   if (aType != null) {
    //     res.send({ accountType: JSON.parse(aType) });
    //   } else {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send("User not found");
    // client.setex("accountType", 3600, JSON.stringify(user.accountType));
    res.send({ accountType: user.accountType });
    // }
    // });
  })
);
// console.log("Startted")
//unfriend
router.post(
  "/unfriend/:id",
  [auth],
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    res.send({ accountType: user.accountType });
  })
);

//is friend
router.get(
  "/isfriend/:id",
  [auth],
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    const isFriend = user.friends.find((e) => e.userId == req.user._id);

    const requests = await Request.findOne({
      requestor: req.user._id,
      acceptor: req.params.id,
      requestType: "friend_request",
      status: "pending",
    });

    if (isFriend) {
      return res.send("unfollow");
    } else if (requests) {
      return res.send("pending");
    } else {
      return res.send("follow");
    }
  })
);

//update only for acoount privacy
router.put(
  "/:id",
  [auth],
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send("User not found");

    if (req.user._id == user._id) {
      if (user.accountType == "public") {
        user.accountType = "private";
      } else {
        user.accountType = "public";
      }
      await user.save();
      // client.setex("accountType",3600,JSON.stringify(user.accountType))
      res.send("Updated");
    } else {
      res.status(403).send("Not Authorized.");
    }
  })
);

router.get(
  "/imageurl/:id",
  [auth],
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send("User not found");
    
    res.send(user.image);
  })
);

router.put(
  "/imageurl/:id",
  [auth],
  asyncHandler(async (req, res) => {
    const { url } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send("User not found");
    if (req.user._id == user._id) {
      user.image = url;
      await user.save();
      client.get(`USER-${req.params.id}`, async (error, USER) => {
        if (error) {
          console.log(error);
        } else {
          if (USER !== null) {
           client.del(`USER-${user._id}`)
          client.setex(
            `USER-${user._id}`,
            100,
            JSON.stringify({
              _id: user.id,
              username: user.username,
              email: user.email,
              fullname: user.fullname,
              accountType: user.accountType,
              image: user.image,
            })
          );
  
          }
        }
      });
      res.send(user);
    }
  })
);

router.put(
  "/all/:id",
  [auth],
  asyncHandler(async (req, res) => {
    const { username, fullname, accountType } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send("User not found");
    // console.log("The Url is : ", url);
    if (req.user._id == user._id) {
      user.username = username;
      user.fullname = fullname;
      user.accountType = accountType;
      await user.save();
      res.send(user);
    } else {
      res.status(403).send("Not Authorized.");
    }
  })
);

module.exports = router;

function validate(data) {
  const schema = Joi.object({
    fullname: Joi.string().min(3).max(30).required(),

    username: Joi.string().alphanum().min(3).max(30).required(),

    email: Joi.string()
      .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
      .required(),

    password: Joi.string()
      .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
      .required(),

    userType: Joi.string().min(5),
  });
  return schema.validate(data);
}

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");


const app = express();

var corsOptions = {
    origin: "http://localhost:4200"
  };
  
app.use(cors());
var userCollection = mongoose.connection.collection('Users');

app.use(express.json());

app.get("/", async (req, res) => {
  return res.json({ message: "Hello, World" });
});

app.get("/user/:email", async (req, res) => {
  const user = await userCollection.findOne( {"email": req.params.email} );
  return res.status(201).json(user);
});

app.get("/friends/:genre", async (req, res) => {
  console.log("Getting friends for a user based on genre " + req.params.genre);
  const users = await userCollection.find( {"topGenre": req.params.genre} );
  const result = await users.toArray();
  //console.log(result);
  return res.status(201).json(result);
});

app.get("/user/friend/:email", async (req,res) => {
  const user = await userCollection.findOne( {"email": req.params.email} );

  const friendUsers = await userCollection.find( {"email": {$in: user.friends}} );

  const result = await friendUsers.toArray();
  //console.log(result);
  return res.status(201).json(result);
});

app.get("/user/posts/:email", async (req,res) => {
  var posts = [];

  const user = await userCollection.findOne( {"email": req.params.email} );
  posts = posts.concat(user.posts);

  const friendUsers = await userCollection.find( {"email": {$in: user.friends}} ).toArray();

  friendUsers.forEach(friend => {
    posts = posts.concat(friend.posts);
  });
  console.log(posts);
  return res.status(201).json(posts);
});

app.get("/user/recommendations/:email", async (req,res) => {
  const user = await userCollection.findOne( {"email": req.params.email} );
  console.log(user.recommendations);
  return res.status(201).json(user.recommendations);
});

app.post("/newuser", async (req, res) => {
    console.log("Post for new user received");
    console.log(req.body);
    const updatedUser = await userCollection.findOneAndUpdate({"email": req.body.email}, {$set: {
      "displayName": req.body.displayName,
      "email": req.body.email,
      "imageUrl": req.body.imageUrl,
      "topGenre": req.body.topGenre,
    }});

    console.log(updatedUser);
    if(!updatedUser.value) {
      console.log("Creating new user");
      const insertedUser = await userCollection.insertOne(req.body);
      return res.status(201).json(insertedUser);
    }
    return res.status(201).json(updatedUser);
  });

app.post("/user/:email/rec", async (req,res) => {
  console.log('Updating recommendations', req.body);
  const updatedUser = await userCollection.findOneAndUpdate({"email": req.params.email}, {$set: {
    "recommendations": req.body
  }});
  return res.status(201).json(updatedUser);
});

app.post("/user/friend", async(req, res) => {
  console.log("Adding friend " + req.body.newFriend);
  const updatedUser = await userCollection.findOneAndUpdate({"email": req.body.user}, {$push: {
    "friends": req.body.newFriend
  }});
  return res.status(201).json(updatedUser);
});

app.post("/user/:email/recommendation", async(req,res) => {
  const updatedUser = await userCollection.findOneAndUpdate({"email": req.params.email}, {$push: {
    "recommendations": req.body
  }});
  return res.status(201).json(updatedUser);
});

app.post("/user/:email/post", async(req,res) => {
  const updatedUser = await userCollection.findOneAndUpdate({"email": req.params.email}, {$push: {
    "posts": req.body
  }});
  return res.status(201).json(updatedUser);
});

const PORT = process.env.PORT || 8080;
const start = async () => {
    try {
      await mongoose.connect("INSERT CONNECTION STRING", {useNewUrlParser: true});
      app.listen(PORT, () => console.log(`Server is running on port ${PORT}. Mongoose connection successful.`)
      );
      app.use(cors());
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  };
  
  start();
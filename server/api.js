/*
|--------------------------------------------------------------------------
| api.js -- server routes
|--------------------------------------------------------------------------
|
| This file defines the routes for your server.
|
*/

const express = require("express");

// import models so we can interact with the database
const User = require("./models/user");
const Game = require("./models/game");

// import authentication library
const auth = require("./auth");

// api endpoints: all these paths will be prefixed with "/api/"
const router = express.Router();

//initialize socket
const socket = require("./server-socket");

router.post("/login", auth.login);
router.post("/logout", auth.logout);
router.get("/whoami", (req, res) => {
  if (!req.user) {
    // not logged in
    return res.send({});
  }

  res.send(req.user);
});

router.post("/initsocket", (req, res) => {
  // do nothing if user not logged in
  if (req.user) socket.addUser(req.user, socket.getSocketFromSocketID(req.body.socketid));
  res.send({});
});

// |------------------------------|
// | write your API methods below!|
// |------------------------------|




router.post("/newUser", (req,res) => {
  let newName = req.body.newName;
  let user = new User({
    name: newName,
    roomID: undefined,
    inGame: false
  });
  user.save();
  res.send({newName: newName});
});



router.get("/game", auth.ensureLoggedIn, (req, res) => {
  Game.findOne({roomID: req.query.roomID}).then((game) => {
    res.send(game)
  });
});

router.post("/createNewRoom", auth.ensureLoggedIn, (req, res) => {
  res.send({});
});

router.post("/joinRoom", auth.ensureLoggedIn, (req, res) => {
  res.send({});
});


router.post("/startGame", auth.ensureLoggedIn, (req, res) => {
  res.send({});
});


router.post("/updateGameData", auth.ensureLoggedIn, (req, res) => {
  res.send({});
});


router.post("/newMessage", auth.ensureLoggedIn, (req, res) => {
  res.send({});
});



// anything else falls to this "not found" case
router.all("*", (req, res) => {
  console.log(`API route not found: ${req.method} ${req.url}`);
  res.status(404).send({ msg: "API route not found" });
});

module.exports = router;

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
const Room = require("./models/room");
const Message = require("./models/message");
const Song = require("./models/song");

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
  User.find({name: newName})
  let user = new User({
    name: newName,
    roomID: undefined,
  });
  user.save();
  res.send({newName: newName});
});




router.post("/createNewRoom", auth.ensureLoggedIn,(req, res) => {

  let min = 100000
  let max = min*10-1
  let roomID = Math.floor(Math.random() * (max-min) + min)
  // what if its already taken :o

  Room.findOne({roomID: roomID}).then((room) => {
    if(room) {
      User.findById(req.user._id).then((user) => {
        user.roomID = roomID;
        user.save().then(() => {
          res.send({id: roomID})
        })
      })
    } else {
      const newRoom = new Room({
        roomID: roomID,
      })
      newRoom.save();
    }
  })
});

// sends a list of users in the room (objects {userId: aw23aa, userName: AkshajK})
router.post("/joinRoom", auth.ensureLoggedIn, (req, res) => {
  User.findById(req.user._id).then((user) => {
    user.roomID = req.body.roomID;
    user.save().then(() => {
      socket.getIo().emit("someoneJoinedRoom", {userId: req.user._id, userName: req.user.userName})


      userList = []
      User.find({roomID: user.roomID}).then((users) => {
        users.forEach((user2) => {
          userList.push({userId: user2._id, userName: user2.userName})
          if(userList.length === users.length) {
            res.send(userList);
          }
        })
      })

      
    })
  })
});


router.post("/startGame", auth.ensureLoggedIn, (req, res) => {
  let gameData = []
  User.find({}).then((users) => {
    users.forEach((user) => {
      if(user.roomID.equals(req.user.roomID)) {
        gameData.push({userID: user._id, userName: user.userName, score: 0, lyrics: []})
        if(gameData.length === users.length) {

            // create game

            const game = new Game({
              songID: "1",
              endTime: new Date(d.getTime() + 33*1000),
              gameData: gameData,
              roomID: req.user.roomID,
              status: "timer" // inProgress, timer, finished. 
            });
            game.save().then(() => {
              socket.getIo().emit("startTimer", {roomID: req.user.roomID, gameID: game._id})
              setTimeout(() => {
                Game.findById(game._id).then((newGame) => {
                  newGame.status = "inProgress"
                  newGame.save().then(()=> {
                    socket.getIo().emit("inProgress", {roomID: req.user.roomID, gameID: game._id})
                  })
                })
               
                
              }, 3000)
              setTimeout(() => {
                Game.findById(game._id).then((newGame) => {
                  newGame.status = "finished"
                  newGame.save().then(()=> {
                    socket.getIo().emit("finished", {roomID: req.user.roomID, gameID: game._id, gameData: game.gameData})
                  })
                })
              }, 33000)

              
            })








          }
       
      }
    })
  })
  
  

  res.send({});
});


router.post("/updateGameData", auth.ensureLoggedIn, (req, res) => {
  // score calculation
 
  let newScore = req.body.lyrics.length  // better score calculationn D:
  socket.getIo().emit("updateGameScore", {userId: req.user._id, userName: req.user.userName, score: newScore})
  Game.findById(req.body.gameID).then((game) => {
    let arr = game.gameData
    arr = arr.filter((obj) => {return !obj.userId.equals(req.user._id)})
    arr.push({userId: req.user._id,  userName: req.user.userName, score: newScore, lyrics: req.body.lyrics})
    game.gameData = arr 
    game.markModified("gameData")
    game.save().then(() => {
      res.send({});
    })
  })

});


router.post("/newMessage", auth.ensureLoggedIn, (req, res) => {
  let systemMessage = false
  if(req.body.systemMessage) systemMessage = true
  let message = new Message({
    sender: {userId: req.user._id, userName: req.user.userName},
    roomID: req.user.roomID, 
    message: req.body.message,
    systemMessage: systemMessage
  })
  socket.getIo().emit("newMessage", message)

  res.send({});
});


router.post("/setRoomID", auth.ensureLoggedIn, (req, res) => {
  User.findById(req.user._id).then((user) => {
    user.roomID = req.body.roomID
    user.save().then(() => {
      res.send({})
    })
  })
})

// anything else falls to this "not found" case
router.all("*", (req, res) => {
  console.log(`API route not found: ${req.method} ${req.url}`);
  res.status(404).send({ msg: "API route not found" });
});

module.exports = router;

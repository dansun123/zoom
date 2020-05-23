/*
|--------------------------------------------------------------------------
| api.js -- server routes
|--------------------------------------------------------------------------
|
| This file defines the routes for your server.
|
*/
require("dotenv").config();
var autocorrect = {}

const API_KEY = process.env.API_KEY;
const express = require("express");
var request = require('request');
const levenshteiner = require('levenshteiner');
const utf8 = require('utf8');
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

var api = require('genius-api');
var genius = new api(process.env.GENIUS_CLIENT_ACCESS_TOKEN);
var getLyrics = require('genius-lyrics-api').getLyrics;

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





router.post("/createNewRoom", auth.ensureLoggedIn,(req, res) => {

  Room.findOne({name: req.body.roomName}, (room) => {
    if(room) {
      res.send({created: false})
    } else {
      const newRoom = new Room({name: req.body.roomName, data: []});
      res.send({created: true})
    }
  })
  // After this you have to join it! Either way you will be able to :) 

});

// sends a list of users in the room (objects {userId: aw23aa, userName: AkshajK})
router.post("/joinRoom", (req, res) => {
  Room.findOne({name : req.body.name}).then((room) => {
    if(room) {
      socket.getIo().emit("someoneJoinedRoom", {userID: req.body.userID, userName: req.user.userName, roomName: req.body.roomID})
      let message = new Message({
        sender: {userID: req.body.userID, userName: req.body.userName},
        roomID: req.body.roomID, 
        message: req.body.userName + " joined the Room",
        systemMessage: true
      })
      socket.getIo().emit("newMessage", message)
      
      let data = room.data 
      data.push({userID: req.body.userID, userName: req.body.userName, score: 0})
      room.data = data
      room.save().then(() => {
        res.send(data)
      })
    }
  })
});




router.post("/startGame", (req, res) => {
  var rounds = 6
  var roundNum = 0;
  var songs = []
  Song.aggregate(
    [ { $sample: { size: rounds } } ]
  ).then((ssongs) => {
    ssongs.forEach((song) => {
      songs.push(song)
      if(songs.length === ssongs.length) {

          // start the process!!!
          times = []
          let fromNow = (num) => {
            return new Date((new Date()).getTime() + num)
          }
          for(roundNum = 0; roundNum < rounds; roundNum += 1) {
            let mostRecentTime = 0
            let mostRecentRoundTimes = {startTime: mostRecentTime + 5000, endTime: mostRecentTime + 35000}
            times.push(mostRecentRoundTimes)
            mostRecentTime = mostRecentRoundTimes.endTime
          }
          
          for(roundNum = 0; roundNum < rounds; roundNum += 1) {
            if(roundNum === 0) {
              let curSong = songs[roundNum]
              socket.getIo().emit("startTimer", {songID: curSong._id, url: curSong.url, startTime: fromNow(times[roundNum].startTime), endTime: fromNow(times[roundNum].endTime)})              
            }
            setTimeout(() => {socket.getIo().emit("startGame", {})}, times[roundNum].startTime)              
            if(roundNum !== rounds - 1) {
              let curSong = songs[roundNum+1]
              setTimeout(() => {socket.getIo().emit("finishGame", {songID: curSong._id, url: curSong.url})}, times[roundNum].endTime) 
            }
            else {
              setTimeout(() => {socket.getIo().emit("results", {})}, times[roundNum].endTime) 
            }
      
          }





      }
    })
  })

});

  
  

var stringSimilarity = require('string-similarity');

let similarity = (a, b) => {
  return stringSimilarity.compareTwoStrings(a.toLowerCase(),b.toLowerCase());
}



router.post("/newMessage", auth.ensureLoggedIn, (req, res) => {
  let systemMessage = false
  let messageText = req.body.message
  if(req.body.systemMessage) systemMessage = true
  else {
    if(req.body.inGame && similarity(messageText, req.body.title) > 0.7) {
      systemMessage = true 
      messageText = req.body.userName + " guessed the title!"
      let newEntry = {userID: req.body.userID, userName: req.body.userName, score: req.body.score + 1}
      Room.find({name: req.body.roomName}).then((room) => {
        let data = room.data 
        data = data.filter((entry) => {
          return entry.userID !== req.body.userID;
        })
        data.push(newEntry)
        room.data = data 
        room.save()
      })
      socket.getIo().emit("updateRoomData", newEntry)
    }
  }



  let message = new Message({
    sender: {userId: req.user._id, userName: req.user.userName},
    roomID: req.body.roomID, 
    message: req.body.message,
    systemMessage: systemMessage
  })




  socket.getIo().emit("newMessage", message)
  res.send({});
});



// anything else falls to this "not found" case
router.all("*", (req, res) => {
  console.log(`API route not found: ${req.method} ${req.url}`);
  res.status(404).send({ msg: "API route not found" });
});

module.exports = router;

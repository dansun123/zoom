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
const fs = require('fs');


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
      const newRoom = new Room({name: req.body.roomName, data: [], status: "waiting"});
      res.send({created: true})
    }
  })
  // After this you have to join it! Either way you will be able to :) 

});

// sends a list of users in the room (objects {userId: aw23aa, userName: AkshajK})
router.post("/joinRoom", (req, res) => {
  Room.findOne({name : req.body.roomName}).then((room) => {
    if(room) {
      socket.getIo().emit("someoneJoinedRoom", {userID: req.body.userID, userName: req.body.userName, roomName: req.body.roomName})
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
        res.send({exists: true, roomData: data, status: room.status, roomID: room._id})
      })
    }
    else {
      res.send({exists: false})
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
              socket.getIo().emit("startTimer", {roomName: req.body.roomName, songID: curSong._id, url: curSong.songUrl, startTime: fromNow(times[roundNum].startTime), endTime: fromNow(times[roundNum].endTime), roundNum: 1})              
              Room.find({name: req.body.roomName}).then((room) => {
                room.status = "1inProgress"
                room.save()
              })
            }
            setTimeout(() => {
              socket.getIo().emit("startGame", {roomName: req.body.roomName, roundNum: roundNum + 1})
              Room.find({name: req.body.roomName}).then((room) => {
                room.status = (roundNum + 1) + "inProgress"
                room.save()
              })
            }, times[roundNum].startTime)              
            if(roundNum !== rounds - 1) {
              let curSong = songs[roundNum+1]
              setTimeout(() => {
                socket.getIo().emit("finishGame", {roomName: req.body.roomName, songID: curSong._id, url: curSong.songUrl,  startTime: fromNow(times[roundNum+1].startTime), endTime: fromNow(times[roundNum+1].endTime)})
                Room.find({name: req.body.roomName}).then((room) => {
                  room.status = "gameFinished"
                  room.save()
                })
              }, times[roundNum].endTime) 
            }
            else {
              setTimeout(() => {
                socket.getIo().emit("results", {roomName: req.body.roomName})
                Room.find({name: req.body.roomName}).then((room) => {
                  room.status = "roundFinished"
                  room.save()
                })
              }, times[roundNum].endTime) 
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
      socket.getIo().emit("updateRoomData", {roomName: req.body.roomName, entry: newEntry})
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



// router.post("/getInstrumentals", (req,res) => {
//   let obj = {
//     table: []
//   };
//   let numAdded=0
//   Song.find({}).then((songs) => {
//     songs.forEach((song) => {
//       request('https://itunes.apple.com/search?term='+utf8.encode(song.title + " " + song.primaryArtist + " instrumental")+'&entity=song&limit=1', (error, response, body) => {
//         if (!error && response.statusCode == 200 && JSON.parse(body).results[0]) {
//           let songUrl = JSON.parse(body).results[0].previewUrl
//           obj.table.push({
//             title: song.title,
//             primaryArtist: song.primaryArtist,
//             artUrl: song.artUrl,
//             songUrl: songUrl,
//           })
//         }
//         numAdded+=1;
//         if(numAdded === songs.length) {
//           var json = JSON.stringify(obj)
//           fs.writeFile('myjsonfile.json', json, 'utf8', ()=>{console.log("success")})
//         }
//       })
//     })
//   })
//   res.send({complete: true})
// })

// router.get("/readJSON", (req, res)=> {
//   fs.readFile('myjsonfile.json', 'utf8', function readFileCallback(err, data){
//     if (err){
//       console.log(err);
//     } else {
//       obj = JSON.parse(data); //now it an object
//       console.log(obj.table.length)
//       res.send({complete: obj})
//     }
//   })
// })

// router.post("/instrumentals", (req,res) => {
//   fs.readFile('myjsonfile.json', 'utf8', function readFileCallback(err, data){
//     if (err){
//       console.log(err);
//     } else {
//       obj = JSON.parse(data); //now it an object
//       obj.table.forEach((song) => {
//         let newSong = new Song({
//           title: song.title,
//           primaryArtist: song.primaryArtist,
//           artUrl: song.artUrl,
//           songUrl: song.songUrl,
//         })
//         console.log(newSong)
//         newSong.save();
//       })
//     }
//   })
//   res.send({complete: true})
// })



// anything else falls to this "not found" case
router.all("*", (req, res) => {
  console.log(`API route not found: ${req.method} ${req.url}`);
  res.status(404).send({ msg: "API route not found" });
});

module.exports = router;

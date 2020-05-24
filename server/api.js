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





router.post("/createNewRoom", (req, res) => {

  Room.findOne({roomID: req.body.roomID}).then((room) => {
    if(room) {
      console.log("Already exists")
      res.send({created: false})
    } else {
      console.log(req.body.roomID)
      console.log("New Main")
      const newRoom = new Room({roomID: req.body.roomID, data: [], status: "waiting"});
      newRoom.save().then(() => {
        res.send({created: true})
      })
     
    }
  })
  // After this you have to join it! Either way you will be able to :) 

});

// sends a list of users in the room (objects {userId: aw23aa, userName: AkshajK})
router.post("/joinRoom", (req, res) => {
  socket.addUser({userID: req.body.userID, roomID: req.body.roomID, userName: req.body.userName}, socket.getSocketFromSocketID(req.body.socketid));
  Room.findOne({roomID: req.body.roomID}).then((room) => {
    if(room) {
      socket.getIo().emit("someoneJoinedRoom", {userID: req.body.userID, userName: req.body.userName, roomID: req.body.roomID})
      let message = new Message({
        sender: {userID: req.body.userID, userName: req.body.userName},
        roomID: req.body.roomID, 
        message: req.body.userName + " joined the Room",
        systemMessage: true
      })
      message.save()
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
  console.log("startGame")
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
          
          let mostRecentTime = 0
          let curTime = new Date()
          let fromNow = (num) => {
            return new Date((curTime).getTime() + num)
          }
          for(roundNum = 0; roundNum < rounds; roundNum += 1) {
            
            let mostRecentRoundTimes = {startTime: mostRecentTime + 5000, endTime: mostRecentTime + 35000}
            times.push(mostRecentRoundTimes)
            mostRecentTime = mostRecentRoundTimes.endTime
          }
          
          for(roundNum = 0; roundNum < rounds; roundNum += 1) {
            if(roundNum === 0) {
              let curSong = songs[roundNum]
              console.log("startin timer")
              socket.getIo().emit("startTimer", {roomID: req.body.roomID, song: curSong, startTime: fromNow(times[roundNum].startTime), endTime: fromNow(times[roundNum].endTime), roundNum: 1})              
              Room.findOne({roomID: req.body.roomID}).then((room) => {
                room.status = "inProgress"
                let data = room.data 
                let i = 0
                for(i=0; i<data.length; i++) data[i].score = 0 
                room.data = data
                room.save()
              })
            }
            let curRoundNum = roundNum
            setTimeout(() => {
              socket.getIo().emit("startGame", {roomID: req.body.roomID, roundNum: curRoundNum  + 1})
              Room.findOne({roomID: req.body.roomID}).then((room) => {
                room.status = "inProgress"
                room.save()
              })
            }, times[curRoundNum].startTime)              
            if(curRoundNum  !== rounds - 1) {
              let curSong = songs[curRoundNum +1]
              setTimeout(() => {
                
                socket.getIo().emit("finishGame", {answer: songs[curRoundNum], roomID: req.body.roomID, song: curSong,  startTime: fromNow(times[curRoundNum+1].startTime), endTime: fromNow(times[curRoundNum+1].endTime)})
                Room.findOne({roomID: req.body.roomID}).then((room) => {
                  room.status = "gameFinished"
                  room.save()
                })
              }, times[curRoundNum].endTime) 
            }
            else {
              setTimeout(() => {
                socket.getIo().emit("results", {answer: songs[curRoundNum], roomID: req.body.roomID})
                Room.findOne({roomID: req.body.roomID}).then((room) => {
                  room.status = "roundFinished"
                  room.save()
                })
              }, times[curRoundNum].endTime) 
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



router.post("/newMessage", (req, res) => {
  let systemMessage = false
  let messageText = req.body.message
  if(req.body.systemMessage) systemMessage = true
  else {
    if(req.body.inGame && similarity(messageText, req.body.title) > 0.7) {
      systemMessage = true 
      messageText = req.body.userName + " guessed the title!"
      let newEntry = {userID: req.body.userID, userName: req.body.userName, score: req.body.score + req.body.points}
      Room.findOne({roomID: req.body.roomID}).then((room) => {
        let data = room.data 
        data = data.filter((entry) => {
          return entry.userID !== req.body.userID;
        })
        data.push(newEntry)
        room.data = data 
        room.save()
      })
      socket.getIo().emit("updateRoomData", {userID: req.body.userID, roomID: req.body.roomID, entry: newEntry})
    }
  }



  let message = new Message({
    sender: {userID: req.body.userID, userName: req.body.userName},
    roomID: req.body.roomID, 
    message: messageText,
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

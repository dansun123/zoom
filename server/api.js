/*
|--------------------------------------------------------------------------
| api.js -- server routes
|--------------------------------------------------------------------------
|
| This file defines the routes for your server.
|
*/
require("dotenv").config();
const API_KEY = process.env.API_KEY;
const express = require("express");
var request = require('request');
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
 
// //get annotation
// genius.annotation(6737668).then(function(response) {
//   console.log(response.annotation);
// });
 
// //get referents by song_id, with options
// genius.referents({song_id: 378195}, {per_page: 2}).then(function(response) {
//   console.log('referents', response.referents);
// });
 
// //get referents by web_page_id, with options
// genius.referents({web_page_id: 10347}, {per_page: 5}).then(function(response) {
//   console.log('referents', response.referents);
// });
 
// //get song
// genius.song(378195).then(function(response) {
//   console.log('song', response.song);  
// });
 
// //get artist
// genius.artist(16775).then(function(response) {
//   console.log('artist', response.artist);
// });
 
// //get web page, with options
// genius.webPage({raw_annotatable_url: 'https://docs.genius.com'}).then(function(response) {
//   console.log('web page', response.web_page);
// });
 
// search
// genius.search('Run the Jewels').then(function(response) {
//   console.log('hits', response.hits);
//   genius.annotation(response.hits[0].result.id).then((response) => {
//     console.log(response.annotation);
//   });
//   genius.song(response.hits[0].result.id).then(function(response) {
//     console.log('song', response.song);  
//   });
// });
 
// //error handling á la promise
// genius.song(378195).then(function(response) {
//   console.log('song', response.song);
// }).catch(function(error) {
//   console.error(error);
// });


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

  let min = 10000
  let max = min*10-1
  let roomID = String(Math.floor(Math.random() * (max-min) + min))
  // what if its already taken :o

  Room.findOne({roomID: roomID}, (room) => {
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
      newRoom.save().then(() => {
        res.send({id: roomID})
      });
    }
  })
});

// sends a list of users in the room (objects {userId: aw23aa, userName: AkshajK})
router.post("/joinRoom", auth.ensureLoggedIn, (req, res) => {
  Room.findOne({roomID : req.body.roomID}).then((room) => {
    if(room) {
      User.findById(req.user._id).then((user) => {
        user.roomID = req.body.roomID;
        user.save().then(() => {
          socket.getIo().emit("someoneJoinedRoom", {userId: req.user._id, userName: req.user.userName})
          userList = []
          User.find({roomID: user.roomID}).then((users) => {
            users.forEach((user2) => {
              userList.push({userId: user2._id, userName: user2.userName})
              if(userList.length === users.length) {
                
                Game.findOne({
                  $or: [
                    {roomID: req.body.roomID, status: "inProgress"},
                    {roomID: req.body.roomID, status: "timer"}
                       ]
                }).then((game) => {
                  if(game) {
                    res.send({userList: userList, status: game.status, queue: room.queue});
                  }
                  else {
                    res.send({userList: userList, status: "waiting", queue: room.queue});
                  }
                })
              }
            })
          })
        })
      })
    } else {
      res.send(false)
    }
  })
});

router.get("/songs", auth.ensureLoggedIn, (req, res) => {
    Song.find({}).then((songs) => {
      let listOfSongs = []
      songs.forEach((song) => {
        listOfSongs.push({title: song.title, primaryArtist: song.primaryArtist, songID: song._id})
        if(listOfSongs.length === songs.length) {
          res.send(listOfSongs);
        }
      })
    })
})

router.get("/songLyrics", (req, res) => {
  console.log(req.query.title)
  request('https://itunes.apple.com/search?term='+utf8.encode(req.query.title)+'&entity=song&limit=1', (error, response, body) => {
    if (!error && response.statusCode == 200) {
      let songURL = JSON.parse(body).results[0].previewUrl
      genius.search(req.query.title).then(function(response1) {
        genius.song(response1.hits[0].result.id).then(function(response) {
          console.log('song', response.song); 
          let title = response.song.title;
          let primaryArtist =  response.song.primary_artist.name;
          let featuredArtists = response.song.featured_artists;
          let artUrl = response.song.song_art_image_url;
          let id = String(response.song.id);
          let embedContent = response.embed_content;
          const options = {
            apiKey: process.env.GENIUS_CLIENT_ACCESS_TOKEN, // genius developer access token
            title: title,
            artist: primaryArtist,
            optimizeQuery: true
          }
          console.log(options)
          getLyrics(options).then(answer => {
            console.log("lyrics")
            // console.log(answer)
            res.send({
              title: title,
              primaryArtist: primaryArtist,
              featuredArtists: featuredArtists,
              artUrl: artUrl,
              id: id,
              answerKey: answer,
              url: songURL,
              //embedContent: embedContent
            })
          })
        });
      });
    }
  })
})


router.post("/songLink", auth.ensureLoggedIn, (req, res) => {
  const song = new Song({
    answerKey: req.body.answerKey,
    title: req.body.title,
    primaryArtist: req.body.primaryArtist,
    featuredArtists: req.body.featuredArtists,
    artUrl: req.body.artUrl,
    geniusID: req.body.geniusID,
    songUrl: req.body.songUrl,
    embedContent: req.body.embedContent,
  })
  song.save();
  res.send();
})


router.post("/startGame", auth.ensureLoggedIn, (req, res) => {
  let gameData = []
  User.find({}).then((users) => {
    let counter = 0
    users.forEach((user) => {
      counter += 1
      if(user.roomID === req.body.roomID) {
        gameData.push({userId: user._id, userName: user.userName, score: 0, lyrics: []})
      }

      if(counter === users.length) {

        // create game
        let endTime = new Date((new Date()).getTime() + 33*1000) 
        let startTime = new Date((new Date()).getTime() + 3*1000) 

        let parameter = {}
        if(req.body.song) parameter = {_id: req.body.song.songID}
        Song.findOne(parameter).then((song) => {
          const game = new Game({
            songID: song._id,
            answerKey: song.answerKey,
            endTime: endTime,
            gameData: gameData,
            roomID: req.body.roomID,
            status: "timer" // inProgress, timer, finished. 
          });
          game.save().then(() => {
            // API Get
            
            
            
               
                
  
                Room.findOne({roomID: req.body.roomID}).then((room) => {
                  room.queue = room.queue.filter((song2) => {return song2.songID !== song._id})
                  room.save()
                })
  
                socket.getIo().emit("startTimer", {roomID: req.body.roomID, gameID: game._id, songID: song._id, songURL: song.songUrl, endTime: endTime, startTime: startTime, gameData: gameData})
  
                setTimeout(() => {
                  Game.findById(game._id).then((newGame) => {
                    newGame.status = "inProgress"
         
                    newGame.save().then(()=> {
                      socket.getIo().emit("inProgress", {roomID: req.body.roomID, gameID: game._id})
                    })
                  })
                 
                  
                }, 3000)
                setTimeout(() => {
                  Game.findById(game._id).then((newGame) => {
                    newGame.status = "finished"
                    newGame.save().then(()=> {
                      socket.getIo().emit("finished", {roomID: req.body.roomID, gameID: game._id, gameData: game.gameData})
                    })
                  })
                }, 33000)
      
             
          })
        })

        
      }
    })
  })
  
  

  res.send({});
});

var stringSimilarity = require('string-similarity');

let similarity = (lyrics, answerKey) => {
  //console.log(lyrics)
  //console.log(answerKey)
  return Math.round(stringSimilarity.compareTwoStrings(lyrics.join(' '), answerKey)*100);
}

router.post("/updateGameData", auth.ensureLoggedIn, (req, res) => {
  // score calculation
 
 
  Game.findById(req.body.gameID).then((game) => {

    let newScore = similarity(req.body.lyrics, game.answerKey) // better score calculationn D:
    socket.getIo().emit("updateGameScore", {userId: req.user._id, userName: req.user.userName, score: newScore, lyrics: req.body.lyrics})

    let arr = game.gameData
    arr = arr.filter((obj) => {return obj.userId !== req.user._id})
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
    roomID: req.body.roomID, 
    message: req.body.message,
    systemMessage: systemMessage
  })
  socket.getIo().emit("newMessage", message)

  res.send({});
});

router.post("/newSongReq", auth.ensureLoggedIn, (req, res) => {
  Room.findOne({roomID: req.body.roomID}).then((room) => {
    let q = room.queue;
    q.push(req.body.newSong);
    room.queue = q;
    room.save().then(() => {
      socket.getIo().emit("newQ", {q:q, roomID: req.body.roomID})
      res.send({});
    });
  })
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

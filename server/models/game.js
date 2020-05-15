const mongoose = require("mongoose");

const GameSchema = new mongoose.Schema({
  songID: String,
  endTime: Date,
  gameData: [{
    userId: String,
    userName: String,
    score: Number
  }],
  roomID: String,
  status: String // inProgress, timer, finished. 
});

// compile model from schema
module.exports = mongoose.model("game", GameSchema);

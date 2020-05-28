const mongoose = require("mongoose");
const RoomSchema = new mongoose.Schema({
  roomID: String,
  data: [{
    userID: String,
    userName: String,
    score: {type: Number, default: 0}
  }],
  status: String, // either "waiting", "1inProgress", "2inProgress", .., "gameFinished", "roundFinished" 
  waitingForAnswers: {type: Number, default: 0},
  startTime: {type: Date, default: Date.now},
  endTime: {type: Date, default: Date.now},
  song: Object,
  roundNum: {type: Number, default: 1}


});

// compile model from schema
module.exports = mongoose.model("room", RoomSchema);

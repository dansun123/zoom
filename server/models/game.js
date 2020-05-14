const mongoose = require("mongoose");

const GameSchema = new mongoose.Schema({
  songID: String,
  endTime: Date,
  gameData: Object,
  roomID: String
});

// compile model from schema
module.exports = mongoose.model("game", GameSchema);

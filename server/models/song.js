const mongoose = require("mongoose");

const SongSchema = new mongoose.Schema({
  answerKey: String,
  iTunesIdentifier: String,
});

// compile model from schema
module.exports = mongoose.model("song", SongSchema);
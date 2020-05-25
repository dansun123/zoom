const mongoose = require("mongoose");

const SongSchema = new mongoose.Schema({
  title: String,
  primaryArtist: String,
  artUrl: String,
  instrumentalUrl: String,
  karaokeUrl: String,
});

// compile model from schema
module.exports = mongoose.model("song", SongSchema);

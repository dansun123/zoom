const mongoose = require("mongoose");

const SongSchema = new mongoose.Schema({
  title: String,
  primaryArtist: String,
  artUrl: String,
  instrumentalUrl: String,
  karaokeUrl: String,
  songUrl: String,
  youtubeUrl: String,
  soundcloudUrl: String,
  bad: {type: Boolean, default: false}
});

// compile model from schema
module.exports = mongoose.model("song", SongSchema);

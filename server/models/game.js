const mongoose = require("mongoose");

const GameSchema = new mongoose.Schema({
  songs: Object,
});

// compile model from schema
module.exports = mongoose.model("game", GameSchema);

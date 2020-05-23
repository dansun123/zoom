const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema({
  name: String,
  data: [{
    userID: String,
    userName: String,
    score: {type: Number, default: 0}
  }],
  status: String // either "waiting", "1inProgress", "2inProgress", .., "gameFinished", "roundFinished" 
});

// compile model from schema
module.exports = mongoose.model("room", RoomSchema);

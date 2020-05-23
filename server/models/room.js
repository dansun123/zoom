const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema({
  name: String,
  data: [{
    userID: String,
    userName: String,
    score: {type: Number, default: 0}
  }],
});

// compile model from schema
module.exports = mongoose.model("room", RoomSchema);

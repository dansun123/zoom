const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema({
  roomID: String
});

// compile model from schema
module.exports = mongoose.model("room", RoomSchema);

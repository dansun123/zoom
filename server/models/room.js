const mongoose = require("mongoose");

//define a message schema for the database
const RoomSchema = new mongoose.Schema({
  roomID: String, 
});

// compile model from schema
module.exports = mongoose.model("room", RoomSchema);

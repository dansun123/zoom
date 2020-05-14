const mongoose = require("mongoose");

//define a message schema for the database
const MessageSchema = new mongoose.Schema({
  sender: {userID: String, userName: String},
  roomID: String, 
  timestamp: { type: Date, default: Date.now },
  message: String,
});

// compile model from schema
module.exports = mongoose.model("message", MessageSchema);

const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  userName: String,
  roomID: String,
  inGame: Boolean
});

// compile model from schema
module.exports = mongoose.model("user", UserSchema);

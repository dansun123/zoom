const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  googleid: String,
  typingSpeed: Number,
  roomid: String,
});

// compile model from schema
module.exports = mongoose.model("user", UserSchema);

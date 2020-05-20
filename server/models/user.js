const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  googleid: String,
  userName: String,
  roomID: String,
  inactivityCount: {type: Number, default: 0},
  mode: {type: String, default: "Typing"}
});

// compile model from schema
module.exports = mongoose.model("user", UserSchema);

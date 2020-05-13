const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  type: String,
  ratingType: String,
  statement: String,
  answer: String,
});

// compile model from schema
module.exports = mongoose.model("question", QuestionSchema);

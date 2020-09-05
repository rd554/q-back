const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    ref: "User",
  },
  answer: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Answer", answerSchema);

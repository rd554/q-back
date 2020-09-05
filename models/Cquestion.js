const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const questionSchema = new mongoose.Schema(
  {
    postedBy: {
      type: ObjectId,
      required: true,
      ref: "User",
    },
    question: {
      type: String,
      required: true,
    },
    photo: {
      data: String,
      required: false,
    },
    answers: {
      type: [],
      required: false,
    },
  },

  { timeStamps: true }
);

module.exports = mongoose.model("Question", questionSchema);

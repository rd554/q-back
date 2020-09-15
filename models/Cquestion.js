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
    answers: [
      {
        userId: { type: ObjectId, ref: "User" },
        answerType: {
          data: String,
          required: false,
        },
        answer: String,
        replies: [
          {
            userId: { type: ObjectId, ref: "User" },
            reply: String,
            replyType: {
              data: String,
              required: false,
            },
          },
        ],
      },
    ],
    questionType: {
      data: String,
      required: false,
    },
    createdAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },

  { timeStamps: true }
);

module.exports = mongoose.model("Question", questionSchema);

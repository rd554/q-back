const Question = require("../models/Cquestion");
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.postQuestion = (req, res) => {
  const newQuestion = new Question({
    question: req.body.question || "",
    postedBy: req.user._id || "",
    questionScope: req.body.selectedScope || "",
  });
  console.log(newQuestion);
  newQuestion.save((error, result) => {
    console.log(error);
    if (error) {
      res.json({ Status: false, msg: "Question posting Unsuccessful..!" });
    } else {
      res.json({
        Status: true,
        msg: "Question posted successfully",
        result,
      });
    }
  });
};

exports.postAnswer = (req, res) => {
  const answer = req.body.answer || "";
  const userId = req.user._id || "";
  const questionId = req.body.questionId || "";
  const selectedScope = req.body.selectedScope || "";

  Question.findOneAndUpdate(
    { _id: questionId },
    {
      $push: {
        answers: { answer, userId, answerScope: selectedScope },
      },
    },
    { new: true },
    (err, newAnswer) => {
      if (err) {
        res.status(400).json({
          error: errorHandler(err),
        });
      }
      if (!newAnswer) {
        res.json({
          error: "Something went wrong. Please try again.",
        });
      } else {
        res.json({
          msg: "answer added successfully",
          newAnswer,
        });
      }
    }
  );
};

exports.listAllCards = (req, res) => {
  // let limit = req.body.limit ? parseInt(req.body.limit) : 10;
  // let skip = req.body.skip ? parseInt(req.body.skip) : 1;
  let limit = 4;
  let pageNo = parseInt(req.body.pageNo) || 1;
  let skip = limit * (pageNo - 1);
  if (pageNo === 1) skip = 0;

  let questions;

  Question.find({}, { answers: { $slice: 5 } })
    .populate("postedBy", "_id name email")
    .populate("answers.userId", "_id name email")
    .sort({ _id: -1 })
    .select("_id question postedBy createdAt questionScope answerScope claps")
    .limit(limit)
    .skip(skip)
    .exec((err, data) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }
      // uddating the existing array
      questions = data;
      if (questions) {
        res.json({ questions, size: questions.length });
      } else {
        res.json({
          error: "Data not found",
        });
      }
    });
};

exports.list = (req, res) => {
  Question.find({}, { answers: { $slice: 5 } })
    .populate("postedBy", "_id name")
    .populate("answers.userId", "_id name")
    .sort({ _id: -1 })
    .select("_id question postedBy createdAt")
    .exec((err, data) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }
      if (data) {
        res.json(data);
      } else {
        res.json({
          error: "Data not found",
        });
      }
    });
};

exports.updateQuestion = (req, res) => {
  const questionId = req.body.questionId;
  const questionContent = req.body.questionContent;

  Question.findOneAndUpdate(
    { _id: questionId },
    { $set: { question: questionContent } },
    { new: true },
    (err, question) => {
      if (err) {
        res.status(400).json({
          error: errorHandler(err),
        });
        return;
      } else {
        res.status(200).json({
          msg: "Question updated successfully",
          question,
        });
      }
    }
  );
};

exports.updateAnswer = (req, res) => {
  const questionId = req.body.questionId;
  const answerId = req.body.answerId;
  const answerContent = req.body.answerContent;

  Question.findOneAndUpdate(
    { _id: questionId, answers: { $elemMatch: { _id: answerId } } },
    {
      $set: {
        "answers.$.answer": answerContent,
      },
    },
    { new: true },
    (err, answer) => {
      if (err) {
        res.status(400).json({
          error: errorHandler(err),
        });
      }
      if (!answer) {
        res.json({
          error: "Something went wrong. Please try again.",
        });
      } else {
        res.json({
          msg: "answer updated successfully",
          answer,
        });
      }
    }
  );
};

exports.removeQuestion = (req, res) => {
  const questionId = req.body.questionId;

  Question.findOneAndRemove({ _id: questionId }).exec((err, question) => {
    if (err) {
      res.status(400).json({
        error: errorHandler(err),
      });
    }
    if (!question) {
      res.status(400).json({
        error: "question not found",
      });
    } else {
      res.json({
        msg: "Question deleted successfully",
      });
    }
  });
};

exports.removeAnswer = (req, res) => {
  const questionId = req.body.questionId;
  const answerId = req.body.answerId;

  Question.findByIdAndUpdate(
    questionId,
    { $pull: { answers: { _id: answerId } } },
    (err, success) => {
      if (err) {
        res.status(400).json({
          error: errorHandler(err),
        });
      }
      return res.json({
        msg: "Answer deleted successfully",
        success,
      });
    }
  );
};

exports.getSingleQuestion = async (req, res) => {
  const questionId = req.params.questionId || "";
  if (questionId === "") {
    res.json({ error: "Question id not passed" });
  }

  try {
    let questionResult = await Question.findOne({ _id: questionId }).select(
      "question postedBy _id"
    );
    res.json(questionResult);
  } catch (error) {
    res.json({ error });
  }
};

exports.getSingleAnswer = async (req, res) => {
  const answerId = req.params.answerId || "";

  if (answerId === "") {
    res.json({ error: "Answer id not passed" });
  }

  try {
    let answerResult = await Question.findOne({
      "answers._id": answerId,
    }).select({
      answers: { $elemMatch: { _id: answerId } },
    });

    if (answerResult.answers.length > 0) {
      res.json(answerResult.answers[0]);
    } else {
      res.json({
        msg: "Answer not found",
      });
    }
  } catch (error) {
    res.json({ error });
  }
};

// exports.postReply = async (req, res) => {
//   const reply = req.body.reply || "";
//   const userId = req.user._id || "";
//   const answerId = req.body.answerId || "";
//   const questionId = req.body.questionId || "";

//   try {
//     let newReply = await Question.findByIdAndUpdate(
//       {
//         _id: questionId,
//         "answer._id": answerId,
//       },
//       {
//         $addToSet: {
//           answer: {
//             replies: { reply, userId },
//           },
//         },
//       }
//     );
//     if (newReply) {
//       res.json({
//         msg: "Reply posted successfully",
//         newReply,
//       });
//     } else {
//       res.json({
//         msg: "Reply not found",
//       });
//     }
//   } catch (error) {
//     res.json({ error });
//   }
// };

//   Question.findOneAndUpdate(
//     { _id: answerId },
//     { $addToSet: { replies: { reply, userId } } },
//     (err, newReply) => {
//       if (err) {
//         res.status(400).json({
//           error: errorHandler(err),
//         });
//       } else {
//         res.json({
//           msg: "Reply posted successfully",
//           newReply,
//         });
//       }
//     }
//   );
// };

// exports.updateReply = (req, res) => {
//   const answerId = req.body.answerId;
//   const replyId = req.body.replyId;
//   const replyContent = req.body.replyContent;

//   Question.findOneAndUpdate(
//     { _id: answerId, replies: { $elemMatch: { _id: replyId } } },
//     {
//       $set: {
//         "replies.$.reply": replyContent,
//       },
//     },
//     { new: true },
//     (err, reply) => {
//       if (err) {
//         res.status(400).json({
//           error: errorHandler(err),
//         });
//       }
//       if (!reply) {
//         res.json({
//           error: "Something went wrong. Please try again.",
//         });
//       } else {
//         res.json({
//           msg: "Reply updated successfully",
//           reply,
//         });
//       }
//     }
//   );
// };

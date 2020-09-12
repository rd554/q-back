const Question = require("../models/Cquestion");
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.postQuestion = (req, res) => {
  const newQuestion = new Question({
    question: req.body.question,
    postedBy: req.user._id,
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
  Question.findOne({ _id: questionId }, (err, question) => {
    if (err) {
      res.status(400).json({
        error: errorHandler(err),
      });
      return;
    }
    if (!question) {
      res.status(400).json({
        error: "question not found",
      });
      return;
    }
    let newAnswers = [...question.answers, { answer, userId }];
    return question.updateOne({ answers: newAnswers }, (err, success) => {
      if (err) {
        res.status(400).json({
          error: errorHandler(err),
        });
        return;
      }
      if (success) {
        res.json({
          msg: "Answer posted successfully",
        });
      } else {
        res.json({
          error: "Something went wrong. Please try again.",
        });
      }
    });
  });

  // {
  //   answer: req.body.answer,
  //   postedBy: req.user._id,

  // }
};

exports.listAllCards = (req, res) => {
  // let limit = req.body.limit ? parseInt(req.body.limit) : 10;
  // let skip = req.body.skip ? parseInt(req.body.skip) : 1;
  let limit = 10;
  let pageNo = parseInt(req.body.pageNo) || 1;
  let skip = limit * (pageNo - 1);
  if (pageNo === 1) skip = 0;

  let questions;

  Question.find()
    .populate("postedBy", "_id name")
    .populate("answers.userId", "_id name")
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
  Question.find()
    .populate("postedBy", "_id name")
    .populate("answers.userId", "_id name")
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

  // Question.findOne({ _id: questionId }).exec((err, question) => {
  //   if (err) {
  //     res.status(400).json({
  //       error: errorHandler(err),
  //     });
  //   }
  //   if (!question) {
  //     res.status(400).json({
  //       error: "question not found",
  //     });
  //   } else {
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
  //   }
  // });
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

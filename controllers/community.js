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
      res.json({ Status: false, msg: "Question posting Unsuccessfull..!" });
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
  let limit = 5;
  let pageNo = parseInt(req.body.pageNo) || 1;
  let skip = limit * (pageNo - 1);
  if (pageNo === 1) skip = 0;

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
      if (data) {
        res.json(data);
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

//   const question = req.body.question;
//   const userId = req.user._id;

//   try {
//     await Question.create({
//       question,
//       userId,
//     });
//     res.json({ Status: true, Message: "Question created successfully" });
//   } catch (err) {
//     res.json({ Status: false, Message: err.message });
//   }
// };

// exports.postAnswer = async (req, res) => {
//   const answer = req.body.answer;
//   const userId = req.user._id;

//   try {
//     await Answer.create({
//       answer,
//       userId,
//     });
//     res.json({ Status: true, Message: "Answer Created" });
//   } catch (err) {
//     res.json({ Status: false, Message: err.message });
//   }
// };

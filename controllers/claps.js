const Clap = require("../models/claps");
const Question = require("../models/Cquestion");
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.postClaps = (req, res) => {
  "use strict";
  const ip =
    (req.headers["x-forwarded-for"] || "").split(",").pop().trim() ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
  const questionId = req.body.questionId || "";

  Clap.findByIdAndUpdate(
    { _id: questionId },
    { ip: ip },
    { $inc: { hits: 1 } },
    { upsert: false },
    { new: true },
    (err, clap) => {
      if (err) {
        res.status(400).json({
          error: errorHandler(err),
        });
      } else {
        res.json({
          clap,
        });
      }
    }
  );
};


exports.postClapsForUser = (req, res) => {

  const questionId = req.body.questionId || ''
  let clapsNumber = req.body.clapsNumber || 0
  clapsNumber = clapsNumber + 1

  Question.findOneAndUpdate(
    { _id: questionId },
    { $set: { claps: clapsNumber } },
    { new: true },
    (err, question) => {
      if (err) {
        res.status(400).json({
          error: errorHandler(err),
        });
        return;
      } else {
        res.status(200).json({
          msg: "claps updated successfully",
          question,
        });
      }
    }
  );
}


//   const claps = req.body.claps || "";

//   Clap.findByIdAndUpdate(
//     { _id: questionId },
//     ({ claps: { ip: ip, hits: `${hits}` } }, { upsert: false })
//   ).exec(function (err, claps) {
//     if (err) {
//       res.status(400).json({
//         error: errorHandler(err),
//       });
//     } else {
//       claps = new claps({
//         createdAt: new Date(),
//         ip: ip,
//       });
//     }
//   });

const User = require("../models/user");
const upload = require("../uploads/ImageUpload");
const _ = require("lodash");
const formidalble = require("formidable");
const fs = require("fs");
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.read = (req, res) => {
  req.profile.hashed_password = undefined;
  return res.json(req.profile);
};

exports.publicProfile = (req, res) => {
  let username = req.params.username;
  let user;

  User.findOne({ username }).exec((err, userFromDB) => {
    if (err || !userFromDB) {
      return res.status.json({
        error: "User not found",
      });
    }
    user.photo = undefined;
    user.hashed_password = undefined;
    res.json({ user });
  });
};

exports.update = (req, res) => {
  let form = new formidalble.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: "Error uploading photo",
      });
    }
    let user = req.profile;
    user = _.extend(user, fields);

    if (fields.password && fields.password.length < 6) {
      return res.status(400).json({
        error: "Password should be min 6 characters long",
      });
    }

    if (files.photo) {
      if (files.photo.size > 100000) {
        return res.status(400).json({
          error: "Image should be less than 1 MB",
        });
      }
      user.photo.data = fs.readFileSync(files.photo.path);
      user.photo.contentType = files.photo.type;
    }
    user.save((err, result) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }
      user.hashed_password = undefined;
      user.salt = undefined;
      user.photo = undefined;
      res.json(result);
    });
  });
};

exports.photo = (req, res) => {
  const username = req.params.username;
  User.findOne({ username }).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User not found",
      });
    }
    if (user.photo.data) {
      res.set("Content-Type", user.photo.contentType);
      return res.send(user.photo.data);
    }
  });
};

// (exports.postPhoto = upload.single("photo")),
//   (req, res) => {
//     User.findOneAndUpdate(
//       { username: req.params.username },
//       {
//         $set: {
//           photo: req.file,
//         },
//       },
//       { new: true },
//       (err, user) => {
//         if (err || !user) {
//           return res.status(400).json({
//             error: "User not found",
//           });
//         } else {
//           res.status(200).json({
//             msg: "Photo uploaded successfully",
//           });
//         }
//       }
//     );
//   };

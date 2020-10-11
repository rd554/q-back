const User = require("../models/user");
const upload = require("../uploads/ImageUpload");
const multer = require("multer");
const multerS3 = require("multer-s3");
const AWS = require("aws-sdk");
const _ = require("lodash");
const fs = require("fs");
const formidalble = require('formidable')
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.read = (req, res) => {
  req.profile.hashed_password = undefined;
  return res.json(req.profile);
};

exports.publicProfile = (req, res) => {
  let username = req.params.username;
  let user;
  let blogs;

  User.findOne({ username }).exec((err, userFromDB) => {
      if (err || !userFromDB) {
          return res.status(400).json({
              error: 'User not found'
          });
      }
      user = userFromDB;
      let userId = user._id;
      Blog.find({ postedBy: userId })
          .populate('categories', '_id name slug')
          .populate('tags', '_id name slug')
          .populate('postedBy', '_id name')
          .limit(10)
          .select('_id title slug excerpt categories tags postedBy createdAt updatedAt')
          .exec((err, data) => {
              if (err) {
                  return res.status(400).json({
                      error: errorHandler(err)
                  });
              }
              user.photo = undefined;
              user.hashed_password = undefined;
              res.json({
                  user,
                  blogs: data
              });
          });
  });
};

// exports.update = (req, res) => {
//   let form = new formidalble.IncomingForm();
//   form.keepExtensions = true;
//   form.parse(req, (err, fields, files) => {
//     if (err) {
//       return res.status(400).json({
//         error: "Error uploading photo",
//       });
//     }
//     let user = req.profile;
//     user = _.extend(user, fields);

//     if (fields.password && fields.password.length < 6) {
//       return res.status(400).json({
//         error: "Password should be min 6 characters long",
//       });
//     }

//     if (files.photo) {
//       if (files.photo.size > 100000) {
//         return res.status(400).json({
//           error: "Image should be less than 1 MB",
//         });
//       }
//       user.photo.data = fs.readFileSync(files.photo.path);
//       user.photo.contentType = files.photo.type;
//     }
//     user.save((err, result) => {
//       if (err) {
//         return res.status(400).json({
//           error: errorHandler(err),
//         });
//       }
//       user.hashed_password = undefined;
//       user.salt = undefined;
//       user.photo = undefined;
//       res.json(result);
//     });
//   });
// };

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


const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ID,
  secretAccessKey: process.env.AWS_SECRET
});

const uploadS3 = multer({

  storage: multerS3({
      s3: s3,
      acl: 'public-read',
      bucket: process.env.AWS_BUCKET_NAME,
      metadata: (req, file, callBack) => {
          callBack(null, { fieldName: file.fieldname })
      },
      key: (req, file, callBack) => {
          var fullPath = file.originalname; //If you want to save into a folder concat de name of the folder to the path
          callBack(null, fullPath)
      }
  }),

}).array('photo', 10);


exports.update = async (req, res) => {
  uploadS3(req, res, (error) => {
    if (error) {
        console.log('errors', error);
        res.status(500).json({
            status: 'fail',
            error: error
        });
    } else {

      
      name = req.profile.name
      username = req.profile.username
      email = req.profile.email
      password = req.profile.password


      let user = new User();
      user.name = name;
      user.username = username;
      user.email = email;
      user.password = password;

      user.save((err, result) => {
        if (err) {
          return res.status(400).json({
            error: errorHandler(err),
          });
        }
        
        User.findByIdAndUpdate(result._id, 
          { $set: 
            {
              name: name,
              username: username,
              email: email,
              password: password,
            },
          },
          {new: true},
        (err, result) => {
          if (err) {
            res.status(400).json({
              error: errorHandler(err),
            });
            return;
          } else {
            user.hashed_password = undefined;
            user.salt = undefined;
            user.photo = undefined;
            res.status(200).json({
              msg: "User updated successfully",
              result,
            });
          }
        });
      });
    }
  }) 
}

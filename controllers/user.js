const User = require("../models/user");
const multer = require("multer");
const multerS3 = require("multer-s3");
const AWS = require("aws-sdk");
const _ = require("lodash");
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.read = (req, res) => {
  req.profile.hashed_password = undefined;
  return res.json(req.profile);
};

// exports.publicProfile = (req, res) => {
//   let username = req.params.username;
//   let user;
//   let blogs;

//   User.findOne({ username }).exec((err, userFromDB) => {
//       if (err || !userFromDB) {
//           return res.status(400).json({
//               error: 'User not found'
//           });
//       }
//       user = userFromDB;
//       let userId = user._id;
//       Blog.find({ postedBy: userId })
//           .populate('categories', '_id name slug')
//           .populate('tags', '_id name slug')
//           .populate('postedBy', '_id name')
//           .limit(10)
//           .select('_id title slug excerpt categories tags postedBy createdAt updatedAt')
//           .exec((err, data) => {
//               if (err) {
//                   return res.status(400).json({
//                       error: errorHandler(err)
//                   });
//               }
//               user.photo = undefined;
//               user.hashed_password = undefined;
//               res.json({
//                   user,
//                   blogs: data
//               });
//           });
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
    else {
      res.set("type", user.photo.type);
      return res.send(user.photo);
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
      
      // const user = req.body;
      const name = req.body.name || ''
      const username = req.body.username || ''
      const photo = req.files[0].location || ''
      const email = req.body.email || ''
      const password = req.body.password || ''
      const userId = req.user._id;

      User.findById({ _id: userId }).exec((err, user) => {
        if (err || !user) {
          return res.status(400).json({
            error: "User not found",
          });
        }


        const newUser = {}
        newUser.name = name.length ? name : user.name
        newUser.username = username.length ? username : user.username
        newUser.photo = photo.length ? photo : user.photo
        newUser.email = email.length ? email : user.email
        newUser.hashed_password = password.length ? password : user.hashed_password

        User.findByIdAndUpdate(userId,
          newUser, {new: true},
        (err, result) => {
          if (err) {
            res.status(400).json({
              error: errorHandler(err),
            });
            return;
          } else {
            result.hashed_password = undefined;
            result.salt = undefined;
            result.photo = undefined;
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

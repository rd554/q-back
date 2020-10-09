const Blog = require("../models/blog");
const Category = require("../models/category");
const upload = require("../uploads/ImageUpload");
const Tag = require("../models/tag");
const multer = require("multer");
const multerS3 = require("multer-s3");
const AWS = require("aws-sdk");
const formidable = require("formidable");
const FormData = require("form-data");
const slugify = require("slugify");
const stripHtml = require("string-strip-html");
const _ = require("lodash");
const { errorHandler } = require("../helpers/dbErrorHandler");
const fs = require("fs");
const { smartTrim } = require("../helpers/blog");

// exports.create = (req, res) => {
//   let form = new formidable.IncomingForm();
//   form.keepExtensions = true;
//   form.parse(req, (err, fields, files) => {
//     if (err) {
//       return res.status(400).json({
//         error: "Image could not upload",
//       });
//     }

//     const { title, body, categories, tags } = fields;

// if (!title || !title.length) {
//   return res.status(400).json({
//     error: "Title is required",
//   });
// }

// if (!body || body.length < 200) {
//   return res.status(400).json({
//     error: "Content is too short",
//   });
// }

// if (!categories || !categories.length === 0) {
//   return res.status(400).json({
//     error: "Atleast one category is required",
//   });
// }

// if (!tags || !tags.length) {
//   return res.status(400).json({
//     error: "Atleast one tag is required",
//   });
//     }

//     let blog = new Blog();
//     blog.title = title;
//     blog.body = body;
//     blog.excerpt = smartTrim(body, 120, " ", " ...");
//     blog.slug = slugify(title).toLowerCase();
//     blog.mtitle = `${title} | ${process.env.APP_NAME}`;
//     blog.mdesc = stripHtml(body.substring(0, 160));
//     blog.postedBy = req.user._id;

//     // categories and tags
//     let arrayOfCategories = categories && categories.split(",");
//     let arrayOfTags = tags && tags.split(",");

//     if (files.photo) {
//       if (files.photo.size > 10000000) {
//         return res.status(400).json({
//           error: "Image should be less than 1 MB in size",
//         });
//       }
//       blog.photo.data = fs.readFileSync(files.photo.path);
//       blog.photo.contentType = files.photo.type;
//     }

//     blog.save((err, result) => {
//       if (err) {
//         return res.status(400).json({
//           error: errorHandler(err),
//         });
//       }
//       // res.json(result);
//       Blog.findByIdAndUpdate(
//         result._id,
//         {
//           $push: { categories: arrayOfCategories },
//         },
//         { new: true }
//       ).exec((err, result) => {
//         if (err) {
//           return res.status(400).json({
//             error: errorHandler(err),
//           });
//         } else {
//           Blog.findByIdAndUpdate(
//             result._id,
//             { $push: { tags: arrayOfTags } },
//             { new: true }
//           ).exec((err, result) => {
//             if (err) {
//               return res.status(400).json({
//                 error: errorHandler(err),
//               });
//             } else {
//               res.json(result);
//             }
//           });
//         }
//       });
//     });
//   });
// };

exports.list = (req, res) => {
    Blog.find({})
        .populate("categories", "_id name slug")
        .populate("tags", "_id name slug")
        .populate("postedBy", "_id name username")
        .select(
            "_id title slug excerpt categories tags postedBy createdAt updatedAt"
        )
        .exec((err, data) => {
            if (err) {
                return res.json({
                    error: errorHandler(err),
                });
            }
            res.json(data);
        });
};

exports.blogsForHomePage = (req, res) => {
  let limit = 4;
  let pageNo = parseInt(req.body.pageNo) || 1;
  let skip = limit * (pageNo - 1);
  if (pageNo === 1) skip = 0;

  Blog.find({})
    .sort({ _id: -1 })
    .select("title slug excerpt photo")
    .limit(limit)
    .skip(skip)
    .exec((err, data) => {
      if (err) {
        return res.json({
          error: errorHandler(err),
        });
      }
      res.json(data);
    });
};

exports.listAllBlogsCategoriesTags = (req, res) => {
    let limit = req.body.limit ? parseInt(req.body.limit) : 10;
    let skip = req.body.skip ? parseInt(req.body.skip) : 0;
  
    let blogs;
    let categories;
    let tags;
  
    Blog.find({})
      .populate("categories", "_id name slug")
      .populate("tags", "_id name slug")
      .populate("postedBy", "_id name username profile")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select(
        "_id title slug excerpt categories tags postedBy createdAt updatedAt photo"
      )
      .exec((err, data) => {
        if (err) {
          return res.json({
            error: errorHandler(err),
          });
        }
        blogs = data; //blogs
        // get all categories
        Category.find({}).exec((err, c) => {
          if (err) {
            return res.json({
              error: errorHandler(err),
            });
          }
          categories = c; // all categories
          // get all tags
          Tag.find({}).exec((err, t) => {
            if (err) {
              return res.json({
                error: errorHandler(err),
              });
            }
            tags = t; // all tags
            // return all blogs categories tags
            res.json({ blogs, categories, tags, size: blogs.length });
          });
        });
      });
};


exports.read = (req, res) => {
    const slug = req.params.slug.toLowerCase();
    Blog.findOne({ slug })
      .populate("categories", "_id name slug")
      .populate("tags", "_id name slug")
      .populate("postedBy", "_id name username")
      .select(
        "_id title body slug mtitle mdesc categories tags postedBy createdAt updatedAt photo"
      )
      .exec((err, data) => {
        if (err) {
          return res.json({
            error: errorHandler(err),
          });
        }
        if (data) {
          res.json(data);
        } else {
          res.json({
            error: "data not found",
          });
        }
      });
  };


exports.remove = (req, res) => {
    const slug = req.params.slug.toLowerCase();
    Blog.findOneAndRemove({ slug }).exec((err, data) => {
        if (err) {
            return res.json({
                error: errorHandler(err),
            });
        }
        res.json({
            message: "Blog deleted successfully",
        });
    });
};

exports.update = (req, res) => {
    const slug = req.params.slug.toLowerCase();

    Blog.findOne({ slug }).exec((err, oldBlog) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err),
            });
        }
        let form = new formidable.IncomingForm();
        form.keepExtensions = true;

        form.parse(req, (err, fields, files) => {
            if (err) {
                return res.status(400).json({
                    error: "Image could not upload",
                });
            }

            let slugBeforeMerge = oldBlog.slug;
            oldBlog = _.merge(oldBlog, fields);
            oldBlog.slug = slugBeforeMerge;

            const { body, desc, categories, tags } = fields;

            if (body) {
                oldBlog.excerpt = smartTrim(body, 120, " ", " ...");
                oldBlog.desc = stripHtml(body.substring(0, 160));
            }

            if (categories) {
                oldBlog.categories = categories.split(",");
            }

            if (tags) {
                oldBlog.tags = tags.split(",");
            }

            if (files.photo) {
                if (files.photo.size > 10000000) {
                    return res.status(400).json({
                        error: "Image should be less than 1 MB in size",
                    });
                }
                oldBlog.photo.data = fs.readFileSync(files.photo.path);
                oldBlog.photo.contentType = files.photo.type;
            }

            oldBlog.save((err, result) => {
                if (err) {
                    return res.status(400).json({
                        error: errorHandler(err),
                    });
                }
                // result.photo = undefined;
                res.json(result);
            });
        });
    });
};

exports.photo = (req, res) => {
    const slug = req.params.slug.toLowerCase();
    Blog.findOne({ slug })
        .select("photo")
        .exec((err, blog) => {
            if (err || !blog) {
                return res.status(400).json({
                    error: errorHandler(err),
                });
            } else {
                res.set("Content-Type", blog.photo.contentType);
                return res.send(blog.photo.data);
            }
        });
};

exports.listRelated = (req, res) => {
    let limit = req.body.limit ? parseInt(req.body.limit) : 5;
    const { _id, categories } = req.body.blog;

    Blog.find({ _id: { $ne: _id }, categories: { $in: categories } })
        .limit(limit)
        .populate("postedBy", "_id name profile")
        .select("title slug excerpt postedBy createdAt updatedAt")
        .exec((err, blogs) => {
            if (err) {
                return res.status(400).json({
                    error: "Blogs not found",
                });
            }
            res.json(blogs);
        });
};

exports.listSearch = (req, res) => {
    const { search } = req.query;
    if (search) {
        Blog.find({
                $or: [
                    { title: { $regex: search, $options: "i" } },
                    { body: { $regex: search, $options: "i" } },
                ],
            },
            (err, blogs) => {
                if (err) {
                    return res.status(400).json({
                        error: errorHandler(err),
                    });
                }
                if (blogs) {
                    res.json(blogs);
                } else {
                    res.json({
                        error: "Data not found",
                    });
                }
            }
        ).select("title slug");
    }
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

exports.create = async (req, res) => {
  

  uploadS3(req, res, (error) => {
      // console.log('files', req.files, req.body);
      if (error) {
          console.log('errors', error);
          res.status(500).json({
              status: 'fail',
              error: error
          });
      } else {
          // If File not found

          const { title, body, categories, tags } = req.body;
          // const { photo } = req.file;

          if (!title || !title.length) {
              return res.status(400).json({
                  error: "Title is required",
              });
          }
          if (!body || body.length < 200) {
              return res.status(400).json({
                  error: "Content is too short",
              });
          }
          if (!categories || !categories.length === 0) {
              return res.status(400).json({
                  error: "Atleast one category is required",
              });
          }
          if (!tags || !tags.length) {
              return res.status(400).json({
                  error: "Atleast one tag is required",
              });
          }

          let blog = new Blog();
          blog.title = title;
          blog.body = body;
          blog.photo = req.files[0].location;
          blog.excerpt = smartTrim(body, 120, " ", " ...");
          blog.slug = slugify(title).toLowerCase();
          blog.mtitle = `${title} | ${process.env.APP_NAME}`;
          blog.mdesc = stripHtml(body.substring(0, 160));
          blog.postedBy = req.user._id;

          blog.save((err, result) => {
            console
              if (err) {
                  return res.status(400).json({
                      error: errorHandler(err),
                  });
              } else {
                res.status(200).send(result)
              }
          })
          // categories and tags
          // let arrayOfCategories = categories && categories.split(",");
          // let arrayOfTags = tags && tags.split(",");
          // Blog.findByIdAndUpdate(
          //     result._id, {
          //         $push: { categories: arrayOfCategories },
          //     }, { new: true }
          // ).exec((err, result) => {
          //     if (err) {
          //         return res.status(400).json({
          //             error: errorHandler(err),
          //         });
          //     } else {
          //         Blog.findByIdAndUpdate(
          //             result._id, { $push: { tags: arrayOfTags } }, { new: true }
          //         ).exec((err, result) => {
          //             if (err) {
          //                 return res.status(400).json({
          //                     error: errorHandler(err),
          //                 });
          //             } else {
          //                 res.json(result);
          //             }
          //         });
          //     }
          // });
      }
  })

};

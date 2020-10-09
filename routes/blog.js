const express = require("express");
const router = express.Router();
const multer = require("multer");
const multerS3 = require("multer-s3");
const AWS = require("aws-sdk");
const {
  create,
  list,
  blogsForHomePage,
  listAllBlogsCategoriesTags,
  read,
  remove,
  update,
  photo,
  listRelated,
  listSearch,
  getImages
} = require("../controllers/blog");

const { requireSignin, adminMiddleware } = require("../controllers/auth");

//  const s3 = new AWS.S3({
//     accessKeyId: process.env.AWS_ID,
//     secretAccessKey: process.env.AWS_SECRET
// });
//   const uploadS3 = multer({

//     storage: multerS3({
//         s3: s3,
//         acl: 'public-read',
//         bucket: process.env.AWS_BUCKET_NAME,
//         metadata: (req, file, callBack) => {
//             callBack(null, { fieldName: file.fieldname })
//         },
//         key: (req, file, callBack) => {
//             var fullPath = 'products/' + file.originalname;//If you want to save into a folder concat de name of the folder to the path
//             callBack(null, fullPath)
//         }
//     })
// });

router.post("/blog", requireSignin, adminMiddleware ,create);
router.get("/blogs", list);
router.get("/blogForHomePage", blogsForHomePage);
router.post("/blogs-categories-tags", listAllBlogsCategoriesTags);
router.get("/blog/:slug", read);
router.delete("/blog/:slug", requireSignin, adminMiddleware, remove);
router.put("/blog/:slug", requireSignin, adminMiddleware, update);
router.get("/blog/photo/:slug", photo);
router.post("/blogs/related", listRelated);
router.get("/blogs/search", listSearch);
// router.get("/blogs/getUploads", getImages)


module.exports = router;

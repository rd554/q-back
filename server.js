const express = require("express");
const multer = require("multer");
const AWS = require("aws-sdk");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");

require("dotenv").config();

// bring routes
const blogRoutes = require("./routes/blog");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const categoryRoutes = require("./routes/category");
const tagRoutes = require("./routes/tag");
const formRoutes = require("./routes/form");
const communityRoutes = require("./routes/community");
const clapRoutes = require("./routes/clap");

// app
const app = express();

// db
mongoose
  .connect(process.env.DATABASE_CLOUD, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log("DB connected"));

// middlewares
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
// cors
if (process.env.NODE_ENV === "development") {
  app.use(cors());
}

// routes middleware
app.use("/api", blogRoutes);
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", categoryRoutes);
app.use("/api", tagRoutes);
app.use("/api", formRoutes);
app.use(express.static("public"));
app.use("/api", communityRoutes);
app.use("/api", clapRoutes);

// port
const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// AWS S3
// const s3 = new AWS.S3({
//   accessKeyId: process.env.AWS_ID,
//   secretAccessKey: process.env.AWS_SECRET,
// });

// // using multer
// const storage = multer.memoryStorage({
//   destination: function (req, file, callback) {
//     callback(null, "");
//   },
// });

// const upload = multer({ storage }).single("photo");

// app.post("/upload", upload, (req, res) => {
//   const file = req.file;
//   // let myFile = req.file.originalname.split(".");
//   // const fileType = myFile[myFile.length - 1];

//   // console.log(req.file);
//   // res.send({
//   //   msg: "Hello World",
//   // });

//   const params = {
//     Bucket: process.env.AWS_BUCKET_NAME,
//     Key: file.originalname,
//     Body: file.buffer,
//   };

//   s3.upload(params, (error, data) => {
//     if (error) {
//       res.status(500).send(error);
//     }
//     res.status(200).send(data);
//   });
// });

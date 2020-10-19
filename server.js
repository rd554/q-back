const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
// const path = require('path')

require("dotenv").config();

// bring routes
const blogRoutes = require("./routes/blog");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const categoryRoutes = require("./routes/category");
const tagRoutes = require("./routes/tag");
const communityRoutes = require("./routes/community");


// app
const app = express();

// db
mongoose
  .connect(process.env.DATABASE_LOCAL, {
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
app.use(express.static("public"));

app.use("/api", communityRoutes);

// // Set static folder
// // All the javascript and css files will be read and served from this folder
// app.use(express.static("public/build"));

// // index.html for all page routes  html or routing and naviagtion
// app.get("*", (req, res) => {
//   res.sendFile(path.resolve(__dirname, 'public', 'build'))
// });

// port
const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


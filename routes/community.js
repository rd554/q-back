const express = require("express");
const router = express.Router();
const {
  postQuestion,
  postAnswer,
  listAllCards,
  list,
  updateQuestion,
  updateAnswer,
  removeQuestion,
  removeAnswer,
  getSingleQuestion,
  getSingleAnswer,
  postClapsForUser
  // postReply,
  // updateReply,
  // removeReply,
} = require("../controllers/community");

const { requireSignin } = require("../controllers/auth");

router.post("/community/postQuestion", requireSignin, postQuestion);
router.post("/community/postAnswer", requireSignin, postAnswer);
router.post("/community-questions-answers", listAllCards);
router.get("/community", list);
router.put("/community/updateQuestion", requireSignin, updateQuestion);
router.put("/community/updateAnswer", requireSignin, updateAnswer);
router.delete("/community/deleteQuestion", requireSignin, removeQuestion);
router.delete("/community/deleteAnswer", requireSignin, removeAnswer);
router.get("/community/getSingleQuestion/:questionId", getSingleQuestion);
router.get("/community/getSingleAnswer/:answerId", getSingleAnswer);
router.post("/community/postClapsForUser", requireSignin, postClapsForUser);


// router.post("/community/postReply", requireSignin, postReply);
// router.put("/community/updateReply", requireSignin, updateReply);
// // router.delete("/community/deleteReply/:answerId", requireSignin, removeReply);

module.exports = router;

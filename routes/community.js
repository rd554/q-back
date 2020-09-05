const express = require("express");
const router = express.Router();
const {
  postQuestion,
  postAnswer,
  listAllCards,
  list,
} = require("../controllers/community");

const { requireSignin } = require("../controllers/auth");

router.post("/community/postQuestion", requireSignin, postQuestion);
router.post("/community/postAnswer", requireSignin, postAnswer);
router.post("/community-questions-answers", listAllCards);
router.get("/community", list);

module.exports = router;

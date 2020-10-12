const express = require("express");
const router = express.Router();
const { postClaps , postClapsForUser } = require("../controllers/claps");
const { requireSignin } = require("../controllers/auth");

router.post("/claps/postClaps", postClaps);
router.post("/claps/postClapsForUser", requireSignin, postClapsForUser);

module.exports = router;

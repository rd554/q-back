const express = require("express");
const router = express.Router();
const { postClaps } = require("../controllers/claps");

router.post("/claps/postClaps", postClaps);

module.exports = router;

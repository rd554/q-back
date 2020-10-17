const express = require("express");
const router = express.Router();
const { requireSignin, authMiddleware } = require("../controllers/auth");
const { update, photo, read} = require("../controllers/user");

router.get("/user", requireSignin, authMiddleware, read);
// router.get("/user/:username", publicProfile);
router.post("/user/update", requireSignin, authMiddleware, update);
router.get("/user/photo/:username", photo);


module.exports = router;

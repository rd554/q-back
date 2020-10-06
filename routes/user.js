const express = require("express");
const router = express.Router();
const { requireSignin, authMiddleware } = require("../controllers/auth");
const { update, photo, read, publicProfile } = require("../controllers/user");

router.get("/user", requireSignin, authMiddleware, read);
router.get("/user/:username", publicProfile);
router.put("/user/update", requireSignin, authMiddleware, update);
router.get("/user/photo/:username", photo);
// router.put("/user/photo/:username", requireSignin, updatePhoto);

// test
// router.get("/secret", requireSignin, (req, res) => {
//   res.json({
//     user: req.user,
//   });
// });

module.exports = router;

const express = require("express");
const router = express.Router();
const { sendMail } = require("../controllers/form");

// validators
const { runValidation } = require("../validators");
const { contactFormValidator } = require("../validators/form");

// router.post("/contact", contactFormValidator, runValidation, contactForm);
router.post("/sendMail", sendMail);

module.exports = router;

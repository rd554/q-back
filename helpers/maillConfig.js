const nodeMailer = require("nodemailer");
const user = process.env.GMAIL_USER;
const pass = process.env.GMAIL_PASS;

let transporter = nodeMailer.createTransport({
  host: "smtp.gmail.com",
  transportMethod: "SMTP",
  port: 465,
  secure: true,
  auth: { user, pass },
});

module.exports = transporter;

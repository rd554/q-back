const nodeMailer = require("nodemailer");
const user = process.env.EMAIL_TO;
const pass = process.env.PASSWORD;

let transporter = nodeMailer.createTransport({
  host: "smtp.gmail.com",
  transportMethod: "SMTP",
  port: 465,
  secure: true,
  auth: { user, pass },
});

module.exports = transporter;

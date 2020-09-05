const transporter = require("../helpers/mailConfig");

exports.contactForm = (req, res) => {
  const { name, email, message } = req.body;

  const mailOptions = {
    from: email,
    to: process.env.EMAIL_TO,
    subject: `Contact form - ${process.env.APP_NAME}`,
    text: `Email received from contact from \n Sender name: ${name} \n Sender email: ${email} \n Sender message: ${message}`,
    html: `
      <h4>Email received from contact form:</h4>
      <p>Sender name: ${name}</p>
      <p>Sender email: ${email}</p>
      <p>Sender message: ${message}</p>
      <h4 />
      <p>This email may contain sensitive information</p>
      <p>https://quonquer.com</p>
    `,
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      res.json({ status: false, message: error.message });
    }
    if (info) {
      res.json({ status: true, info, message });
    }
  });
};

// const sgMail = require("@sendgrid/mail");
// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// exports.contactForm = (req, res) => {
//   const { name, email, message } = req.body;
//   // console.log(req.body);

//   const emailData = {
//     to: process.env.EMAIL_TO,
//     from: email,
//     subject: `Contact form - ${process.env.APP_NAME}`,
//     text: `Email received from contact from \n Sender name: ${name} \n Sender email: ${email} \n Sender message: ${message}`,
//     html: `
//     <h4>Email received from contact form:</h4>
//     <p>Sender name: ${name}</p>
//     <p>Sender email: ${email}</p>
//     <p>Sender message: ${message}</p>
//     <hr />
//     <p>This email may contain sensitive information</p>
//     <p>https://quonquer.com</p>
//     `,
//   };

//   sgMail
//     .send(emailData)
//     .then((sent) => {
//       res.json({
//         success: [],
//       });
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// };

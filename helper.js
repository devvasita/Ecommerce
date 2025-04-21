const nodemailer = require("nodemailer");

// exports.transporter = nodemailer.createTransport({
//   host: "smtp.ethereal.email",
//   port: 587,
//   auth: {
//     user: "garry.prosacco@ethereal.email",
//     pass: "8x9ebWNEsZcfbUfBbn",
//   },
// });

exports.transporter = nodemailer.createTransport({
  service: process.env.SMTP_SERVICE,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

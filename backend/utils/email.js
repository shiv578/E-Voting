// utils/email.js
const nodemailer = require('nodemailer');

async function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: +process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,    // must be "apikey"
      pass: process.env.SMTP_PASS     // your SendGrid API key
    }
  });
}

async function sendEmail(to, subject, html) {
  const transporter = await createTransporter();

  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    html
  });

  console.log("📨 Email sent:", info.messageId);
  console.log("To:", to);

  return info;
}

module.exports = sendEmail;

// backend/utils/sendEmail.js
const sgMail = require('@sendgrid/mail');

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const sendEmail = async (to, subject, text, html = null) => {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn("[sendEmail] Missing API Key");
    return;
  }

  // Use the verified sender from env, or fallback
  const from = process.env.SMTP_FROM || 'abilegend11@gmail.com'; 

  const msg = {
    to,
    from, 
    subject,
    text,
    html: html || text.replace(/\n/g, '<br>'),
  };

  try {
    await sgMail.send(msg);
    console.log(`✅ Email sent to ${to}`);
  } catch (error) {
    console.error("❌ SendGrid Raw Error:", error);

    // EXTRACT THE REAL REASON
    let errorMessage = error.message;
    if (error.response && error.response.body && error.response.body.errors) {
        // SendGrid usually sends an array of errors, grab the first one
        errorMessage = error.response.body.errors[0].message;
    }

    // Throw the REAL error so it shows up in your Alert box
    throw new Error(errorMessage);
  }
};

module.exports = sendEmail;
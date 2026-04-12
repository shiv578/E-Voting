// backend/routes/contact.js
const express = require('express');
const router = express.Router();
const sendEmail = require('../utils/email');
const AuditLog = require('../models/AuditLog'); // if you want to log

// POST /api/contact
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // basic validation
    if (!name || !email || !message) {
      return res.status(400).json({ msg: 'Name, email and message are required.' });
    }

    // build HTML email
    const html = `
      <h2>New Contact Message from E-Voting Portal</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject || '(no subject)'}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
    `;

    // send email to your admin/support email
    await sendEmail(
      process.env.CONTACT_RECEIVER_EMAIL || 'your-admin@example.com',
      `Contact form: ${subject || 'No Subject'}`,
      html
    );

    // optional: save audit log
    try {
      await AuditLog.create({
        user: null, // or req.user? if logged in
        action: 'CONTACT_MESSAGE',
        details: { name, email, subject },
      });
    } catch (e) {
      console.error('audit log contact error:', e);
    }

    return res.json({ msg: 'Your message has been sent successfully.' });
  } catch (err) {
    console.error('CONTACT error:', err);
    return res
      .status(500)
      .json({ msg: 'Unable to send message right now. Please try again later.' });
  }
});

module.exports = router;

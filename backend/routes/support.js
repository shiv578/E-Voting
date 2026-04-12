// backend/routes/support.js
const express = require('express');
const router = express.Router();

const SupportTicket = require('../models/SupportTicket');
const AuditLog = require('../models/AuditLog');
const auth = require('../middleware/auth');
const sendEmail = require('../utils/sendEmail'); // ✅ uses SendGrid (same as OTP)

// --- helper: admin check ---
function ensureAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Admin only' });
  }
  next();
}

// --------------------------------------------------
// POST /api/support/contact  (user submits ticket)
// --------------------------------------------------
router.post('/contact', async (req, res) => {
  try {
    const { name, email, category, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res
        .status(400)
        .json({ msg: 'All required fields must be filled.' });
    }

    const ticket = await SupportTicket.create({
      name,
      email,
      category: category || 'other',
      subject,
      message,
      status: 'open',
    });

    await AuditLog.create({
      action: 'SUPPORT_TICKET_CREATED',
      details: { ticketId: ticket._id, email },
    });

    return res.json({
      msg: 'Your message has been submitted. Our support team will contact you soon.',
      ticketId: ticket._id,
    });
  } catch (err) {
    console.error('support contact error:', err);
    return res.status(500).json({
      msg: 'Server error',
      error: err.message,
    });
  }
});

// --------------------------------------------------
// GET /api/support?status=open|in_progress|closed|all
// Admin list tickets
// --------------------------------------------------
router.get('/', auth, ensureAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};

    if (status && status !== 'all') {
      filter.status = status;
    }

    const tickets = await SupportTicket.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ tickets });
  } catch (err) {
    console.error('support list error:', err);
    return res.status(500).json({
      msg: 'Server error',
      error: err.message,
    });
  }
});

// --------------------------------------------------
// POST /api/support/:id/reply (DEBUG VERSION)
// --------------------------------------------------
router.post('/:id/reply', auth, ensureAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, message, status } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ msg: 'Reply subject and message are required.' });
    }

    const ticket = await SupportTicket.findById(id);
    if (!ticket) {
      return res.status(404).json({ msg: 'Ticket not found' });
    }

    // Prepare email body
    const bodyText = `
Dear ${ticket.name || 'Voter'},

${message}

----------------------------
Ticket ID : ${ticket._id}
Category  : ${ticket.category}
Status    : ${status || 'closed'}

This is an automated email from Official E-Voting Support.
`;

    let emailError = null;
    try {
      console.log("Attempting to send email to:", ticket.email);
      await sendEmail(ticket.email, subject, bodyText);
      console.log("Email sent successfully!");
    } catch (mailErr) {
      console.error('CRITICAL EMAIL ERROR:', mailErr);
      // Capture the full error to send back to you
      emailError = mailErr.message || JSON.stringify(mailErr);
      if (mailErr.response) {
        emailError += ' :: ' + JSON.stringify(mailErr.response.body);
      }
    }

    // Update ticket details
    ticket.responseSubject = subject;
    ticket.responseBody = message;
    ticket.respondedAt = new Date();
    ticket.respondedBy = req.user.id;
    ticket.status = status || 'closed';
    await ticket.save();

    await AuditLog.create({
      user: req.user.id,
      action: 'SUPPORT_TICKET_REPLIED',
      details: { ticketId: ticket._id, newStatus: ticket.status },
    });

    // 🔴 CHANGE IS HERE: Return the REAL error to the frontend
    if (emailError) {
      return res.status(200).json({
        msg: `Email FAILED: ${emailError}`, // <--- You will see this in your alert now
        ticket,
      });
    }

    return res.json({
      msg: 'Reply sent and ticket updated.',
      ticket,
    });

  } catch (err) {
    console.error('support reply error:', err);
    return res.status(500).json({
      msg: 'Server error',
      error: err.message,
    });
  }
});

module.exports = router;

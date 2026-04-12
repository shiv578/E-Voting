// backend/models/SupportTicket.js
const mongoose = require('mongoose');

const SupportTicketSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    category: { type: String, default: 'other' },
    subject: { type: String, required: true },
    message: { type: String, required: true },

    status: {
      type: String,
      enum: ['open', 'in_progress', 'closed'],
      default: 'open',
    },

    // reply info
    responseSubject: { type: String },
    responseBody: { type: String },
    respondedAt: { type: Date },
    respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SupportTicket', SupportTicketSchema);

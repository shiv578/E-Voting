// Backend/models/Election.js
const mongoose = require('mongoose');

const electionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  startTime: Date,
  endTime: Date,
  isPublic: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  isArchived: { type: Boolean, default: false }, 
   // NEW
});


module.exports = mongoose.models.Election || mongoose.model('Election', electionSchema);

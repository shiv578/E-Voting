const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  election: { type: mongoose.Schema.Types.ObjectId, ref: 'Election', required: true },
  name: { type: String, required: true },
  party: String,
  description: String,
  iconUrl: { type: String },
  votesCount: { type: Number, default: 0 }
});

module.exports = mongoose.model('Candidate', candidateSchema);

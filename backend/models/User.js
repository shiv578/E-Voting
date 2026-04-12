// backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  resetOtpHash: String,
  resetOtpExpires: Date,
  resetOtpAttempts: { type: Number, default: 0 },
  resetOtp: { type: String },
resetOtpExpires: { type: Date },
resetOtpAttempts: { type: Number, default: 0 },
resetOtpToken: { type: String },
  // track password change
  passwordChangedAt: Date,
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  phone: { type: String },         
phoneAddedAt: { type: Date },     
  role: { type: String, enum: ['voter', 'admin'], default: 'voter' },

  // KYC fields
  dob: { type: Date },
  idType: { type: String },          // e.g. Aadhaar, VoterID, StudentID
  idNumber: { type: String },        // plain for display
idNumberHash: { type: String },     // hashed ID number
  idDocPath: { type: String },       // uploaded ID proof

  // Verification status
  verificationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: Date,

  // Profile avatar
  avatarUrl: { type: String },       // /uploads/avatars/xyz.jpg

  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', userSchema);

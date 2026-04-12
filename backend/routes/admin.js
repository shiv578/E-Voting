// backend/routes/admin.js
const express = require('express');
const router = express.Router();

const AuditLog = require('../models/AuditLog');
const User = require('../models/User');      // 👈 needed for /users
const auth = require('../middleware/auth');

// simple admin guard
function ensureAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Admin only' });
  }
  next();
}

/**
 * GET /api/admin/users?status=pending|approved|rejected
 * Returns list of users for admin verification panel.
 */
router.get('/users', auth, ensureAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};

    if (status) {
      filter.verificationStatus = status;
    }

    const users = await User.find(filter)
      .select('-passwordHash')      // never send password hash
      .sort({ createdAt: -1 })
      .lean();

    // NOTE: users here will include idType, idNumber, idDocPath, phone, etc.
    return res.json({ users });
  } catch (err) {
    console.error('admin users error:', err);
    return res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

/**
 * GET /api/admin/audit-logs?limit=50&action=...&userId=...
 * Existing route – unchanged.
 */
// GET /api/admin/users/:id  -> single user for KYC review
router.get('/users/:id', auth, ensureAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-passwordHash')
      .lean();

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    return res.json({ user });
  } catch (err) {
    console.error('admin user detail error:', err);
    return res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

router.get('/audit-logs', auth, ensureAdmin, async (req, res) => {
  try {
    const { action, userId, limit } = req.query;
    const filter = {};

    if (action) filter.action = action;
    if (userId) filter.user = userId;

    const lim = Math.min(parseInt(limit) || 50, 200);

    const logs = await AuditLog.find(filter)
      .sort({ timestamp: -1 })
      .limit(lim)
      .populate('user', 'name email role')
      .lean();

    res.json({ logs });
  } catch (err) {
    console.error('audit logs error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

router.patch('/verify/:id', auth, ensureAdmin, async (req, res) => {
  try {
    const userId = req.params.id;

    // 👇 THIS UPDATES THE DATABASE
    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      { verificationStatus: "verified" }, // Matches your DB field name exactly
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Optional: Create an audit log for this action
    // await AuditLog.create({ user: req.user.id, action: 'VERIFY_USER', details: `Verified user ${userId}` });

    return res.json({ msg: 'User verified successfully', user: updatedUser });

  } catch (err) {
    console.error('Verify user error:', err);
    return res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

module.exports = router;

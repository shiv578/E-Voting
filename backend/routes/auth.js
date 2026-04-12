const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose'); // Required for manual GridFS
const { Readable } = require('stream'); // Required to stream file buffers

const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const auth = require('../middleware/auth');
const verifyTurnstile = require('../middleware/verifyTurnstile');

const router = express.Router();

function ensureAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Admin only' });
  }
  next();
}

// ---------------------------------------------------------
// 1. CONFIGURE MULTER (MEMORY STORAGE)
// ---------------------------------------------------------
// We store the file in RAM temporarily.
// DO NOT use GridFsStorage here.
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ---------------------------------------------------------
// 2. HELPER FUNCTION: MANUAL UPLOAD TO GRIDFS
// ---------------------------------------------------------
const uploadToGridFS = (file, bucketName) => {
  return new Promise((resolve, reject) => {
    // Create a unique filename
    const filename = Date.now() + '-' + crypto.randomBytes(6).toString('hex') + path.extname(file.originalname);
    
    // Get the specific GridFS Bucket (id_docs or avatars)
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: bucketName
    });

    // Create an upload stream to MongoDB
    const uploadStream = bucket.openUploadStream(filename, {
      contentType: file.mimetype
    });

    // Stream the file buffer from RAM to the Database
    const readStream = Readable.from(file.buffer);
    readStream.pipe(uploadStream)
      .on('error', (err) => reject(err))
      .on('finish', (savedFile) => {
         resolve(filename); 
      });
  });
};

// ---------------------------------------------------------
// 3. REGISTER ROUTE
// ---------------------------------------------------------
router.post('/register', upload.single('idDoc'), async (req, res) => {
  try {
    const { name, email, password, dob, idType, idNumber } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ msg: 'Name, email, password are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ msg: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    let idNumberHash;
    if (idNumber) {
      idNumberHash = crypto.createHash('sha256').update(idNumber).digest('hex');
    }

    // Age Check
    let parsedDob = dob ? new Date(dob) : undefined;
    if (parsedDob && !isNaN(parsedDob)) {
      const ageMs = Date.now() - parsedDob.getTime();
      const age = new Date(ageMs).getUTCFullYear() - 1970;
      if (age < 18) {
        return res.status(400).json({ msg: 'Must be 18+ to register' });
      }
    }

    // --- MANUAL UPLOAD LOGIC ---
    let idDocFilename = undefined;
    if (req.file) {
       // Manually upload to the 'id_docs' bucket
       idDocFilename = await uploadToGridFS(req.file, 'id_docs');
    }

    const user = new User({
      name,
      email,
      passwordHash,
      dob: parsedDob || undefined,
      idType,
      idNumber: idNumber || undefined,
      idNumberHash,
      idDocPath: idDocFilename, // Save the generated filename
      verificationStatus: 'pending',
    });

    await user.save();

    await AuditLog.create({
      user: user._id,
      action: 'USER_REGISTERED',
      details: { email: user.email },
    });

    res.json({ msg: 'Registered. Awaiting verification.' });
  } catch (err) {
    console.error('register error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// ---------------------------------------------------------
// 4. LOGIN ROUTE
// ---------------------------------------------------------
router.post('/login', verifyTurnstile, async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ msg: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid email or password' });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verificationStatus: user.verificationStatus,
        avatarUrl: user.avatarUrl || null,
      },
    });
  } catch (err) {
    console.error('login error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// ---------------------------------------------------------
// 5. GET CURRENT USER
// ---------------------------------------------------------
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash').lean();
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json({ user });
  } catch (err) {
    console.error('me error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// ---------------------------------------------------------
// 6. CHANGE PASSWORD
// ---------------------------------------------------------
router.post('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ msg: 'Missing passwords' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) return res.status(400).json({ msg: 'Current password incorrect' });

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    await AuditLog.create({ user: user._id, action: 'PASSWORD_CHANGED', details: {} });
    res.json({ msg: 'Password changed successfully' });
  } catch (err) {
    console.error('change-pw error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// ---------------------------------------------------------
// 7. AVATAR UPLOAD
// ---------------------------------------------------------
router.post('/avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: 'No file uploaded' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    // --- MANUAL UPLOAD LOGIC ---
    const avatarFilename = await uploadToGridFS(req.file, 'avatars');

    user.avatarUrl = avatarFilename; 
    await user.save();

    await AuditLog.create({
      user: user._id,
      action: 'AVATAR_UPDATED',
      details: { avatarUrl: user.avatarUrl },
    });

    res.json({ msg: 'Avatar updated', avatarUrl: user.avatarUrl });
  } catch (err) {
    console.error('avatar error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// ---------------------------------------------------------
// 8. SAVE PHONE
// ---------------------------------------------------------
router.post('/phone', auth, async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ msg: 'Phone required' });

    const phoneDigits = phone.replace(/\D/g, '');
    if (!/^\d{10}$/.test(phoneDigits)) {
      return res.status(400).json({ msg: 'Invalid phone format' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    if (user.phone) return res.status(400).json({ msg: 'Phone already set' });

    user.phone = phoneDigits;
    user.phoneAddedAt = new Date();
    await user.save();

    res.json({ msg: 'Phone saved' });
  } catch (err) {
    console.error('phone error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ---------------------------------------------------------
// 9. DELETE ACCOUNT
// ---------------------------------------------------------
router.delete('/delete-account', auth, async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ msg: 'Password incorrect' });

    await AuditLog.create({ user: user._id, action: 'ACCOUNT_DELETED', details: { email: user.email } });
    await User.findByIdAndDelete(user._id);

    res.json({ msg: 'Account deleted' });
  } catch (err) {
    console.error('delete error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// ---------------------------------------------------------
// 10. ADMIN VERIFY USER
// ---------------------------------------------------------
router.post('/admin/verify/:userId', auth, ensureAdmin, async (req, res) => {
  try {
    const { action } = req.body;
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ msg: 'Invalid action' });
    }

    const update = {
      verificationStatus: action === 'approve' ? 'verified' : 'rejected',
      verifiedBy: req.user.id,
      verifiedAt: new Date(),
    };

    await User.findByIdAndUpdate(req.params.userId, update);

    await AuditLog.create({
      user: req.user.id,
      action: 'USER_VERIFICATION',
      details: { target: req.params.userId, result: action },
    });

    res.json({ msg: 'Updated' });
  } catch (err) {
    console.error('verify error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

module.exports = router;
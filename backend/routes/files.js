// backend/routes/files.js
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// Get the MongoDB connection
const conn = mongoose.connection;
let gridfsBucketIdDocs;
let gridfsBucketAvatars;

conn.once('open', () => {
  // Initialize GridFS Buckets
  gridfsBucketIdDocs = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: 'id_docs'
  });
  gridfsBucketAvatars = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: 'avatars'
  });
});

// Route: Get ID Document Image
// URL: /api/files/id_docs/<filename>
router.get('/id_docs/:filename', async (req, res) => {
  try {
    const file = await gridfsBucketIdDocs.find({ filename: req.params.filename }).toArray();
    
    if (!file || file.length === 0) {
      return res.status(404).json({ err: 'No file exists' });
    }

    // Stream file to browser
    const readStream = gridfsBucketIdDocs.openDownloadStreamByName(req.params.filename);
    readStream.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ err: 'Error retrieving file' });
  }
});

// Route: Get Avatar Image
// URL: /api/files/avatars/<filename>
router.get('/avatars/:filename', async (req, res) => {
  try {
    const file = await gridfsBucketAvatars.find({ filename: req.params.filename }).toArray();
    
    if (!file || file.length === 0) {
      return res.status(404).json({ err: 'No file exists' });
    }

    const readStream = gridfsBucketAvatars.openDownloadStreamByName(req.params.filename);
    readStream.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ err: 'Error retrieving file' });
  }
});

module.exports = router;
// backend/routes/votes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Vote = require('../models/Vote');
const Candidate = require('../models/Candidate');
const Election = require('../models/Election');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');


// GET /api/votes/my  -> get all votes of current user
router.get('/votes/my', auth, async (req, res) => {
  try {
    const voterId = req.user.id;

    const votes = await Vote.find({ voter: voterId })
      .populate('election', 'title startTime endTime')
      .populate('candidate', 'name party')
      .sort({ _id: -1 }) // newest first
      .lean();

    return res.json({ votes });
  } catch (err) {
    console.error('my votes error:', err);
    res.status(500).json({ msg: 'Internal server error', error: err.message });
  }
});


// POST /api/elections/:id/vote
router.post('/elections/:id/vote', auth, async (req, res) => {
  const voterId = req.user.id;
  const electionId = req.params.id;
  const { candidateId } = req.body;

  if (!candidateId) {
    return res.status(400).json({ msg: 'candidateId is required' });
  }

  try {
    // 1) Check user exists & is verified
    const user = await User.findById(voterId).lean();
    if (!user) return res.status(404).json({ msg: 'User not found' });
    if (user.verificationStatus !== 'approved') {
      return res.status(403).json({ msg: 'Your account is not verified to vote' });
    }

    // 2) Check election active
    const election = await Election.findById(electionId).lean();
    if (!election) return res.status(404).json({ msg: 'Election not found' });

    const now = new Date();
    if (election.startTime && now < new Date(election.startTime)) {
      return res.status(400).json({ msg: 'Election has not started yet' });
    }
    if (election.endTime && now > new Date(election.endTime)) {
      return res.status(400).json({ msg: 'Election has already ended' });
    }

    // 3) Check candidate belongs to this election
    const candidate = await Candidate.findOne({ _id: candidateId, election: electionId });
    if (!candidate) {
      return res.status(404).json({ msg: 'Candidate not found in this election' });
    }

    // 4) Optional app-level duplicate check (nice message)
    const already = await Vote.findOne({ election: electionId, voter: voterId });
    if (already) {
      return res.status(400).json({ msg: 'You have already voted in this election' });
    }

    // 5) Create vote + increment candidate + audit log
    try {
      await Vote.create({ election: electionId, candidate: candidateId, voter: voterId });
      await Candidate.updateOne({ _id: candidateId }, { $inc: { votesCount: 1 } });
      await AuditLog.create({
        user: voterId,
        action: 'VOTE_CAST',
        details: { electionId, candidateId },
      });

      return res.json({ msg: 'Vote cast successfully' });
    } catch (err) {
      // unique index duplicate
      if (err && err.code === 11000) {
        return res.status(400).json({ msg: 'You have already voted in this election' });
      }
      console.error('Vote save error:', err);
      return res.status(500).json({ msg: 'Internal server error (vote)', error: err.message });
    }
  } catch (err) {
    console.error('Vote route error:', err);
    return res.status(500).json({ msg: 'Internal server error', error: err.message });
  }
});

// GET /api/elections/:id/vote-status  (used by frontend to show "Already voted")
router.get('/elections/:id/vote-status', auth, async (req, res) => {
  try {
    const voterId = req.user.id;
    const electionId = req.params.id;
    const found = await Vote.findOne({ election: electionId, voter: voterId }).lean();
    res.json({ hasVoted: !!found });
  } catch (err) {
    console.error('vote-status error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;

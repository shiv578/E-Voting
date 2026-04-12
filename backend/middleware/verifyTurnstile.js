// backend/middleware/verifyTurnstile.js  cloudflare turnstile verification middleware
const axios = require('axios');

module.exports = async function verifyTurnstile(req, res, next) {
  try {
    const token = req.body?.turnstile || req.headers['x-turnstile-token'];
    if (!token) return res.status(400).json({ msg: 'Human verification required' });

    const secret = process.env.TURNSTILE_SECRET;
    if (!secret) {
      console.warn('TURNSTILE_SECRET not set, bypassing verification (dev)');
      return next();
    }

    const params = new URLSearchParams();
    params.append('secret', secret);
    params.append('response', token);
    // optionally pass remoteip: params.append('remoteip', req.ip);

    const resp = await axios.post('https://challenges.cloudflare.com/turnstile/v0/siteverify', params);
    if (!resp.data || !resp.data.success) {
      console.log('Turnstile verification failed:', resp.data);
      return res.status(400).json({ msg: 'Bot verification failed' });
    }

    // passed
    next();
  } catch (err) {
    console.error('Turnstile verify error:', err?.response?.data || err.message || err);
    return res.status(500).json({ msg: 'Turnstile verification error' });
  }
};

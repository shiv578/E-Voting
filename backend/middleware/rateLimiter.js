const rateLimit = require('express-rate-limit');

const createLimiter = (opts = {}) =>
  rateLimit({
    windowMs: opts.windowMs || 15 * 60 * 1000,
    max:
      process.env.NODE_ENV === 'development'
        ? 1000                   // huge limit while dev
        : opts.max || 10,        // real limit in prod
    standardHeaders: true,
    legacyHeaders: false,
  });

module.exports = createLimiter;

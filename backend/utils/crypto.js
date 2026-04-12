// utils/crypto.js
const crypto = require('crypto')

function genNumericOtp(len = 6) {
  const min = 10 ** (len - 1)
  const max = 10 ** len - 1
  return String(Math.floor(Math.random() * (max - min + 1)) + min)
}

function sha256(text) {
  return crypto.createHash('sha256').update(text).digest('hex')
}

module.exports = { genNumericOtp, sha256 }

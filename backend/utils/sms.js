// utils/sms.js
const twilio = require('twilio')

let client = null
if (process.env.TWILIO_SID && process.env.TWILIO_AUTH_TOKEN) {
  client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN)
}

async function sendSms(to, body) {
  if (!client) throw new Error('Twilio not configured')
  return client.messages.create({ body, from: process.env.TWILIO_FROM, to })
}

module.exports = sendSms

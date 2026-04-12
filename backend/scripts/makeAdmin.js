// run from backend folder: node scripts/makeAdmin.js <email>
const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');

async function run() {
  const email = process.argv[2];
  if (!email) return console.log('Usage: node makeAdmin.js user@example.com');
  await mongoose.connect(process.env.MONGODB_URI);
  const u = await User.findOneAndUpdate({ email }, { role: 'admin' }, { new: true });
  console.log('Updated user:', u);
  await mongoose.disconnect();
}
run();

const mongoose = require('mongoose');
require('dotenv').config();
const Vote = require('./models/Vote');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const votes = await Vote.find().populate('voter candidate election');
  console.log('Votes:', votes);
  await mongoose.disconnect();
}
run();

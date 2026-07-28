// backend/server.js
const dotenv = require('dotenv');

// ✅ 1. LOAD ENVIRONMENT VARIABLES FIRST
dotenv.config(); 

const mongoose = require('mongoose');

// ✅ 2. IMPORT APP AFTER LOADING VARIABLES
// Now when auth.js loads inside app, it can see process.env.MONGODB_URI

const app = require('./app');

const PORT = process.env.PORT || 5000;

// Ensure this matches the variable name in your .env file
// You previously used MONGODB_URI in auth.js, so stick with that.
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ Fatal Error: MONGODB_URI is not defined in .env file");
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.error('❌ MongoDB connection failed:', err));

// backend/app.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth');
const electionRoutes = require('./routes/elections');
const voteRoutes = require('./routes/votes');
const adminRoutes = require('./routes/admin');
const authOtpRouter = require('./routes/authOtpReset'); 
const supportRoutes = require('./routes/support'); 
const fileRoutes = require('./routes/files');

const app = express();

// CORS
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:8080";

app.use(cors({
 origin: [
    "http://localhost:5173", 
    "http://localhost:8080",
    "https://e-voting-systemmabi.onrender.com",
    "https://e-voting-system-vert.vercel.app"
  ],
  credentials: true,
  // 👇 "PATCH" MUST BE IN THIS LIST 👇
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], 
  allowedHeaders: ["Content-Type", "Authorization"]
}));


app.use((req, res, next) => {
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/auth', authOtpRouter);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/elections', electionRoutes);
app.use('/api', voteRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/support', supportRoutes);
app.get('/', (req, res) => {
  res.send('E-Voting System Backend Running ✅');
});

module.exports = app;
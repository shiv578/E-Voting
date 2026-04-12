const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
require("dotenv").config();

async function main(){
  await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/e-voting");
  const passwordHash = await bcrypt.hash("adminpass123", 10);
  const admin = new User({
    name: "AdminUser",
    email: "admin@example.com",
    passwordHash,
    role: "admin",
    verificationStatus: "approved"
  });
  await admin.save();
  console.log("Admin created:", admin._id, admin.email);
  process.exit(0);
}
main().catch(err => { console.error(err); process.exit(1); });

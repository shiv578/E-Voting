// backend/routes/authOtpReset.js
const express = require("express");
const router = express.Router();
const crypto = require("crypto");

const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const verifyTurnstile = require("../middleware/verifyTurnstile");

// helper to generate numeric 6-digit OTP
function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/**
 * POST /api/auth/request-reset-otp
 * body: { identifier, via, turnstile }
 */
router.post("/request-reset-otp", verifyTurnstile, async (req, res) => {
  try {
    const { identifier, via } = req.body;

    if (!identifier) {
      return res
        .status(400)
        .json({ msg: "Email address is required for password recovery." });
    }

    const user = await User.findOne({ email: identifier });
    // For security, do NOT reveal whether user exists
    if (!user) {
      return res.json({
        msg:
          "If that account exists, you will receive an OTP shortly on your email.",
      });
    }

    // generate OTP & expiry
    const otp = generateOtp();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    user.resetOtp = otp;
    user.resetOtpExpires = new Date(expiresAt);
    user.resetOtpAttempts = 0;
    await user.save();

    const textBody = `
Dear ${user.name || "Voter"},

You have requested to reset the password for your E-Voting account.

Your One-Time Password (OTP) is:

    ${otp}

This OTP is valid for 10 minutes. Do NOT share it with anyone.

If you did not request this, you can safely ignore this email.

Regards,
Official E-Voting Support
`;

    await sendEmail(
      user.email,
      "E-Voting Password Reset OTP",
      textBody
    );

    return res.json({
      msg:
        "If that account exists, you will receive an OTP shortly on your email.",
    });
  } catch (err) {
    console.error("request-reset-otp error:", err);
    return res.status(500).json({
      msg: "Server error while generating OTP.",
      error: err.message,
    });
  }
});

/**
 * POST /api/auth/verify-reset-otp
 * body: { identifier, otp }
 */
router.post("/verify-reset-otp", async (req, res) => {
  try {
    const { identifier, otp } = req.body;

    if (!identifier || !otp) {
      return res.status(400).json({ msg: "Email and OTP are required." });
    }

    const user = await User.findOne({ email: identifier });
    if (!user || !user.resetOtp || !user.resetOtpExpires) {
      return res.status(400).json({ msg: "Invalid or expired OTP." });
    }

    if (user.resetOtpExpires.getTime() < Date.now()) {
      return res.status(400).json({ msg: "OTP has expired. Please request a new one." });
    }

    // optional: track attempts
    user.resetOtpAttempts = (user.resetOtpAttempts || 0) + 1;
    if (user.resetOtpAttempts > 5) {
      return res.status(400).json({
        msg: "Too many wrong attempts. Please request a new OTP.",
      });
    }

    if (user.resetOtp !== otp) {
      await user.save(); // save attempts increment
      return res.status(400).json({ msg: "Incorrect OTP." });
    }

    // OTP is correct – mark as verified with a short token for reset step
    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetOtpToken = resetToken;
    await user.save();

    return res.json({
      msg: "OTP verified. You can now reset your password.",
      resetToken,
    });
  } catch (err) {
    console.error("verify-reset-otp error:", err);
    return res.status(500).json({
      msg: "Server error while verifying OTP.",
      error: err.message,
    });
  }
});

/**
 * POST /api/auth/reset-password
 * body: { identifier, resetToken, newPassword }
 */
router.post("/reset-password", async (req, res) => {
  try {
    const { identifier, resetToken, newPassword } = req.body;

    if (!identifier || !resetToken || !newPassword) {
      return res
        .status(400)
        .json({ msg: "Email, token and new password are required." });
    }

    const user = await User.findOne({ email: identifier });
    if (!user || !user.resetOtpToken || user.resetOtpToken !== resetToken) {
      return res.status(400).json({ msg: "Invalid reset token." });
    }

    const bcrypt = require("bcryptjs");
    user.passwordHash = await bcrypt.hash(newPassword, 10);

    // clear OTP data
    user.resetOtp = undefined;
    user.resetOtpExpires = undefined;
    user.resetOtpAttempts = undefined;
    user.resetOtpToken = undefined;

    await user.save();

    return res.json({ msg: "Password has been reset successfully." });
  } catch (err) {
    console.error("reset-password error:", err);
    return res
      .status(500)
      .json({ msg: "Server error while resetting password.", error: err.message });
  }
});

module.exports = router;

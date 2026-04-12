// src/pages/VerifyOtp.jsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();

  // Email/identifier passed from ForgotOtp page
  const passedIdentifier = location.state?.identifier || "";
  const [identifier, setIdentifier] = useState(passedIdentifier);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg(null);

    if (!identifier || !otp || !newPassword) {
      setMsg({
        type: "error",
        text: "Please fill email, OTP and new password.",
      });
      return;
    }

    setLoading(true);
    try {
      // 1) VERIFY OTP
      const verifyRes = await api.post("/api/auth/verify-reset-otp", {
        identifier,
        otp,
      });

      const resetToken = verifyRes.data?.resetToken;
      if (!resetToken) {
        throw new Error("No reset token returned from server.");
      }

      // 2) RESET PASSWORD
      await api.post("/api/auth/reset-password", {
        identifier,
        resetToken,
        newPassword,
      });

      setMsg({
        type: "success",
        text: "Password reset successfully. You can now log in.",
      });

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      console.error(err);
      const text =
        err?.response?.data?.msg ||
        err?.message ||
        "Verification failed. Please check the code.";
      setMsg({ type: "error", text });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-slate-100">
      <div className="w-full max-w-md bg-white border shadow-lg rounded-xl border-slate-200">
        <div className="h-1.5 w-full bg-blue-900" />

        <div className="p-8">
          <div className="mb-6 text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 text-blue-700 rounded-full bg-blue-50">
              ✅
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              Verify & Reset
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Enter the OTP sent to{" "}
              <span className="font-semibold">
                {passedIdentifier || "your email"}
              </span>{" "}
              and choose a new password.
            </p>
          </div>

          {msg && (
            <div
              className={`mb-4 p-3 text-sm border-l-4 rounded-r ${
                msg.type === "success"
                  ? "border-green-600 bg-green-50 text-green-800"
                  : "border-red-600 bg-red-50 text-red-800"
              }`}
            >
              {msg.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email (read-only if passed from previous page) */}
            <div>
              <label className="block mb-1 text-sm font-semibold text-slate-700">
                Registered Email
              </label>
              <input
                type="email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                readOnly={!!passedIdentifier}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded text-sm text-slate-900 focus:ring-1 focus:ring-blue-800 focus:border-blue-800 outline-none"
              />
            </div>

            {/* OTP */}
            <div>
              <label className="block mb-1 text-sm font-semibold text-slate-700">
                OTP Code
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                maxLength={6}
                placeholder="Enter 6-digit OTP"
                className="w-full px-3 py-2.5 bg-gray-50 border border-slate-300 rounded text-sm text-slate-900 focus:ring-1 focus:ring-blue-800 focus:border-blue-800 outline-none tracking-[0.3em]"
              />
            </div>

            {/* New Password */}
            <div>
              <label className="block mb-1 text-sm font-semibold text-slate-700">
                New Password
              </label>
              <input
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Enter new secure password"
                className="w-full pl-3 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded text-sm text-gray-900 focus:ring-1 focus:ring-blue-800 focus:border-blue-800 outline-none"
              />
              <p className="mt-1 text-xs text-slate-500">
                Minimum 8 characters recommended.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white text-sm font-semibold rounded shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Verifying..." : "Verify OTP & Reset Password"}
            </button>
          </form>

          <button
            onClick={() => navigate("/login")}
            className="w-full mt-6 text-xs text-center text-blue-800 hover:underline"
          >
            ← Return to Login Page
          </button>
        </div>

        <div className="px-8 py-3 border-t border-slate-100 bg-slate-50 text-[11px] text-center text-slate-500">
          © 2025 Official E-Voting Portal. All rights reserved.
        </div>
      </div>
    </div>
  );
}

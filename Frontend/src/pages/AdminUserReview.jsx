import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import {
  ArrowLeft,
  FileText,
  CheckCircle,
  XCircle,
  Loader2,
  ShieldAlert,
  User,
  Mail,
  Phone,
  CreditCard
} from "lucide-react";

export default function AdminUserReview() {
  const { id } = useParams(); // userId from URL
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    async function load() {
      setLoading(true);
      setMsg(null);
      try {
        // ensure current user is admin (same as AdminPanel logic)
        const me = await api.get("/api/auth/me");
        if (me.data.user.role !== "admin") {
          navigate("/dashboard");
          return;
        }

        const res = await api.get(`/api/admin/users/${id}`);
        setUser(res.data.user);
      } catch (err) {
        console.error(err);
        if (err?.response?.status === 401) {
          navigate("/login");
          return;
        }
        setMsg({
          type: "error",
          text: err?.response?.data?.msg || err.message,
        });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, navigate]);

  async function handleVerify(action) {
    if (!window.confirm(`Are you sure to ${action} this user?`)) return;
    setMsg(null);
    try {
      await api.post(`/api/auth/admin/verify/${id}`, { action });
      setMsg({
        type: "success",
        text: `User ${
          action === "approve" ? "approved" : "rejected"
        } successfully.`,
      });
      // optional: go back to admin panel after a short delay
      setTimeout(() => navigate("/admin"), 800);
    } catch (err) {
      console.error(err);
      setMsg({
        type: "error",
        text: err?.response?.data?.msg || err.message,
      });
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f0f] flex items-center justify-center">
        <div className="flex items-center gap-2 text-[#0B2447] dark:text-yellow-400 font-semibold animate-pulse">
          <Loader2 className="animate-spin" /> Loading KYC details...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f0f] flex items-center justify-center text-gray-500">
        User not found.
      </div>
    );
  }

  const docUrl = user.idDocPath ? `${API_BASE}${user.idDocPath}` : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f0f] p-4 md:p-8 font-sans transition-colors duration-200">
      {/* Container width set to 1400px */}
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* --- HEADER --- */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-md border-l-4 border-[#0B2447] dark:border-yellow-400 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors duration-200">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center text-2xl font-bold text-gray-500 bg-gray-100 border border-gray-200 rounded-full w-14 h-14 dark:bg-zinc-800 dark:border-zinc-700">
              {user.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                KYC Review
              </h1>
              <p className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                 Reviewing application for <span className="font-semibold text-[#0B2447] dark:text-yellow-400">{user.name}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate("/admin")}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 dark:bg-yellow-400 dark:text-black dark:hover:bg-yellow-300"
          >
            <ArrowLeft size={16} /> Back to Admin Console
          </button>
        </div>

        {/* --- MESSAGE ALERT --- */}
        {msg && (
          <div
            className={`p-4 rounded-lg flex items-center gap-2 border-l-4 text-sm shadow-sm ${
              msg.type === "success"
                ? "bg-green-50 text-green-800 border-green-500 dark:bg-green-900/20 dark:text-green-400"
                : "bg-red-50 text-red-800 border-red-500 dark:bg-red-900/20 dark:text-red-400"
            }`}
          >
            {msg.type === "error" ? (
              <ShieldAlert size={18} />
            ) : (
              <CheckCircle size={18} />
            )}
            {msg.text}
          </div>
        )}

        {/* --- MAIN GRID --- */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          
          {/* LEFT COLUMN: User Info Card */}
          <div className="lg:col-span-1 bg-white dark:bg-[#1a1a1a] rounded-xl shadow-md border border-gray-200 dark:border-zinc-800 p-6 flex flex-col transition-colors duration-200 h-fit">
            <div className="flex items-center gap-2 pb-4 mb-4 border-b border-gray-100 dark:border-zinc-800 text-[#0B2447] dark:text-yellow-400">
              <FileText size={20} /> 
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">Citizen Details</h2>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-gray-50 dark:bg-[#111] rounded-lg border border-gray-100 dark:border-zinc-800">
                <div className="flex items-center gap-2 mb-1 text-xs font-bold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                   <User size={12} /> Full Name
                </div>
                <div className="pl-5 text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-[#111] rounded-lg border border-gray-100 dark:border-zinc-800">
                <div className="flex items-center gap-2 mb-1 text-xs font-bold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                   <Mail size={12} /> Email Address
                </div>
                <div className="pl-5 text-sm font-medium text-gray-900 dark:text-white">{user.email}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 dark:bg-[#111] rounded-lg border border-gray-100 dark:border-zinc-800">
                  <div className="mb-1 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    ID Type
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{user.idType || "N/A"}</div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-[#111] rounded-lg border border-gray-100 dark:border-zinc-800">
                  <div className="mb-1 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    ID Number
                  </div>
                  <div className="font-mono text-sm text-gray-900 dark:text-white">{user.idNumber || "N/A"}</div>
                </div>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-[#111] rounded-lg border border-gray-100 dark:border-zinc-800">
                <div className="flex items-center gap-2 mb-1 text-xs font-bold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                   <Phone size={12} /> Phone
                </div>
                <div className="pl-5 text-sm font-medium text-gray-900 dark:text-white">
                  {user.phone ? `+91 ${user.phone}` : "Not set"}
                </div>
              </div>

              <div className="pt-2">
                <div className="mb-2 text-xs font-bold text-gray-500 uppercase dark:text-gray-400">Current Status</div>
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                    user.verificationStatus === "approved"
                      ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
                      : user.verificationStatus === "rejected"
                      ? "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
                      : "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800"
                  }`}
                >
                  {user.verificationStatus === 'approved' && <CheckCircle size={12} />}
                  {user.verificationStatus === 'rejected' && <XCircle size={12} />}
                  {(!user.verificationStatus || user.verificationStatus === 'pending') && <ShieldAlert size={12} />}
                  {user.verificationStatus || "pending"}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-6 mt-6 border-t border-gray-100 dark:border-zinc-800">
              <button
                onClick={() => handleVerify("approve")}
                className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm transition-colors"
              >
                <CheckCircle size={16} /> Approve
              </button>
              <button
                onClick={() => handleVerify("reject")}
                className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors"
              >
                <XCircle size={16} /> Reject
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Document Preview */}
          <div className="lg:col-span-2 bg-white dark:bg-[#1a1a1a] rounded-xl shadow-md border border-gray-200 dark:border-zinc-800 p-6 flex flex-col transition-colors duration-200 min-h-[500px]">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100 dark:border-zinc-800">
              <div className="flex items-center gap-2 text-[#0B2447] dark:text-yellow-400">
                 <CreditCard size={20} />
                 <h2 className="text-lg font-bold text-gray-800 dark:text-white">ID Document Preview</h2>
              </div>
              {docUrl && (
                <a href={docUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">  Open in New Tab
                </a>
              )}
            </div>

            {docUrl ? (
              <div className="flex-1 w-full bg-gray-100 dark:bg-[#111] rounded-lg border border-gray-200 dark:border-zinc-700 overflow-hidden relative">
                <iframe
                  title="ID Document"
                  src={docUrl}
                  className="absolute inset-0 w-full h-full"
                />
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-[#111] rounded-lg border border-dashed border-gray-300 dark:border-zinc-700 text-gray-400 dark:text-gray-600">
                <FileText size={48} className="mb-2 opacity-50" />
                <p className="text-sm font-medium">No document uploaded for this user.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, User, Camera, Lock, LogOut, Trash2, FileText, Save, 
  Loader2, AlertCircle, CheckCircle, Clock, XCircle, Shield, Phone, 
  MapPin, Calendar, CreditCard, ShieldCheck, Mail, CheckCircle2 ,Fingerprint
} from "lucide-react";

// Helper Component for Inputs
const InputGroup = ({ label, value, icon, disabled, type = "text", placeholder, className = "", onChange, name }) => (
  <div className={`space-y-1.5 ${className}`}>
      <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</label>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-500 group-focus-within:text-yellow-600 dark:group-focus-within:text-yellow-500 transition-colors">
           {icon}
        </div>
        <input 
           type={type}
           name={name}
           value={value}
           onChange={onChange}
           placeholder={placeholder}
           disabled={disabled}
           className={`w-full bg-gray-50 dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-800 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-yellow-500 dark:focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/10 transition-all text-sm font-medium ${
             disabled ? 'opacity-70 cursor-not-allowed' : ''
           }`}
        />
      </div>
  </div>
);

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');

  const [pwdForm, setPwdForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);       // avatar / delete / password
  const [phoneDraft, setPhoneDraft] = useState(""); // new phone input
  const [phoneBusy, setPhoneBusy] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await api.get("/api/auth/me");
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
  }, [navigate]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setMsg(null);
    try {
      const fd = new FormData();
      fd.append("avatar", file);
      const res = await api.post("/api/auth/avatar", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser((u) => ({ ...u, avatarUrl: res.data.avatarUrl }));
      setMsg({ type: "success", text: res.data.msg });
    } catch (err) {
      console.error(err);
      setMsg({
        type: "error",
        text: err?.response?.data?.msg || err.message,
      });
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMsg(null);

    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setMsg({ type: "error", text: "New passwords do not match" });
      return;
    }

    setBusy(true);
    try {
      const res = await api.post("/api/auth/change-password", {
        currentPassword: pwdForm.currentPassword,
        newPassword: pwdForm.newPassword,
      });
      setMsg({ type: "success", text: res.data.msg });
      setPwdForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      console.error(err);
      setMsg({
        type: "error",
        text: err?.response?.data?.msg || err.message,
      });
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteAccount = async () => {
    const password = window.prompt(
      "Enter your password to confirm account deletion:"
    );
    if (!password) return;

    if (!window.confirm("Are you sure? This cannot be undone.")) return;

    setBusy(true);
    setMsg(null);
    try {
      const res = await api.delete("/api/auth/delete-account", {
        data: { password },
      });
      setMsg({ type: "success", text: res.data.msg });

      localStorage.removeItem("token");
      navigate("/login");
    } catch (err) {
      console.error(err);
      setMsg({
        type: "error",
        text: err?.response?.data?.msg || err.message,
      });
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleSavePhone = async () => {
    if (!phoneDraft.trim()) {
      setMsg({ type: "error", text: "Please enter a phone number." });
      return;
    }

    setPhoneBusy(true);
    setMsg(null);
    try {
      const res = await api.post("/api/auth/phone", {
        phone: phoneDraft.trim(),
      });
      setUser((u) => ({ ...u, phone: phoneDraft.trim() }));
      setPhoneDraft("");
      setMsg({ type: "success", text: res.data.msg || "Phone number saved." });
    } catch (err) {
      console.error(err);
      setMsg({
        type: "error",
        text: err?.response?.data?.msg || err.message,
      });
    } finally {
      setPhoneBusy(false);
    }
  };

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f0f] flex items-center justify-center">
       <div className="flex items-center gap-2 text-[#0B2447] dark:text-yellow-400 font-semibold animate-pulse">
         <Loader2 className="animate-spin" /> Loading Profile...
       </div>
    </div>
  );

  if (!user) return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f0f] flex items-center justify-center text-gray-500">
      User not found.
    </div>
  );

  const avatarSrc = user.avatarUrl ? `${import.meta.env.VITE_API_URL || "http://localhost:5000"}${user.avatarUrl}` : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f0f] pb-20 transition-colors duration-500 font-sans">

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container px-4 mx-auto  max-w-[1400px] mt-8"
      >
        
        {/* --- Hero Profile Header --- */}
        <motion.div variants={itemVariants} className="relative mb-8 group">
           {/* Cover Image */}
           <div className="relative h-48 overflow-hidden shadow-lg md:h-64 rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              
              {/* Decorative Shapes */}
              <div className="absolute w-32 h-32 rounded-full top-10 left-10 bg-white/10 blur-3xl"></div>
              <div className="absolute w-64 h-64 rounded-full bottom-10 right-10 bg-yellow-500/20 blur-3xl"></div>

              <button className="absolute flex items-center gap-2 p-2 text-xs font-medium text-white transition-all border rounded-lg bottom-4 right-4 bg-black/30 hover:bg-black/50 backdrop-blur-md border-white/10">
                 <Camera size={14} /> Change Cover
              </button>
           </div>

           {/* Profile Info Overlay */}
           <div className="relative flex flex-col items-end gap-6 px-6 -mt-16 md:px-10 md:-mt-20 md:flex-row">
              
              {/* Avatar */}
              <div className="relative group/avatar">
                 <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white dark:border-[#121212] bg-gray-100 dark:bg-[#1a1a1a] p-1 shadow-2xl overflow-hidden relative">
                    <div className="flex items-center justify-center w-full h-full overflow-hidden rounded-full bg-gradient-to-br from-yellow-400 to-orange-500">
                       {avatarSrc ? (
                         <img src={avatarSrc} alt="avatar" className="object-cover w-full h-full" />
                       ) : (
                         <User size={64} className="text-white drop-shadow-md" />
                       )}
                    </div>
                    
                    {/* Hover Overlay for Upload */}
                    <label className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center cursor-pointer backdrop-blur-[2px]">
                       {busy ? <Loader2 size={24} className="text-white animate-spin" /> : <Camera size={24} className="text-white" />}
                       <input
                         type="file"
                         accept="image/*"
                         className="hidden"
                         onChange={handleAvatarChange}
                         disabled={busy}
                       />
                    </label>
                 </div>
                 {/* Online Status */}
                 <div className="absolute bottom-4 right-2 w-5 h-5 bg-green-500 border-4 border-white dark:border-[#121212] rounded-full shadow-sm" title="Online"></div>
              </div>

              {/* Name & Role */}
              <div className="flex-1 pb-2 text-center md:text-left">
                 <div className="flex flex-col gap-2 mb-1 md:flex-row md:items-center md:gap-4">
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">{user.name}</h1>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                        user.verificationStatus === 'approved' ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-400' :
                        user.verificationStatus === 'rejected' ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400' :
                        'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-400'
                    }`}>
                       {user.verificationStatus === 'approved' && <CheckCircle2 size={12} />}
                       {user.verificationStatus === 'rejected' && <XCircle size={12} />}
                       {(!user.verificationStatus || user.verificationStatus === 'pending') && <Clock size={12} />}
                       <span className="capitalize">{user.verificationStatus || 'Pending'}</span>
                    </span>
                 </div>
                 <p className="flex items-center justify-center gap-2 font-medium text-gray-500 dark:text-gray-400 md:justify-start">
                   <span className="flex items-center gap-1 capitalize">{user.role === 'admin' && <Shield size={14} className="text-red-500"/>} {user.role}</span>
                   <span className="w-1 h-1 bg-gray-300 rounded-full dark:bg-gray-700"></span>
                   <span className="truncate">{user.email}</span>
                 </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center w-full gap-3 pb-2 md:w-auto md:justify-end">
                 <button 
                   onClick={() => navigate("/my-votes")}
                   className="px-6 py-2.5 rounded-xl bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold text-sm shadow-sm hover:bg-gray-50 dark:hover:bg-[#222] transition-all flex items-center gap-2"
                 >
                   <FileText size={16} /> My Votes
                 </button>
              </div>
           </div>
        </motion.div>

        {/* MESSAGES */}
        {msg && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-xl flex items-center gap-2 border-l-4 shadow-sm ${
              msg.type === "success"
                ? "bg-green-50 text-green-800 border-green-500 dark:bg-green-900/20 dark:text-green-400"
                : "bg-red-50 text-red-800 border-red-500 dark:bg-red-900/20 dark:text-red-400"
            }`}
          >
            {msg.type === "error" ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
            {msg.text}
          </motion.div>
        )}

        {/* --- Content Grid --- */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
           
           {/* Left Column: Navigation & Mini Stats */}
           <motion.div variants={itemVariants} className="space-y-6">
              
              {/* Menu Card */}
              <div className="bg-white dark:bg-[#151515] rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
                 <div className="p-2">
                    <button 
                      onClick={() => setActiveTab('details')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        activeTab === 'details' 
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold' 
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] font-medium'
                      }`}
                    >
                       <User size={18} /> Personal Details
                    </button>
                    <button 
                      onClick={() => setActiveTab('security')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        activeTab === 'security' 
                          ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 font-bold' 
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] font-medium'
                      }`}
                    >
                       <ShieldCheck size={18} /> Security & Login
                    </button>
                 </div>
              </div>

              {/* Digital ID Preview Card */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-[#1a1a1a] dark:to-black rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-32 h-32 transition-colors rounded-full bg-white/5 blur-3xl group-hover:bg-white/10"></div>
                 
                 <div className="relative z-10 flex items-start justify-between mb-6">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Emblem" className="w-auto h-8 invert opacity-80" />
                    <Fingerprint size={32} className="text-white/20" />
                 </div>
                 
                 <div className="relative z-10 mb-6 space-y-1">
                    <p className="text-[10px] uppercase tracking-widest opacity-60">Digital Voter ID</p>
                    <p className="font-mono text-lg tracking-wider text-yellow-500">{user.idNumber || "Not Issued"}</p>
                 </div>

                 <div className="relative z-10 flex items-end justify-between">
                    <div>
                       <p className="text-[10px] uppercase tracking-widest opacity-60">Holder</p>
                       <p className="text-sm font-bold">{user.name}</p>
                    </div>
                    <div className="h-8 w-8 rounded bg-white p-0.5">
                       <div className="w-full h-full bg-black"></div> {/* QR Placeholder */}
                    </div>
                 </div>
              </div>

           </motion.div>

           {/* Right Column: Main Content */}
           <motion.div variants={itemVariants} className="lg:col-span-2">
              <AnimatePresence mode="wait">
                 {activeTab === 'details' ? (
                   <motion.div 
                     key="details"
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: -20 }}
                     className="bg-white dark:bg-[#151515] rounded-2xl border border-gray-200 dark:border-gray-800 p-6 md:p-8 shadow-sm"
                   >
                      <div className="flex items-center justify-between mb-8">
                         <h2 className="text-xl font-bold text-gray-900 dark:text-white">Personal Information</h2>
                      </div>

                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                         <InputGroup label="Full Name" value={user.name} icon={<User size={18} />} disabled={true} />
                         <InputGroup label="Email Address" value={user.email} icon={<Mail size={18} />} disabled={true} />
                         
                         {/* Phone Logic */}
                         <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Phone Number</label>
                            {user.phone ? (
                               <div className="w-full bg-gray-50 dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-800 rounded-xl py-3 pl-4 pr-4 flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                     <Phone size={18} className="text-gray-400" />
                                     <span className="text-sm font-medium">{user.phone}</span>
                                  </div>
                                  <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1"><CheckCircle size={10} /> Verified</span>
                               </div>
                            ) : (
                               <div className="flex gap-2">
                                  <div className="relative flex-1">
                                     <Phone size={18} className="absolute text-gray-400 top-3 left-3" />
                                     <input 
                                       type="tel"
                                       value={phoneDraft}
                                       onChange={(e) => setPhoneDraft(e.target.value)}
                                       placeholder="Enter phone number"
                                       className="w-full bg-white dark:bg-[#111] border border-gray-300 dark:border-gray-700 rounded-lg py-2.5 pl-10 pr-3 text-sm focus:ring-2 focus:ring-yellow-500 outline-none"
                                       disabled={phoneBusy}
                                     />
                                  </div>
                                  <button 
                                    onClick={handleSavePhone}
                                    disabled={phoneBusy}
                                    className="bg-[#0B2447] dark:bg-yellow-400 text-white dark:text-black px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap hover:opacity-90"
                                  >
                                    {phoneBusy ? <Loader2 size={14} className="animate-spin" /> : "Save"}
                                  </button>
                               </div>
                            )}
                         </div>

                         <InputGroup label="Date of Birth" value={user.dob ? new Date(user.dob).toLocaleDateString("en-IN") : "Not set"} icon={<Calendar size={18} />} disabled={true} />
                         
                         <div className="pt-4 border-t border-gray-100 md:col-span-2 dark:border-gray-800">
                            <h3 className="flex items-center gap-2 mb-4 text-sm font-bold text-gray-900 dark:text-white">
                              <CreditCard size={16} className="text-gray-400" /> Identity Documents
                            </h3>
                            <div className="flex gap-4">
                               <div className="flex-1 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1a1a1a] flex items-center justify-between">
                                  <div>
                                     <p className="text-xs font-bold text-gray-500 uppercase dark:text-gray-400">Document Type</p>
                                     <p className="font-medium text-gray-900 dark:text-white">{user.idType || "N/A"}</p>
                                  </div>
                                  <ShieldCheck size={20} className="text-green-500" />
                               </div>
                               <div className="flex-1 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1a1a1a]">
                                  <p className="text-xs font-bold text-gray-500 uppercase dark:text-gray-400">Document Number</p>
                                  <p className="font-mono font-medium tracking-wide text-gray-900 dark:text-white">
                                    {user.idNumber ? `XXXX-XXXX-${user.idNumber.slice(-4)}` : "Not provided"}
                                  </p>
                               </div>
                            </div>
                         </div>
                      </div>
                   </motion.div>
                 ) : (
                   <motion.div 
                     key="security"
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: -20 }}
                     className="space-y-6"
                   >
                      {/* Password Change Card */}
                      <div className="bg-white dark:bg-[#151515] rounded-2xl border border-gray-200 dark:border-gray-800 p-6 md:p-8 shadow-sm">
                         <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">Change Password</h2>
                         <form onSubmit={handleChangePassword} className="max-w-lg space-y-4">
                            <InputGroup 
                              label="Current Password" 
                              value={pwdForm.currentPassword}
                              onChange={(e) => setPwdForm({...pwdForm, currentPassword: e.target.value})}
                              icon={<Lock size={18} />} 
                              type="password" 
                              placeholder="••••••••"
                            />
                            <InputGroup 
                              label="New Password" 
                              value={pwdForm.newPassword}
                              onChange={(e) => setPwdForm({...pwdForm, newPassword: e.target.value})}
                              icon={<Lock size={18} />} 
                              type="password" 
                              placeholder="New password"
                            />
                            <InputGroup 
                              label="Confirm Password" 
                              value={pwdForm.confirmPassword}
                              onChange={(e) => setPwdForm({...pwdForm, confirmPassword: e.target.value})}
                              icon={<Lock size={18} />} 
                              type="password" 
                              placeholder="Confirm new password"
                            />
                            
                            <button 
                              type="submit" 
                              disabled={busy}
                              className="px-6 py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-sm shadow-lg shadow-yellow-500/20 transition-all flex items-center gap-2 mt-4"
                            >
                              {busy ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                              {busy ? "Updating..." : "Update Password"}
                            </button>
                         </form>
                      </div>

                      {/* Danger Zone */}
                      <div className="p-6 border border-red-100 bg-red-50 dark:bg-red-900/10 rounded-2xl dark:border-red-900/30 md:p-8">
                         <h2 className="flex items-center gap-2 mb-2 text-lg font-bold text-red-700 dark:text-red-400">
                           <AlertCircle size={20} /> Danger Zone
                         </h2>
                         <p className="mb-6 text-sm text-red-600/80 dark:text-red-400/60">
                           Permanently remove your account and all associated data from the E-Voting platform. This action cannot be undone.
                         </p>
                         <button 
                           onClick={handleDeleteAccount}
                           className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-colors flex items-center gap-2"
                         >
                           <Trash2 size={16} /> Delete Account
                         </button>
                      </div>
                   </motion.div>
                 )}
              </AnimatePresence>
           </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
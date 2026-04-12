import React, { useEffect, useRef, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { loadTurnstileScript } from "../utils/loadTurnstile";
import { motion } from 'framer-motion';
import { 
  Sun, Moon, ArrowLeft, ShieldCheck, Check, Loader2, KeyRound, 
  Lock, AlertCircle, RefreshCw, Send, Mail, MessageSquare 
} from 'lucide-react';
import { useTheme } from "../context/ThemeContext";

// Simulated Recovery Logs for Right Panel
const RECOVERY_LOGS = [
  { id: 1, text: "Initiating recovery protocol...", type: "info" },
  { id: 2, text: "Scanning identity database...", type: "warning" },
  { id: 3, text: "User record located.", type: "success" },
  { id: 4, text: "Verifying backup contact methods...", type: "info" },
  { id: 5, text: "Generating One-Time Password (OTP)...", type: "info" },
  { id: 6, text: "Encrypting transmission channel...", type: "success" },
  { id: 7, text: "Waiting for user verification...", type: "warning" },
];

export default function ForgotOtp() {
  const [form, setForm] = useState({
    identifier: "",
    via: "email",
    turnstile: "",
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [currentLogIndex, setCurrentLogIndex] = useState(0);

  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme(); // Uses shared Theme Context

  const widgetRef = useRef(null);
  const widgetIdRef = useRef(null);

  // Auto-scroll logs logic
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLogIndex((prev) => (prev + 1) % RECOVERY_LOGS.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  // Load + render Turnstile
  useEffect(() => {
    const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
    if (!siteKey) return;

    let mounted = true;

    loadTurnstileScript()
      .then(() => {
        if (!mounted) return;
        if (!window.turnstile || !widgetRef.current) return;

        if (widgetIdRef.current) window.turnstile.remove(widgetIdRef.current);

        widgetIdRef.current = window.turnstile.render(widgetRef.current, {
          sitekey: siteKey,
          theme: isDarkMode ? 'dark' : 'light',
          callback: (token) => setForm((s) => ({ ...s, turnstile: token })),
          "error-callback": () => setForm((s) => ({ ...s, turnstile: "" })),
          "expired-callback": () => setForm((s) => ({ ...s, turnstile: "" })),
        });
      })
      .catch((err) => console.error("Turnstile load error:", err));

    return () => {
      mounted = false;
      try {
        if (window.turnstile && widgetIdRef.current !== null) {
          window.turnstile.remove(widgetIdRef.current);
        }
      } catch (e) {}
    };
  }, [isDarkMode]);

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg(null);

    const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
    if (siteKey && !form.turnstile) {
      setMsg({
        type: "error",
        text: "Please complete the human verification.",
      });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        identifier: form.identifier,
        via: form.via,
        turnstile: form.turnstile,
      };

      const res = await api.post("/api/auth/request-reset-otp", payload);

      setMsg({
        type: "success",
        text: res.data?.msg || "If that account exists, you will receive an OTP shortly.",
      });

      // Navigate to Verify OTP page
      setTimeout(() => {
          navigate("/verify-otp", {
            state: {
              identifier: form.identifier,
              via: form.via,
            },
          });
      }, 1500);

    } catch (err) {
      console.error(err);
      const text = err?.response?.data?.msg || err?.message || "Unable to process request. Please try again later.";
      setMsg({ type: "error", text });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex w-full min-h-screen bg-gray-50 dark:bg-[#050505] overflow-hidden transition-colors duration-500 font-sans">
      
      {/* --- LEFT PANEL: Form --- */}
      <div className="w-full lg:w-[45%] xl:w-[40%] flex flex-col justify-center px-6 md:px-12 lg:px-16 xl:px-24 py-12 relative z-20 bg-white dark:bg-[#0a0a0a] border-r border-gray-200 dark:border-gray-900/50 shadow-2xl lg:shadow-none transition-colors duration-500">
         
         {/* Theme Toggle */}
         <div className="absolute z-50 top-6 right-6">
            <button 
              onClick={toggleTheme}
              className="p-2.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-all hover:scale-105 active:scale-95 shadow-sm border border-gray-200 dark:border-gray-700"
            >
               {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
         </div>

         {/* Background pattern */}
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-gray-50 via-white to-white dark:from-gray-900/20 dark:via-[#050505] dark:to-[#050505] pointer-events-none opacity-50"></div>

         <div className="relative z-10 w-full max-w-md mx-auto space-y-8">
            
            {/* Back Link */}
            <motion.button
               initial={{ opacity: 0, x: -10 }}
               animate={{ opacity: 1, x: 0 }}
               onClick={() => navigate("/login")}
               className="flex items-center gap-2 text-sm font-bold text-gray-500 transition-colors dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-500 group"
            >
               <div className="p-1 transition-colors bg-gray-100 rounded-full dark:bg-gray-800 group-hover:bg-yellow-100 dark:group-hover:bg-yellow-900/30">
                 <ArrowLeft size={16} />
               </div>
               Back to Login
            </motion.button>

            {/* Header */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="flex items-center justify-center w-12 h-12 mb-6 text-yellow-600 bg-yellow-100 border border-yellow-200 rounded-2xl dark:bg-yellow-500/10 dark:text-yellow-500 dark:border-yellow-500/20">
                 <Lock size={24} />
              </div>
              <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-gray-900 dark:text-white">
                Password <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-500 dark:from-yellow-400 dark:to-orange-500">Recovery</span>
              </h1>
              <p className="mt-3 text-sm font-medium leading-relaxed text-gray-600 dark:text-gray-400">
                Enter your registered email and we'll send you a One-Time Password (OTP) to reset your access.
              </p>
            </motion.div>

            {/* Message Display */}
            {msg && (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg flex items-start gap-3 text-sm border-l-4 ${
                    msg.type === "success" 
                        ? "bg-green-50 text-green-800 border-green-600 dark:bg-green-900/20 dark:text-green-400" 
                        : "bg-red-50 text-red-800 border-red-600 dark:bg-red-900/20 dark:text-red-400"
                    }`}
                >
                    {msg.type === "success" ? <Check size={18} className="mt-0.5 shrink-0"/> : <AlertCircle size={18} className="mt-0.5 shrink-0"/>}
                    {msg.text}
                </motion.div>
            )}

            {/* Form */}
            <motion.form 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              onSubmit={handleSubmit} 
              className="space-y-6"
            >
              {/* Delivery Method Selection */}
              <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-500 dark:text-gray-500 uppercase tracking-wider">Select Delivery Method</label>
                  <div className="grid grid-cols-2 gap-4">
                     <button
                       type="button"
                       onClick={() => setForm(s => ({ ...s, via: 'email' }))}
                       className={`relative flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                         form.via === 'email' 
                           ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' 
                           : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-[#121212] text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700'
                       }`}
                     >
                        <Mail size={18} />
                        <span className="text-sm font-bold">Email</span>
                        {form.via === 'email' && <div className="absolute w-2 h-2 bg-blue-500 rounded-full top-2 right-2"></div>}
                     </button>
                     <button
                       type="button"
                       disabled
                       className="relative flex items-center justify-center gap-2 p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#151515] text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-70"
                     >
                        <MessageSquare size={18} />
                        <span className="text-sm font-bold">SMS</span>
                        <span className="absolute -top-2 -right-2 bg-gray-200 dark:bg-gray-700 text-[9px] px-1.5 py-0.5 rounded-full font-bold text-gray-500">SOON</span>
                     </button>
                  </div>
              </div>

              {/* Registered Email */}
              <div className="space-y-2 group">
                <label className="text-[11px] font-bold text-gray-500 dark:text-gray-500 uppercase tracking-wider group-focus-within:text-yellow-600 dark:group-focus-within:text-yellow-500 transition-colors">Registered Email Address</label>
                <div className="relative">
                   <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 transition-colors pointer-events-none dark:text-gray-600 group-focus-within:text-yellow-600 dark:group-focus-within:text-yellow-500">
                      <Mail size={18} />
                   </div>
                   <input 
                      type="email" 
                      name="identifier"
                      value={form.identifier}
                      onChange={handleChange}
                      placeholder="your.email@example.com"
                      required
                      className="w-full bg-gray-50 dark:bg-[#121212] text-gray-900 dark:text-gray-200 border border-gray-200 dark:border-gray-800 rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/10 transition-all placeholder-gray-400 dark:placeholder-gray-700 text-sm font-medium shadow-inner"
                   />
                </div>
              </div>

              {/* Turnstile Widget */}
              <div className="flex justify-start my-4 min-h-[65px] bg-gray-50 dark:bg-[#121212] border border-gray-200 dark:border-gray-800 rounded-xl p-2">
                 <div ref={widgetRef} />
              </div>

              {/* Action Button */}
              <button 
                type="submit"
                disabled={loading}
                className={`w-full h-14 relative rounded-xl font-bold text-sm uppercase tracking-wider overflow-hidden transition-all duration-300 ${
                  loading ? 'bg-yellow-600 text-yellow-100 cursor-wait' :
                  'bg-yellow-500 hover:bg-yellow-400 text-black shadow-[0_4px_20px_rgba(234,179,8,0.2)] hover:shadow-[0_4px_25px_rgba(234,179,8,0.4)] hover:-translate-y-0.5'
                }`}
              >
                 <div className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? (
                       <>
                         <Loader2 size={18} className="animate-spin" /> Generating OTP...
                       </>
                    ) : (
                       <>
                         Generate OTP <Send size={18} />
                       </>
                    )}
                 </div>
              </button>
            </motion.form>
         </div>
      </div>

      {/* --- RIGHT PANEL: Visual Experience --- */}
      <div className="hidden lg:flex w-[55%] xl:w-[60%] relative bg-gray-100 dark:bg-[#020202] items-center justify-center p-12 overflow-hidden perspective-[2000px] transition-colors duration-500">
          
          {/* Animated Background Elements */}
          <div className="absolute inset-0 w-full h-full pointer-events-none">
             <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-blue-200/40 dark:bg-blue-900/10 rounded-full blur-[100px] animate-pulse-slow"></div>
             <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-purple-200/40 dark:bg-purple-900/10 rounded-full blur-[100px] animate-pulse-slow"></div>
             <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] opacity-40 dark:opacity-20"></div>
          </div>

          <div className="relative z-10 flex flex-col items-center w-full max-w-lg">
              
              {/* Key Recovery Animation */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="relative flex items-center justify-center mb-12 w-72 h-72"
              >
                 <div className="absolute inset-0 border-2 border-blue-300 border-dashed rounded-full dark:border-blue-900 animate-spin-slow"></div>
                 <div className="absolute border border-blue-200 rounded-full inset-8 dark:border-blue-800 animate-reverse-spin"></div>
                 
                 <motion.div 
                   animate={{ rotate: 360 }}
                   transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                   className="absolute inset-0"
                 >
                   <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-500 rounded-full blur-[2px] shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
                   <div className="absolute bottom-10 right-10 w-2 h-2 bg-purple-500 rounded-full blur-[2px]"></div>
                 </motion.div>

                 <div className="relative z-10 flex items-center justify-center p-8 border border-white shadow-2xl rounded-3xl bg-white/50 dark:bg-white/5 backdrop-blur-xl dark:border-white/10 group">
                    <div className="absolute inset-0 transition-opacity duration-500 opacity-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl group-hover:opacity-100"></div>
                    <KeyRound size={80} className="text-blue-600 dark:text-blue-500 drop-shadow-lg" strokeWidth={1.5} />
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 translate-x-[-150%] animate-shimmer"></div>
                 </div>
              </motion.div>

              {/* Live Recovery Log */}
              <div className="relative w-full h-40 p-5 overflow-hidden font-mono text-xs border border-gray-200 rounded-lg shadow-lg bg-white/60 dark:bg-black/50 dark:border-gray-800 backdrop-blur-sm">
                 <div className="flex items-center justify-between pb-2 mb-3 border-b border-gray-200 dark:border-gray-800">
                    <span className="flex items-center gap-2 font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                      <RefreshCw size={10} className="animate-spin" /> System Recovery Log
                    </span>
                    <div className="flex gap-1.5">
                       <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                       <span className="text-[10px] text-blue-600 dark:text-blue-500 font-bold">ACTIVE</span>
                    </div>
                 </div>
                 <div className="space-y-2.5 opacity-90">
                    {RECOVERY_LOGS.map((log, i) => {
                       if (i < currentLogIndex - 3 || i > currentLogIndex) return null;
                       const isLatest = i === currentLogIndex;
                       
                       return (
                         <motion.div 
                           key={i}
                           initial={{ opacity: 0, x: -10 }}
                           animate={{ opacity: 1, x: 0 }}
                           className={`flex gap-3 items-center ${
                              isLatest ? 'bg-blue-50 dark:bg-blue-900/10 -mx-2 px-2 py-1 rounded border-l-2 border-blue-500' : ''
                           }`}
                         >
                            <span className="text-[10px] opacity-40 font-mono">00:{10 + i}:42</span>
                            <span className={`flex-1 ${
                              log.type === 'success' ? 'text-green-600 dark:text-green-400' : 
                              log.type === 'warning' ? 'text-orange-600 dark:text-orange-400' : 'text-gray-600 dark:text-gray-300'
                            }`}>
                              {log.text}
                            </span>
                            {isLatest && <div className="w-1.5 h-3 bg-blue-500 animate-pulse"></div>}
                         </motion.div>
                       );
                    })}
                 </div>
              </div>

              <div className="mt-8 flex gap-4 text-[10px] text-gray-400 font-mono uppercase tracking-widest">
                 <div className="flex items-center gap-2">
                   <ShieldCheck size={12} /> Secure Connection
                 </div>
                 <div className="w-[1px] h-4 bg-gray-300 dark:bg-gray-800"></div>
                 <div className="flex items-center gap-2">
                   <AlertCircle size={12} /> 2FA Required
                 </div>
              </div>

          </div>
      </div>

    </div>
  );
};
import React, { useState, useRef, useEffect } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sun, Moon, User, Mail, Lock, Calendar, CreditCard, Upload, 
  Loader2, Eye, EyeOff, ShieldCheck, FileText, Scan, Binary, Fingerprint,
  Globe, ChevronDown
} from 'lucide-react';

// Import Shared Contexts
import { useTheme } from "../context/ThemeContext"; 
import { useLanguage } from "../context/LanguageContext"; 

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    dob: "",
    idType: "",
    idNumber: "",
  });

  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [idFile, setIdFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  // --- Shared Contexts ---
  const { isDarkMode, toggleTheme } = useTheme(); 
  const { lang, setLang, t, languages } = useLanguage(); 
  
  // --- Local State for UI ---
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langMenuRef = useRef(null);
  const navigate = useNavigate();

  // Close lang menu on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target)) {
        setIsLangMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === "name") {
      if (!/^[a-zA-Z\s]*$/.test(value)) {
        return; 
      }
    }
    
    if (name === "confirmPassword") {
      setConfirmPassword(value);
    } else {
      setForm((s) => ({ ...s, [name]: value }));
    }
  }

 async function handleSubmit(e) {
    e.preventDefault();

    // 1. Check for empty fields
    if (!form.name || !form.email || !form.password || !form.dob || !form.idType || !form.idNumber) {
        setMsg({ type: "error", text: t.fillRequired });
        return;
    }

    if (!idFile) {
        setMsg({ type: "error", text: t.uploadIdError });
        return;
    }

    // 2. Check Password Strength
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*[\d@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    
    if (!passwordRegex.test(form.password)) {
        setMsg({ 
            type: "error", 
            text: t.passwordStrengthError
        });
        return;
    }

    // 3. Check Passwords Match
    if (form.password !== confirmPassword) {
      setMsg({ type: "error", text: t.passwordMatchError });
      return;
    }

    setMsg(null);
    setLoading(true);

    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("email", form.email);
      fd.append("password", form.password);
      fd.append("dob", form.dob);
      fd.append("idType", form.idType);
      fd.append("idNumber", form.idNumber);
      if (idFile) fd.append("idDoc", idFile);

      const res = await api.post("/api/auth/register", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMsg({ type: "success", text: res.data.msg || t.regSuccess });
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      console.error(err);
      const text = err?.response?.data?.msg || err?.message || t.regFailed;
      setMsg({ type: "error", text });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex w-full min-h-screen bg-gray-50 dark:bg-[#050505] overflow-hidden transition-colors duration-500 font-sans">
      
      {/* --- LEFT PANEL: Visual Experience --- */}
      <div className="hidden lg:flex w-[50%] xl:w-[55%] relative bg-gray-100 dark:bg-[#020202] items-center justify-center p-12 overflow-hidden perspective-[2000px] transition-colors duration-500">
          
          {/* Animated Background Elements */}
          <div className="absolute inset-0 w-full h-full pointer-events-none">
             <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-yellow-200/40 dark:bg-yellow-600/5 rounded-full blur-[120px] animate-pulse-slow"></div>
             <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-200/40 dark:bg-blue-900/10 rounded-full blur-[120px] animate-pulse-slow"></div>
             <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] opacity-40 dark:opacity-20"></div>
          </div>

          {/* Holographic Identity Construction Animation */}
          <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-lg">
             
             <motion.div
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ 
                 opacity: 1, 
                 scale: 1,
                 y: [0, -20, 0],
                 rotateX: [5, 0, 5],
                 rotateY: [-5, 5, -5]
               }}
               transition={{ 
                 opacity: { duration: 0.8 },
                 scale: { duration: 0.8 },
                 y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
                 rotateX: { duration: 7, repeat: Infinity, ease: "easeInOut" },
                 rotateY: { duration: 8, repeat: Infinity, ease: "easeInOut" }
               }}
               className="relative w-[340px] h-[500px] bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/60 dark:border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden group"
             >
                {/* Glass Reflection */}
                <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-br from-white/40 via-transparent to-transparent dark:from-white/5"></div>
                
                {/* Scanning Laser Beam */}
                <motion.div 
                  animate={{ top: ['-20%', '120%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
                  className="absolute left-0 right-0 z-20 h-16 blur-md bg-gradient-to-b from-transparent via-yellow-500/30 to-transparent"
                />
                
                {/* Internal Grid Pattern */}
                <div className="absolute inset-0 opacity-10 dark:opacity-20 bg-[radial-gradient(#eab308_1px,transparent_1px)] [background-size:16px_16px]"></div>

                {/* Card Header */}
                <div className="relative z-10 flex items-center justify-between p-8 border-b border-gray-200 dark:border-white/10">
                   <div className="flex items-center justify-center w-10 h-10 border rounded-lg bg-yellow-500/10 border-yellow-500/20">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" className="w-6 h-6 opacity-80 dark:invert" alt="Emblem" />
                   </div>
                   <div className="text-[10px] font-mono font-bold text-gray-400 tracking-widest">DIGITAL_ID_GEN</div>
                </div>

                {/* Card Body - Profile Construction */}
                <div className="relative z-10 flex flex-col items-center justify-center flex-1 p-8 space-y-8">
                   {/* Avatar Placeholder with Scan Effect */}
                   <div className="relative flex items-center justify-center w-32 h-32 overflow-hidden border border-gray-300 rounded-full dark:border-white/10 bg-white/50 dark:bg-black/20">
                      <User size={48} className="text-gray-300 dark:text-gray-700" />
                      
                      {/* Scanning Box */}
                      <motion.div 
                         className="absolute inset-0 border-2 border-yellow-500 rounded-full opacity-50"
                         animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0, 0.5] }}
                         transition={{ duration: 2, repeat: Infinity }}
                      />
                      
                      <div className="absolute inset-0 flex items-center justify-center">
                         <Scan size={24} className="text-yellow-600 dark:text-yellow-500 animate-pulse" />
                      </div>
                   </div>

                   {/* Data Loading Bars */}
                   <div className="w-full space-y-4">
                      <div className="space-y-1">
                         <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase">
                           <span>Biometric Hash</span>
                           <span className="text-yellow-600 dark:text-yellow-500">Processing...</span>
                         </div>
                         <div className="h-1.5 bg-gray-200 dark:bg-white/10 rounded-full w-full overflow-hidden">
                           <motion.div 
                             animate={{ width: ["0%", "100%"] }} 
                             transition={{ duration: 2.5, repeat: Infinity }} 
                             className="h-full bg-yellow-500" 
                           />
                         </div>
                      </div>
                      
                      <div className="space-y-1">
                         <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase">
                           <span>Ledger Allocation</span>
                           <span className="text-blue-600 dark:text-blue-500">Syncing</span>
                         </div>
                         <div className="h-1.5 bg-gray-200 dark:bg-white/10 rounded-full w-full overflow-hidden">
                           <motion.div 
                             animate={{ width: ["0%", "80%"] }} 
                             transition={{ duration: 3, repeat: Infinity }} 
                             className="h-full bg-blue-500" 
                           />
                         </div>
                      </div>
                   </div>
                </div>

                {/* Card Footer */}
                <div className="relative z-10 flex justify-center gap-4 p-4 text-center text-gray-500 border-t border-gray-200 bg-gray-50/50 dark:bg-white/5 dark:border-white/10 font-mono text-[10px]">
                   <span className="flex items-center gap-1"><Lock size={10} /> ENCRYPTED</span>
                   <span className="flex items-center gap-1"><ShieldCheck size={10} /> SECURE</span>
                </div>
             </motion.div>

             {/* Floating Info Pods */}
             <motion.div 
               animate={{ x: [-10, 10, -10], y: [-5, 5, -5] }} 
               transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} 
               className="absolute gap-3 p-3 bg-white border border-gray-200 shadow-xl -left-4 top-1/3 dark:bg-[#151515] rounded-xl dark:border-gray-800 flex items-center z-20"
             >
                <div className="p-2 text-green-600 bg-green-100 rounded-lg dark:bg-green-500/20 dark:text-green-500"><Fingerprint size={18} /></div>
                <div>
                   <div className="text-[9px] font-bold text-gray-400 uppercase">Identity</div>
                   <div className="text-xs font-bold text-gray-900 dark:text-white">Unique</div>
                </div>
             </motion.div>

             <motion.div 
               animate={{ x: [10, -10, 10], y: [5, -5, 5] }} 
               transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }} 
               className="absolute gap-3 p-3 bg-white border border-gray-200 shadow-xl -right-4 bottom-1/3 dark:bg-[#151515] rounded-xl dark:border-gray-800 flex items-center z-20"
             >
                <div className="p-2 text-blue-600 bg-blue-100 rounded-lg dark:bg-blue-500/20 dark:text-blue-500"><Binary size={18} /></div>
                <div>
                   <div className="text-[9px] font-bold text-gray-400 uppercase">Encryption</div>
                   <div className="text-xs font-bold text-gray-900 dark:text-white">SHA-256</div>
                </div>
             </motion.div>

          </div>
      </div>

      {/* --- RIGHT PANEL: Registration Form --- */}
      <div className="w-full lg:w-[50%] xl:w-[45%] flex flex-col justify-center px-6 md:px-12 lg:px-16 py-8 relative z-20 bg-white dark:bg-[#0a0a0a] border-l border-gray-200 dark:border-gray-900/50 shadow-2xl lg:shadow-none transition-colors duration-500 overflow-y-auto">
         
         {/* Top Right Controls: Language & Theme */}
         <div className="absolute z-50 flex items-center gap-3 top-6 right-6">
            
            {/* Language Selector */}
            <div className="relative" ref={langMenuRef}>
                <button 
                    onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all border border-gray-200 dark:border-gray-700 text-xs font-semibold uppercase tracking-wide"
                >
                    <Globe size={16} />
                    <span>{(lang || 'en').toUpperCase()}</span>
                    <ChevronDown size={14} className={`transition-transform duration-300 ${isLangMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                    {isLangMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute right-0 mt-2 w-40 bg-white dark:bg-[#1a1a1a] rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden py-1 z-50"
                        >
                            {languages.map((l) => (
                                <button
                                    key={l.code}
                                    onClick={() => {
                                        setLang(l.code);
                                        setIsLangMenuOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between transition-colors ${
                                        lang === l.code 
                                        ? 'bg-yellow-50 dark:bg-yellow-900/10 text-yellow-600 dark:text-yellow-500 font-medium' 
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                                >
                                    <span>{l.name}</span>
                                    {lang === l.code && <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-all hover:scale-105 active:scale-95 shadow-sm border border-gray-200 dark:border-gray-700"
              title="Toggle Theme"
            >
               {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
         </div>

         {/* Subtle Background pattern */}
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-gray-50 via-white to-white dark:from-gray-900/20 dark:via-[#050505] dark:to-[#050505] pointer-events-none opacity-50"></div>

         <div className="relative z-10 w-full max-w-lg mx-auto space-y-6">
            {/* Header */}
            <motion.div 
              key={lang} // Re-animate text on language change
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 border rounded-full bg-yellow-50 dark:bg-yellow-500/10 border-yellow-200 dark:border-yellow-500/20 text-yellow-700 dark:text-yellow-500 text-[10px] font-bold uppercase tracking-widest">
                 <ShieldCheck size={12} /> {t.secureReg}
              </div>
              <h1 className="mb-2 text-3xl font-extrabold leading-tight tracking-tight text-gray-900 dark:text-white">
                {t.newUser} <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-500 dark:from-yellow-400 dark:to-orange-500">{t.registration}</span>
              </h1>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t.subtext}
              </p>
            </motion.div>

            {/* Error/Success Messages */}
            {msg && (
                <div
                    className={`p-3 text-sm font-medium border-l-4 rounded-r ${
                    msg.type === "success"
                        ? "bg-green-50 text-green-800 border-green-600 dark:bg-green-900/20 dark:text-green-400"
                        : "bg-red-50 text-red-800 border-red-600 dark:bg-red-900/20 dark:text-red-400"
                    }`}
                >
                    {msg.text}
                </div>
            )}

            {/* Form */}
            <motion.form 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              onSubmit={handleSubmit} 
              className="space-y-4"
            >
        
            {/* 1. Name Field */}
              <div className="space-y-1.5 group">
                <label className="text-[10px] font-bold text-gray-500 dark:text-gray-500 uppercase tracking-wider group-focus-within:text-yellow-600 dark:group-focus-within:text-yellow-500 transition-colors">{t.fullName}</label>
                <div className="relative">
                   <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 transition-colors pointer-events-none dark:text-gray-600 group-focus-within:text-yellow-600 dark:group-focus-within:text-yellow-500">
                      <User size={16} />
                   </div>
                   <input 
                      type="text" 
                      name="name" 
                      value={form.name}
                      onChange={handleChange}
                      placeholder={t.namePlaceholder}
                      required 
                      autoComplete="username"
                      pattern="[A-Za-z\s]+" 
                      title="Name should only contain letters and spaces"
                      className="w-full bg-gray-50 dark:bg-[#121212] text-gray-900 dark:text-gray-200 border border-gray-200 dark:border-gray-800 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all placeholder-gray-400 dark:placeholder-gray-700 text-sm font-medium"
                   />
                </div>
              </div>

              {/* 2. Email Field */}
              <div className="space-y-1.5 group">
                <label className="text-[10px] font-bold text-gray-500 dark:text-gray-500 uppercase tracking-wider group-focus-within:text-yellow-600 dark:group-focus-within:text-yellow-500 transition-colors">{t.email}</label>
                <div className="relative">
                   <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 transition-colors pointer-events-none dark:text-gray-600 group-focus-within:text-yellow-600 dark:group-focus-within:text-yellow-500">
                      <Mail size={16} />
                   </div>
                   <input 
                      type="email" 
                      name="email" 
                      value={form.email}
                      onChange={handleChange}
                      placeholder={t.emailPlaceholder}
                      autoComplete="email"
                      required 
                      className="w-full bg-gray-50 dark:bg-[#121212] text-gray-900 dark:text-gray-200 border border-gray-200 dark:border-gray-800 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all placeholder-gray-400 dark:placeholder-gray-700 text-sm font-medium"
                   />
                </div>
              </div>

              {/* 3. Password Row */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-1.5 group">
                    <label className="text-[10px] font-bold text-gray-500 dark:text-gray-500 uppercase tracking-wider group-focus-within:text-yellow-600 dark:group-focus-within:text-yellow-500 transition-colors">{t.confirmPassword}</label>
                    <div className="relative">
                       <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 transition-colors pointer-events-none dark:text-gray-600 group-focus-within:text-yellow-600 dark:group-focus-within:text-yellow-500">
                          <Lock size={16} />
                       </div>
                      <input 
                          type={showPassword ? "text" : "password"} 
                          name="password"
                          value={form.password}
                          onChange={handleChange}
                          placeholder={t.passwordPlaceholder}
                          autoComplete="new-password"
                          required 
                          pattern="^(?=.*[A-Za-z])(?=.*[\d@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$"
                          title="Must be at least 8 characters long and contain at least one letter and one number or special character."
                          className="w-full bg-gray-50 dark:bg-[#121212] text-gray-900 dark:text-gray-200 border border-gray-200 dark:border-gray-800 rounded-lg py-2.5 pl-10 pr-10 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all placeholder-gray-400 dark:placeholder-gray-700 text-sm font-medium"
                       />
                       <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                       </button>
                    </div>
                  </div>
                  <div className="space-y-1.5 group">
                    <label className="text-[10px] font-bold text-gray-500 dark:text-gray-500 uppercase tracking-wider group-focus-within:text-yellow-600 dark:group-focus-within:text-yellow-500 transition-colors">{t.confirmPassword}</label>
                    <div className="relative">
                       <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 transition-colors pointer-events-none dark:text-gray-600 group-focus-within:text-yellow-600 dark:group-focus-within:text-yellow-500">
                          <Lock size={16} />
                       </div>
                       <input 
                          type={showConfirmPassword ? "text" : "password"} 
                          name="confirmPassword"
                          value={confirmPassword}
                          onChange={handleChange}
                            autoComplete=" new-password"
                          placeholder={t.confirmPasswordPlaceholder}
                          required 
                          className="w-full bg-gray-50 dark:bg-[#121212] text-gray-900 dark:text-gray-200 border border-gray-200 dark:border-gray-800 rounded-lg py-2.5 pl-10 pr-10 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all placeholder-gray-400 dark:placeholder-gray-700 text-sm font-medium"
                       />
                       <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                          {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                       </button>
                    </div>
                  </div>
              </div>

              {/* 4. ID Details Row */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-1.5 group">
                    <label className="text-[10px] font-bold text-gray-500 dark:text-gray-500 uppercase tracking-wider group-focus-within:text-yellow-600 dark:group-focus-within:text-yellow-500 transition-colors">{t.dob}</label>
                    <div className="relative">
                       <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 transition-colors pointer-events-none dark:text-gray-600 group-focus-within:text-yellow-600 dark:group-focus-within:text-yellow-500">
                          <Calendar size={16} />
                       </div>
                       <input 
                          type="date" 
                          name="dob" 
                          value={form.dob}
                          onChange={handleChange}
                          required 
                          className="w-full bg-gray-50 dark:bg-[#121212] text-gray-900 dark:text-gray-200 border border-gray-200 dark:border-gray-800 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all text-sm font-medium cursor-pointer [color-scheme:light] dark:[color-scheme:dark]"
                       />
                    </div>
                  </div>
                  <div className="space-y-1.5 group">
                    <label className="text-[10px] font-bold text-gray-500 dark:text-gray-500 uppercase tracking-wider group-focus-within:text-yellow-600 dark:group-focus-within:text-yellow-500 transition-colors">{t.idType}</label>
                    <div className="relative">
                       <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 transition-colors pointer-events-none dark:text-gray-600 group-focus-within:text-yellow-600 dark:group-focus-within:text-yellow-500">
                          <CreditCard size={16} />
                       </div>
                       <select 
                          name="idType" 
                          value={form.idType}
                          onChange={handleChange}
                          required 
                          className="w-full bg-gray-50 dark:bg-[#121212] text-gray-900 dark:text-gray-200 border border-gray-200 dark:border-gray-800 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all text-sm font-medium appearance-none"
                       >
                          <option value="">{t.selectId}</option>
                          <option value="Aadhaar">Aadhaar</option>
                          <option value="VoterID">VoterID</option>
                          <option value="StudentID">StudentID</option>
                          <option value="Passport">Passport</option>
                       </select>
                    </div>
                  </div>
              </div>

              {/* 5. ID Number */}
              <div className="space-y-1.5 group">
                <label className="text-[10px] font-bold text-gray-500 dark:text-gray-500 uppercase tracking-wider group-focus-within:text-yellow-600 dark:group-focus-within:text-yellow-500 transition-colors">{t.idNumber}</label>
                <div className="relative">
                   <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 transition-colors pointer-events-none dark:text-gray-600 group-focus-within:text-yellow-600 dark:group-focus-within:text-yellow-500">
                      <FileText size={16} />
                   </div>
                   <input 
                      type="text" 
                      name="idNumber" 
                      value={form.idNumber}
                      onChange={handleChange}
                      placeholder={t.idNumberPlaceholder}
                      required 
                      className="w-full bg-gray-50 dark:bg-[#121212] text-gray-900 dark:text-gray-200 border border-gray-200 dark:border-gray-800 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all placeholder-gray-400 dark:placeholder-gray-700 text-sm font-medium"
                   />
                </div>
              </div>

              {/* 6. File Upload */}
             <div className="space-y-1.5 group">
                <label className="text-[10px] font-bold text-gray-500 dark:text-gray-500 uppercase tracking-wider group-focus-within:text-yellow-600 dark:group-focus-within:text-yellow-500 transition-colors">{t.uploadDoc}</label>
                <div className="flex items-center gap-3">
                   <label className="px-4 py-2 text-xs font-bold text-black transition-colors bg-yellow-500 rounded shadow-sm cursor-pointer hover:bg-yellow-400">
                      {t.chooseFile}
                      <input 
                        type="file" 
                        accept="image/*,application/pdf"
                        onChange={(e) => setIdFile(e.target.files?.[0] || null)}
                        className="hidden" 
                      />
                   </label>
                   <span className="text-xs italic text-gray-500 dark:text-gray-400">
                     {idFile ? idFile.name : t.noFile}
                   </span>
                </div>
             </div>

             {/* Action Button */}
             <button 
               type="submit"
               disabled={loading}
               className={`w-full h-12 relative rounded-lg font-bold text-sm uppercase tracking-wider overflow-hidden transition-all duration-300 mt-4 ${
                 loading ? 'bg-yellow-600 text-yellow-100 cursor-not-allowed' :
                 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-[0_4px_20px_rgba(234,179,8,0.2)] hover:shadow-[0_4px_25px_rgba(234,179,8,0.4)] hover:-translate-y-0.5'
               }`}
             >
                <div className="relative z-10 flex items-center justify-center gap-2">
                   {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" /> {t.processing}
                      </>
                   ) : (
                      <>
                        {t.completeReg} <Upload size={16} />
                      </>
                   )}
                </div>
             </button>
           </motion.form>

           <div className="mt-4 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t.alreadyAccount}{' '}
                <button onClick={() => navigate("/login")} className="font-bold text-yellow-600 dark:text-yellow-500 hover:underline">
                  {t.login}
                </button>
              </p>
           </div>

           {/* Security Footer Strip */}
           <div className="flex items-center justify-center gap-6 py-3 mt-8 text-[9px] font-bold text-gray-400 uppercase tracking-widest border-t border-gray-200 opacity-80 dark:border-gray-800">
              <span className="flex items-center gap-1"><Lock size={10} /> {t.secureAccess}</span>
              <span>|</span>
              <span>{t.ipLogged}</span>
           </div>
        </div>
     </div>

   </div>
 );
}
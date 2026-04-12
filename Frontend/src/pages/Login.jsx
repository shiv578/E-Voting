import React, { useEffect, useRef, useState } from "react";
import api from "../api";
import { useNavigate, Link } from "react-router-dom";
import { loadTurnstileScript } from "../utils/loadTurnstile";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sun, Moon, User, Lock, ArrowRight, Loader2, AlertCircle, CheckCircle, 
  ShieldCheck, Database, Check, Server, FileKey, Key, Activity, Globe, ChevronDown
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "", turnstile: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [currentLogIndex, setCurrentLogIndex] = useState(0); 
  const { lang, setLang, t, languages } = useLanguage(); 
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langMenuRef = useRef(null);
  // --- USE SHARED THEME CONTEXT ---
  const { isDarkMode, toggleTheme } = useTheme();
  
  const navigate = useNavigate();
  const widgetRef = useRef(null);
  const widgetIdRef = useRef(null);

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
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
  }

  // Turnstile Logic
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
      } catch (e) { }
    };
  }, [isDarkMode, lang]); // Reload if language changes

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
    if (siteKey && !form.turnstile) {
      setMsg({ type: "error", text: t.turnstileError });
      setLoading(false);
      return;
    }

    try {
      const res = await api.post("/api/auth/login", form);
      const token = res.data.token;
      const user = res.data.user;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setMsg({ type: "success", text: t.loginSuccess });
      
      setTimeout(() => {
        if (user.role === "admin") navigate("/admin");
        else navigate("/dashboard");
      }, 800);
    } catch (err) {
      console.error(err);
      const text = err?.response?.data?.msg || err?.message || t.loginFailed;
      setMsg({ type: "error", text });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex w-full min-h-screen bg-gray-50 dark:bg-[#050505] overflow-hidden transition-colors duration-500 font-sans">
      
      {/* --- LEFT PANEL: Login Form --- */}
      <div className="w-full lg:w-[45%] xl:w-[40%] flex flex-col justify-center px-6 md:px-12 lg:px-16 xl:px-24 py-12 relative z-20 bg-white dark:bg-[#0a0a0a] border-r border-gray-200 dark:border-gray-900/50 shadow-2xl lg:shadow-none transition-colors duration-500">
         
         {/* Top Right Controls: Language & Theme */}
         <div className="absolute z-50 flex items-center gap-3 top-6 right-6">
            
            {/* Language Selector */}
            <div className="relative" ref={langMenuRef}>
                <button 
                    onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all border border-gray-200 dark:border-gray-700 text-xs font-semibold uppercase tracking-wide"
                >
                    <Globe size={16} />
                    <span>{lang.toUpperCase()}</span>
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

         {/* Subtle Background pattern for Left Panel */}
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-gray-50 via-white to-white dark:from-gray-900/20 dark:via-[#050505] dark:to-[#050505] pointer-events-none opacity-50"></div>

         <div className="relative z-10 w-full max-w-md mx-auto space-y-8">
            {/* Header */}
            <motion.div 
              key={lang} // Re-animate on lang change
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-6">
                 <div className="p-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" 
                      alt="Emblem" 
                      className="w-auto h-8 opacity-90 dark:invert" 
                    />
                 </div>
                 <div className="h-8 w-[1px] bg-gray-300 dark:bg-gray-800"></div>
                 <span className="text-xs font-bold tracking-widest text-gray-500 uppercase">{t.portalName}</span>
              </div>
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-gray-900 dark:text-white">
                {t.welcomePrefix} <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-500 dark:from-yellow-400 dark:to-orange-500">{t.welcomeHighlight}</span>
              </h1>
              <p className="mt-3 text-sm font-medium leading-relaxed text-gray-600 dark:text-gray-400">
                {t.subtext}
              </p>
            </motion.div>

            {/* Error/Success Messages */}
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
                    {msg.type === "success" ? <CheckCircle size={18} className="mt-0.5 shrink-0"/> : <AlertCircle size={18} className="mt-0.5 shrink-0"/>}
                    {msg.text}
                </motion.div>
            )}

            {/* Form */}
            <motion.form 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              onSubmit={handleSubmit} 
              className="space-y-6"
            >
              {/* Email */}
              <div className="space-y-2 group">
                <label className="text-[11px] font-bold text-gray-500 dark:text-gray-500 uppercase tracking-wider group-focus-within:text-yellow-600 dark:group-focus-within:text-yellow-500 transition-colors">{t.emailLabel}</label>
                <div className="relative">
                   <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 transition-colors pointer-events-none dark:text-gray-600 group-focus-within:text-yellow-600 dark:group-focus-within:text-yellow-500">
                      <User size={18} />
                   </div>
                   <input 
                      name="email"
                      type="email" 
                      value={form.email}
                      onChange={handleChange}
                      placeholder={t.emailPlaceholder}
                      required
                      autoComplete="username"
                      className="w-full bg-gray-50 dark:bg-[#121212] text-gray-900 dark:text-gray-200 border border-gray-200 dark:border-gray-800 rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/10 transition-all placeholder-gray-400 dark:placeholder-gray-700 text-sm font-medium shadow-inner"
                   />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2 group">
                <div className="flex items-center justify-between">
                   <label className="text-[11px] font-bold text-gray-500 dark:text-gray-500 uppercase tracking-wider group-focus-within:text-yellow-600 dark:group-focus-within:text-yellow-500 transition-colors">{t.passwordLabel}</label>
                   <button type="button" onClick={() => navigate("/forgot-password")} className="text-[11px] font-bold text-yellow-600 dark:text-yellow-500 hover:text-yellow-700 dark:hover:text-yellow-400 transition-colors">{t.forgotPassword}</button>
                </div>
                <div className="relative">
                   <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 transition-colors pointer-events-none dark:text-gray-600 group-focus-within:text-yellow-600 dark:group-focus-within:text-yellow-500">
                      <Lock size={18} />
                   </div>
                   <input 
                      name="password"
                      type="password" 
                      value={form.password}
                      onChange={handleChange}
                      placeholder={t.passwordPlaceholder}
                      required
                      autoComplete="current-password"
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
                         <Loader2 size={18} className="animate-spin" /> {t.authenticating}
                       </>
                    ) : (
                       <>
                         {t.loginBtn} <ArrowRight size={18} />
                       </>
                    )}
                 </div>
              </button>
            </motion.form>

            {/* Footer Links */}
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.3 }}
               className="flex flex-col items-center pt-8 border-t border-gray-200 dark:border-gray-900"
            >
               <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                  {t.dontHaveAccount}{" "}
                  <button 
                      onClick={() => navigate("/register")} 
                      className="font-bold text-yellow-600 dark:text-yellow-500 hover:underline"
                  >
                      {t.registerNow}
                  </button>
               </p>
               <div className="flex justify-between w-full text-xs font-medium text-gray-500 dark:text-gray-600">
                   <a href="#" className="transition-colors hover:text-gray-800 dark:hover:text-gray-400">{t.privacy}</a>
                   <a href="#" className="transition-colors hover:text-gray-800 dark:hover:text-gray-400">{t.terms}</a>
                   <a href="#" className="transition-colors hover:text-gray-800 dark:hover:text-gray-400">{t.help}</a>
               </div>
            </motion.div>
         </div>
      </div>

      {/* --- RIGHT PANEL: Visual Experience (Hidden on Mobile) --- */}
      <div className="hidden lg:flex w-[55%] xl:w-[60%] relative bg-gray-100 dark:bg-[#020202] items-center justify-center p-12 overflow-hidden perspective-[2000px] transition-colors duration-500">
          
          {/* Animated Background Elements - Theme Adapted */}
          <div className="absolute inset-0 w-full h-full pointer-events-none">
             {/* Gradient Orbs */}
             <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-yellow-200/40 dark:bg-yellow-600/5 rounded-full blur-[120px] animate-pulse-slow"></div>
             <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-200/40 dark:bg-blue-900/10 rounded-full blur-[120px] animate-pulse-slow"></div>
             
             {/* Tech Grid */}
             <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] opacity-40 dark:opacity-20"></div>
          </div>

          {/* Central Hero Composition */}
          <div className="relative z-10 flex flex-col items-center w-full max-w-2xl">
             
             {/* 3D Floating Card Container */}
             <motion.div 
                animate={{ 
                  rotateY: [0, 5, 0, -5, 0], 
                  rotateX: [0, -5, 0, 5, 0],
                  y: [0, -15, 0] 
                }}
                transition={{ 
                  rotateY: { duration: 10, repeat: Infinity, ease: "easeInOut" },
                  rotateX: { duration: 8, repeat: Infinity, ease: "easeInOut" },
                  y: { duration: 6, repeat: Infinity, ease: "easeInOut" }
                }}
                className="relative w-full aspect-video bg-white/60 dark:bg-black/90 rounded-2xl shadow-2xl dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white dark:border-white/10 backdrop-blur-md overflow-hidden group"
             >
                {/* Card Glow */}
                <div className="absolute inset-0 transition-opacity duration-700 opacity-50 bg-gradient-to-tr from-yellow-500/5 via-transparent to-blue-500/5 group-hover:opacity-100"></div>

                {/* Card Content - Simulated Dashboard */}
                <div className="relative flex flex-col h-full p-6">
                   {/* Card Header */}
                   <div className="flex items-center justify-between pb-4 mb-8 border-b border-gray-200 dark:border-white/5">
                      <div className="flex items-center gap-3">
                         <div className="w-3 h-3 bg-red-400 rounded-full dark:bg-red-500"></div>
                         <div className="w-3 h-3 bg-yellow-400 rounded-full dark:bg-yellow-500"></div>
                         <div className="w-3 h-3 bg-green-400 rounded-full dark:bg-green-500"></div>
                      </div>
                      <div className="px-3 py-1 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5 text-[10px] font-mono text-gray-500 dark:text-gray-400">
                         SECURE_VOTING_PROTOCOL_V2.0
                      </div>
                   </div>

                   {/* Visual Data Representation */}
                   <div className="grid flex-1 grid-cols-2 gap-6">
                      <div className="space-y-4">
                         <div className="flex flex-col justify-between h-24 p-4 transition-all border border-gray-200 rounded-lg bg-gray-50 dark:bg-white/5 dark:border-white/5 group/item hover:bg-white dark:hover:bg-white/10 hover:shadow-md">
                            <Key className="text-yellow-600 dark:text-yellow-500" size={24} />
                            <div>
                               <div className="w-12 h-1 mb-1 rounded-full bg-yellow-500/50"></div>
                               <p className="text-xs text-gray-500 dark:text-gray-400">Digital Key</p>
                            </div>
                         </div>
                         <div className="flex flex-col justify-between h-24 p-4 transition-all border border-gray-200 rounded-lg bg-gray-50 dark:bg-white/5 dark:border-white/5 group/item hover:bg-white dark:hover:bg-white/10 hover:shadow-md">
                            <Database className="text-blue-600 dark:text-blue-500" size={24} />
                            <div>
                               <div className="w-12 h-1 mb-1 rounded-full bg-blue-500/50"></div>
                               <p className="text-xs text-gray-500 dark:text-gray-400">Ledger Sync</p>
                            </div>
                         </div>
                      </div>
                      
                      {/* Rotating Ring Visual - Encryption Theme */}
                      <div className="relative flex items-center justify-center">
                         <div className="absolute inset-0 border-2 border-gray-300 border-dashed rounded-full dark:border-gray-700 animate-spin-slow"></div>
                         <div className="absolute border border-gray-200 rounded-full inset-4 dark:border-gray-800"></div>
                         <div className="w-20 h-20 rounded-full opacity-20 bg-gradient-to-br from-yellow-400 to-orange-500 blur-xl animate-pulse"></div>
                         <ShieldCheck size={48} className="relative z-10 text-gray-800 dark:text-white" />
                      </div>
                   </div>
                   
                   {/* Bottom Status Bar */}
                   <div className="flex items-center justify-between pt-4 mt-8 font-mono text-xs text-gray-500 border-t border-gray-200 dark:border-white/5">
                      <span>STATUS: ONLINE</span>
                      <span>ENCRYPTION: AES-256-GCM</span>
                      <span>LATENCY: 14ms</span>
                   </div>
                </div>
             </motion.div>

             {/* Floating Features - Glass Cards */}
             <motion.div 
               animate={{ y: [0, 10, 0] }}
               transition={{ duration: 5, repeat: Infinity, delay: 1 }}
               className="absolute -right-8 top-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md p-4 rounded-xl border border-white dark:border-white/10 shadow-xl flex items-center gap-3 max-w-[200px]"
             >
                <div className="p-2 text-green-600 bg-green-100 rounded-lg dark:bg-green-500/20 dark:text-green-500"><Server size={20} /></div>
                <div>
                   <p className="text-xs text-gray-500 dark:text-gray-400">Nodes Active</p>
                   <p className="text-sm font-bold text-gray-900 dark:text-white">843 / 850</p>
                </div>
             </motion.div>

             <motion.div 
               animate={{ y: [0, -10, 0] }}
               transition={{ duration: 7, repeat: Infinity, delay: 0.5 }}
               className="absolute -left-8 bottom-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md p-4 rounded-xl border border-white dark:border-white/10 shadow-xl flex items-center gap-3 max-w-[200px]"
             >
                <div className="p-2 text-purple-600 bg-purple-100 rounded-lg dark:bg-purple-500/20 dark:text-purple-500"><FileKey size={20} /></div>
                <div>
                   <p className="text-xs text-gray-500 dark:text-gray-400">Smart Contracts</p>
                   <p className="text-sm font-bold text-gray-900 dark:text-white">Verified</p>
                </div>
             </motion.div>
          </div>
      </div>

    </div>
  );
}
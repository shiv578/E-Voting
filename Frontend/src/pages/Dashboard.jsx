import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, CheckCircle, XCircle, Clock, FileText, ChevronRight,
  ArrowRight, ShieldCheck, Zap, Fingerprint, Check, Database, Lock,
  CheckCircle2, Calendar, Search, Filter, Layers, Archive
} from "lucide-react";

// --- IMPORT SHARED CONTEXTS ---
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";

// Define Motion components for the Hero section
const MotionDiv = motion.div;
const MotionH1 = motion.h1;
const MotionP = motion.p;

export default function Dashboard() {
  const navigate = useNavigate();
  
  // --- USE SHARED CONTEXTS ---
  const { isDarkMode } = useTheme(); // Shared Theme
  const { t, lang } = useLanguage(); // Shared Language
  
  const [user, setUser] = useState(null);
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  
  // Search & Filter State
  const [filter, setFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Date formatting based on selected language
  const locale = lang === 'en' ? 'en-US' : 'en-IN';
  const currentDate = new Date().toLocaleDateString(locale, { weekday: 'short', month: 'short', day: 'numeric' });

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const meRes = await api.get("/api/auth/me");
        setUser(meRes.data.user);

        const elRes = await api.get("/api/elections");
        setElections(elRes.data.elections || []);
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

  const now = new Date();

  const getStatus = (e) => {
    const start = e.startTime ? new Date(e.startTime) : null;
    const end = e.endTime ? new Date(e.endTime) : null;

    if (end && now > end) return "completed";
    if (start && now < start) return "upcoming";
    return "active";
  };

  // Logic for filtering elections
  const filteredElections = elections.filter(election => {
    const status = getStatus(election); 
    
    const matchesFilter = filter === 'ALL' 
      ? true 
      : filter === 'ACTIVE' 
      ? status === 'active' 
      : status === 'completed'; 
      
    const matchesSearch = election.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (election.description && election.description.toLowerCase().includes(searchQuery.toLowerCase()));
                          
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className={isDarkMode ? "dark" : ""}>
        <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f0f] flex items-center justify-center transition-colors duration-200">
           <div className="text-xl font-semibold text-[#0B2447] dark:text-yellow-400 animate-pulse">
             {t.loading || "Loading..."}
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f0f] flex flex-col font-sans transition-colors duration-200">
        
        {/* ================= HERO SECTION ================= */}
         <div className="relative w-full overflow-hidden bg-white dark:bg-[#0f0f0f] border-b border-gray-200 dark:border-gray-800 flex items-center transition-colors duration-500 mb-8">
          {/* --- Advanced Glowing Background --- */}
          <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
            {/* Top Center Glow */}
            <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[80%] h-[60%] rounded-full bg-yellow-200/50 dark:bg-yellow-600/10 blur-[100px] opacity-100 dark:opacity-60 transition-colors duration-500"></div>
            
            {/* Bottom Right Glow */}
            <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-blue-100/50 dark:bg-blue-900/10 blur-[100px] opacity-100 dark:opacity-40 transition-colors duration-500"></div>
            
            {/* Subtle Noise Texture */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] dark:opacity-[0.03]"></div>
            
            {/* Perspective Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]"></div>
          </div>

          <div className="container relative z-10 px-4 py-12 mx-auto md:px-8">
            <div className="flex flex-col items-center justify-between gap-16 lg:flex-row lg:gap-8">
              
              {/* Left Content */}
              <div className="w-full space-y-8 text-center lg:w-1/2 lg:text-left">
                <MotionDiv 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20 backdrop-blur-sm text-yellow-800 dark:text-yellow-500 text-xs font-bold uppercase tracking-widest shadow-sm dark:shadow-[0_0_10px_rgba(234,179,8,0.1)]"
                >
                  <Zap size={12} className="text-yellow-600 fill-yellow-600 dark:fill-yellow-500 dark:text-yellow-500" />
                  <span>Next Gen E-Governance</span>
                </MotionDiv>

                <div className="space-y-4">
                  <MotionH1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white leading-[1.1] tracking-tight"
                  >
                    Democracy <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 dark:from-yellow-400 dark:via-yellow-200 dark:to-yellow-500 drop-shadow-sm dark:drop-shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                      Reimagined.
                    </span>
                  </MotionH1>

                  <MotionP 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="max-w-xl mx-auto text-lg font-medium leading-relaxed text-gray-600 dark:text-gray-400 md:text-xl lg:mx-0"
                  >
                    Secure, transparent, and immutable voting powered by blockchain technology. Experience the future of civic participation today.
                  </MotionP>
                </div>

                <MotionDiv 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start"
                >
                 <button 
  // ADD THIS onClick function 👇
  onClick={() => {
    document.getElementById('election-dashboard')?.scrollIntoView({ behavior: 'smooth' });
  }}
  className="w-full sm:w-auto relative px-8 py-4 bg-yellow-500 text-black font-bold text-base rounded-lg overflow-hidden transition-all hover:scale-105 hover:shadow-xl dark:hover:shadow-[0_0_25px_rgba(234,179,8,0.4)] group shadow-lg"
>
  <span className="relative z-10 flex items-center justify-center gap-2">
     Cast Your Vote <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
  </span>
  <div className="absolute inset-0 transition-transform duration-300 ease-out translate-y-full bg-white/20 group-hover:translate-y-0"></div>
</button>
                  
                  <button onClick={() => navigate("/help")} className="flex items-center justify-center w-full gap-2 px-8 py-4 text-base font-medium text-gray-700 transition-all bg-white border border-gray-200 rounded-lg shadow-sm sm:w-auto dark:bg-white/5 dark:border-white/10 dark:text-white hover:bg-gray-50 dark:hover:bg-white/10 hover:border-gray-300 dark:hover:border-white/20 backdrop-blur-sm hover:shadow-md">
                    <ShieldCheck size={20} className="text-gray-500 dark:text-gray-400" />
                    Learn More
                  </button>
                </MotionDiv>

                {/* Trust Indicators */}
                <MotionDiv 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="flex items-center justify-center gap-6 pt-6 text-sm text-gray-600 lg:justify-start dark:text-gray-500"
                >
                   <div className="flex -space-x-3">
                     {[1,2,3,4].map((i) => (
                       <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-[#0f0f0f] bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[10px] text-white overflow-hidden shadow-sm">
                         <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-600 dark:from-gray-600 dark:to-gray-800"></div>
                       </div>
                     ))}
                     <div className="w-8 h-8 rounded-full border-2 border-white dark:border-[#0f0f0f] bg-yellow-100 dark:bg-yellow-900/80 flex items-center justify-center text-[10px] text-yellow-700 dark:text-yellow-500 font-bold shadow-sm">
                       +2M
                     </div>
                   </div>
                   <div className="w-1 h-1 bg-gray-300 rounded-full dark:bg-gray-700"></div>
                   <p className="font-semibold">Trusted by millions of voters.</p>
                </MotionDiv>
              </div>

              {/* Right Visuals - Modern 3D Card Composition with Animation */}
              <div className="w-full lg:w-1/2 flex justify-center lg:justify-end perspective-[2000px] relative mt-8 lg:mt-0">
                {/* Background Glow behind the card */}
                <MotionDiv 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.8, 0.6] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-yellow-500/30 to-blue-500/20 rounded-full blur-[60px] dark:opacity-100 mix-blend-normal"
                ></MotionDiv>

                <div className="relative w-80 md:w-96 h-[500px]">
                  {/* Back Card (Decoration) */}
                  <MotionDiv 
                    animate={{ rotate: [0, 5, 0], y: [0, -10, 0] }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    className="absolute z-0 w-full h-full transform bg-gray-100 border border-gray-200 shadow-xl top-4 -right-4 dark:bg-gray-800/30 rounded-3xl dark:border-white/5 backdrop-blur-sm rotate-6"
                  ></MotionDiv>

                  {/* Main Card */}
                  <MotionDiv 
                    animate={{ y: [0, -20, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="relative z-10 flex flex-col w-full h-full overflow-hidden bg-white border border-gray-100 shadow-2xl dark:bg-black/80 dark:border-white/10 rounded-3xl backdrop-blur-xl"
                  >
                    {/* Card Header (Glass) */}
                    <div className="relative flex flex-col items-center justify-center p-6 border-b border-gray-100 h-1/2 bg-gradient-to-b from-gray-50 to-white dark:from-white/5 dark:to-transparent dark:border-white/5">
                       <div className="absolute flex gap-1 top-4 right-4">
                         <div className="w-2 h-2 rounded-full bg-red-500/80"></div>
                         <div className="w-2 h-2 rounded-full bg-yellow-500/80"></div>
                         <div className="w-2 h-2 rounded-full bg-green-500/80"></div>
                       </div>
                       
                       {/* Scanner Visual */}
                       <div className="relative flex items-center justify-center w-32 h-32">
                         <div className="absolute inset-0 border border-yellow-500/30 dark:border-yellow-500/30 rounded-full animate-[spin_10s_linear_infinite]"></div>
                         <div className="absolute inset-4 border border-dashed border-yellow-500/50 dark:border-yellow-500/50 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
                         <div className="absolute inset-0 rounded-full bg-yellow-500/10 dark:bg-yellow-500/10 blur-xl animate-pulse"></div>
                         <Fingerprint size={64} className="relative z-10 text-yellow-600 dark:text-yellow-500" strokeWidth={1.5} />
                       </div>
                       
                       <p className="mt-4 font-mono text-sm font-semibold tracking-widest text-gray-500 uppercase dark:text-gray-400">Biometric Auth</p>
                    </div>

                    {/* Card Body */}
                    <div className="flex-1 p-6 space-y-4 bg-gray-50 dark:bg-[#0a0a0a]/50">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-white/5 dark:border-white/5">
                          <div className="flex items-center gap-3">
                            <div className="p-2 text-blue-600 bg-blue-100 rounded dark:bg-blue-500/20 dark:text-blue-400"><Database size={16} /></div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Block #192834</p>
                              <p className="text-xs font-bold text-gray-800 dark:text-gray-200">Hash Verified</p>
                            </div>
                          </div>
                          <Check size={16} className="text-green-500" />
                        </div>

                        <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-white/5 dark:border-white/5">
                          <div className="flex items-center gap-3">
                            <div className="p-2 text-purple-600 bg-purple-100 rounded dark:bg-purple-500/20 dark:text-purple-400"><Lock size={16} /></div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Encryption</p>
                              <p className="text-xs font-bold text-gray-800 dark:text-gray-200">AES-256</p>
                            </div>
                          </div>
                          <Check size={16} className="text-green-500" />
                        </div>
                      </div>
                      
                      <div className="pt-2 mt-auto">
                        <div className="w-full h-1 overflow-hidden bg-gray-200 rounded-full dark:bg-gray-800">
                          <div className="h-full bg-yellow-500 dark:bg-yellow-500 w-2/3 animate-[shimmer_2s_infinite]"></div>
                        </div>
                        <div className="flex justify-between mt-2 text-[10px] text-gray-500 font-bold uppercase">
                          <span>Verifying</span>
                          <span>67%</span>
                        </div>
                      </div>
                    </div>
                  </MotionDiv>

                  {/* Floating Badges with Independent Animation */}
                  <MotionDiv 
                    animate={{ y: [0, -15, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute -left-12 top-1/3 bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-700/50 p-3 pr-5 rounded-xl shadow-lg dark:shadow-2xl flex items-center gap-3 z-20"
                  >
                    <div className="p-2 text-green-600 bg-green-100 rounded-lg dark:bg-green-500/20 dark:text-green-500">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase">Status</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">Identity Verified</p>
                    </div>
                  </MotionDiv>

                  <MotionDiv 
                    animate={{ y: [0, -15, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0 }}
                    className="absolute -right-8 bottom-1/4 bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-700/50 p-3 pr-5 rounded-xl shadow-lg dark:shadow-2xl flex items-center gap-3 z-20"
                  >
                     <div className="p-2 text-blue-600 bg-blue-100 rounded-lg dark:bg-blue-500/20 dark:text-blue-500">
                      <Database size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase">Ledger</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">Vote Recorded</p>
                    </div>
                  </MotionDiv>

                </div>
              </div>

            </div>
          </div>
        </div>

        {/* --- MAIN CONTENT --- */}
        <div className="flex-1 max-w-[1400px] w-full mx-auto p-4 md:p-6 space-y-6">
            
            {/* 1. User Info Card */}
            <MotionDiv
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative mb-2"
            >
                {/* Decorative Glow */}
                <div className="absolute top-0 left-0 w-full h-full transform scale-y-110 opacity-50 bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-yellow-500/20 blur-3xl -z-10 dark:opacity-20"></div>

                <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-gray-800 shadow-xl group">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400"></div>

                    <div className="relative z-10 flex flex-col items-start justify-between gap-6 p-6 md:p-8 xl:flex-row xl:items-center">
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <div className="h-20 w-20 md:h-24 md:w-24 rounded-full p-[3px] bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg">
                                    <div className="h-full w-full rounded-full bg-gray-50 dark:bg-[#1a1a1a] flex items-center justify-center border-4 border-white dark:border-[#121212] overflow-hidden">
                                        <User size={40} className="text-gray-400 dark:text-gray-500" />
                                    </div>
                                </div>
                                <div className={`absolute bottom-1 right-0 p-1.5 rounded-full border-4 border-white dark:border-[#121212] shadow-md text-white
                                    ${user?.verificationStatus === "approved" ? "bg-green-500" : 
                                      user?.verificationStatus === "rejected" ? "bg-red-500" : "bg-yellow-500"}`}
                                >
                                    {user?.verificationStatus === "approved" && <CheckCircle2 size={14} strokeWidth={4} />}
                                    {user?.verificationStatus === "rejected" && <XCircle size={14} strokeWidth={4} />}
                                    {(!user?.verificationStatus || user?.verificationStatus === "pending") && <Clock size={14} strokeWidth={4} />}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-500 text-[10px] font-bold uppercase tracking-wider border border-yellow-100 dark:border-yellow-500/20">
                                        <ShieldCheck size={10} /> {t.officialVoter || "Official Voter"}
                                    </span>
                                </div>
                                <h1 className="text-3xl font-extrabold leading-none tracking-tight text-gray-900 md:text-4xl dark:text-white">
                                    {t.welcome || "Welcome"}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600 dark:from-yellow-400 dark:to-orange-400">
                                        {user?.name ? user.name.split(' ')[0] : "Voter"}
                                    </span>
                                </h1>
                                <div className="flex flex-col gap-1 text-sm font-medium text-gray-500 md:flex-row md:items-center md:gap-3 dark:text-gray-400">
                                    <span className="truncate">{user?.email}</span>
                                    <span className="hidden w-1 h-1 bg-gray-300 rounded-full md:block dark:bg-gray-700"></span>
                                    <span className="font-mono text-xs opacity-70">
                                        ID: {user?._id ? `...${user._id.slice(-4)}` : "Waitlist"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="w-full xl:w-auto flex flex-col md:flex-row items-stretch md:items-center gap-3 bg-gray-50 dark:bg-[#0f0f0f] p-2 rounded-xl border border-gray-100 dark:border-gray-800/50">
                            {user?.role === "admin" && (
                                <button
                                    onClick={() => navigate("/admin")}
                                    className="flex items-center justify-center flex-1 px-4 py-3 text-xs font-bold tracking-wider text-black uppercase transition-colors bg-yellow-400 rounded-lg shadow-sm md:flex-none md:py-2 hover:bg-yellow-500"
                                >
                                    Admin Dashboard
                                </button>
                            )}

                            {/* Date Widget */}
                            <div className="flex-1 md:flex-none flex items-center gap-3 px-4 py-2 bg-white dark:bg-[#1a1a1a] rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
                                <div className="p-2 text-blue-600 rounded-md bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400">
                                    <Calendar size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t.today || "Today"}</p>
                                    <p className="text-sm font-bold leading-tight text-gray-900 dark:text-gray-100 whitespace-nowrap">{currentDate}</p>
                                </div>
                            </div>

                            {/* Status Widget */}
                            <div className="flex-1 md:flex-none flex items-center gap-3 px-4 py-2 bg-white dark:bg-[#1a1a1a] rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
                                <div className={`p-2 rounded-md ${
                                    user?.verificationStatus === "approved" ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400" :
                                    user?.verificationStatus === "rejected" ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400" :
                                    "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400"
                                }`}>
                                    {user?.verificationStatus === "approved" && <CheckCircle2 size={18} />}
                                    {user?.verificationStatus === "rejected" && <XCircle size={18} />}
                                    {(!user?.verificationStatus || user?.verificationStatus === "pending") && <Clock size={18} />}
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t.status || "Status"}</p>
                                    <p className={`text-sm font-bold leading-tight capitalize ${
                                        user?.verificationStatus === "approved" ? "text-green-700 dark:text-green-400" :
                                        user?.verificationStatus === "rejected" ? "text-red-700 dark:text-red-400" :
                                        "text-yellow-700 dark:text-yellow-400"
                                    }`}>
                                        {user?.verificationStatus || "Pending"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </MotionDiv>

            {/* 2. Elections List */}
            <div className="space-y-6">
                
                {/* Dashboard Toolbar */}
                <div className="flex flex-col items-end justify-between gap-4 pb-4 border-b border-gray-200 md:flex-row md:items-center dark:border-gray-800">
                    <div className="space-y-1">
                        <h2  id="election-dashboard" className="flex items-center gap-2 text-2xl font-bold text-gray-900 transition-colors dark:text-white">
                            <Layers className="text-yellow-500" /> {t.dashboardTitle || "Election Dashboard"}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t.dashboardSubtitle || "Manage polls"}</p>
                    </div>

                    <div className="flex flex-col w-full gap-3 sm:flex-row md:w-auto">
                        <div className="relative group">
                            <Search className="absolute text-gray-400 transition-colors -translate-y-1/2 left-3 top-1/2 group-focus-within:text-yellow-500" size={18} />
                            <input 
                                type="text" 
                                placeholder={t.searchPlaceholder || "Search..."}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full sm:w-64 pl-10 pr-4 py-2 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-yellow-500 dark:focus:border-yellow-500 transition-colors shadow-sm"
                            />
                        </div>

                        <div className="flex bg-gray-200 dark:bg-[#1a1a1a] p-1 rounded-lg">
                            <button 
                                onClick={() => setFilter('ALL')}
                                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${filter === 'ALL' ? 'bg-white dark:bg-gray-800 text-black dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                            >
                                {t.all || "All"}
                            </button>
                            <button 
                                onClick={() => setFilter('ACTIVE')}
                                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${filter === 'ACTIVE' ? 'bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                            >
                                <Zap size={12} /> {t.active || "Active"}
                            </button>
                            <button 
                                onClick={() => setFilter('COMPLETED')}
                                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${filter === 'COMPLETED' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                            >
                                <Archive size={12} /> {t.past || "Past"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Grid Layout */}
                <motion.div 
                    layout
                    className="grid grid-cols-1 gap-6 md:grid-cols-2" 
                >
                    <AnimatePresence mode="popLayout">
                        {filteredElections.length > 0 ? (
                            filteredElections.map((e) => {
                                const status = getStatus(e);
                                const dateOpts = { dateStyle: 'medium', timeStyle: 'short' };
                                const start = e.startTime ? new Date(e.startTime).toLocaleString(locale, dateOpts) : "Not set";
                                const end = e.endTime ? new Date(e.endTime).toLocaleString(locale, dateOpts) : "Not set";

                                return (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.2 }}
                                        key={e._id}
                                        className="group relative bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800 p-5 hover:border-yellow-400 dark:hover:border-yellow-500/50 transition-all duration-300 hover:shadow-lg dark:hover:shadow-[0_0_20px_rgba(234,179,8,0.1)] flex flex-col justify-between h-full"
                                    >
                                        <div className="space-y-4">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 group-hover:bg-yellow-50 dark:group-hover:bg-yellow-500/10 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors">
                                                    <FileText size={24} />
                                                </div>
                                                <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full border flex items-center gap-1.5 ${
                                                    status === "completed"
                                                        ? "bg-gray-100 text-gray-600 border-gray-200 dark:bg-zinc-800 dark:text-gray-400 dark:border-zinc-700"
                                                        : "bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-500/30"
                                                }`}>
                                                    {status === "active" && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>}
                                                    {/* Translate status dynamically if key exists */}
                                                    {t[status] || status}
                                                </span>
                                            </div>

                                            <div>
                                                <h3 className="mb-2 text-lg font-bold leading-tight text-gray-900 transition-colors dark:text-white group-hover:text-yellow-600 dark:group-hover:text-yellow-400">
                                                    {e.title}
                                                </h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                                    {e.description || "No description provided."}
                                                </p>
                                            </div>

                                            <div className="p-3 mt-4 space-y-3 border border-gray-100 rounded-lg bg-gray-50 dark:bg-black/40 dark:border-white/5">
                                                <div className="flex items-start gap-3">
                                                    <div className="mt-0.5 text-gray-400 dark:text-gray-500"><Calendar size={14} /></div>
                                                    <div>
                                                        <p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">{t.startDate || "Start Date"}</p>
                                                        <p className="text-xs font-semibold text-gray-900 dark:text-gray-200">{start}</p>
                                                    </div>
                                                </div>
                                                <div className="w-full h-px bg-gray-200 dark:bg-white/10"></div>
                                                <div className="flex items-start gap-3">
                                                    <div className="mt-0.5 text-gray-400 dark:text-gray-500"><Clock size={14} /></div>
                                                    <div>
                                                        <p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">{t.endDate || "End Date"}</p>
                                                        <p className="text-xs font-semibold text-gray-900 dark:text-gray-200">{end}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-5">
                                            {status === "completed" ? (
                                                <Link
                                                    to={`/elections/${e._id}/results`}
                                                    className="flex items-center justify-center w-full gap-2 px-4 py-2.5 text-sm font-bold text-gray-700 bg-gray-100 dark:bg-gray-800 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                                >
                                                    {t.viewResults || "View Results"} <ChevronRight size={16} />
                                                </Link>
                                            ) : (
                                                <Link
                                                    to={`/elections/${e._id}`}
                                                    className="flex items-center justify-center w-full gap-2 px-4 py-2.5 text-sm font-bold text-black bg-yellow-400 rounded-lg hover:bg-yellow-500 transition-all shadow-sm hover:shadow-md"
                                                >
                                                    {t.voteNow || "Vote Now"} <ArrowRight size={16} />
                                                </Link>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })
                        ) : (
                            <motion.div 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }} 
                                className="col-span-full py-12 flex flex-col items-center justify-center text-center space-y-4 bg-gray-50 dark:bg-[#121212] rounded-xl border border-dashed border-gray-300 dark:border-gray-800"
                            >
                                <div className="p-4 rounded-full bg-gray-100 dark:bg-[#1a1a1a]">
                                    <Filter className="text-gray-400" size={32} />
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-gray-900 dark:text-white">{t.noElections || "No elections found"}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{t.noElectionsSub || "Try adjusting filters."}</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>

        </div>
      </div>
    </div>
  );
}
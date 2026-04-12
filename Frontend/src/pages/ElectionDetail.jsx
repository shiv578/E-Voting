import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Calendar, Clock, CheckCircle2, AlertCircle, 
  Vote, BarChart2, User, Loader2, Share2, ExternalLink,
  ShieldCheck, Check, Shield, Globe, ChevronDown, Sun, Moon,
  // New Icons added for the modal
  X, ShieldAlert, Fingerprint, Lock, ChevronRight
} from 'lucide-react';

// Import Shared Contexts
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";

export default function ElectionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [votedCandidateId, setVotedCandidateId] = useState(null); 
  const [canVote, setCanVote] = useState(false);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [votingFor, setVotingFor] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  
  // --- NEW STATE FOR MODAL ---
  const [candidateToConfirm, setCandidateToConfirm] = useState(null);

  // --- USE SHARED CONTEXTS ---
  const { lang, setLang, t, languages } = useLanguage(); 
  const { isDarkMode, toggleTheme } = useTheme();
  
  // Local state for UI
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langMenuRef = useRef(null);

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

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

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await api.get(`/api/elections/${id}`);
        setElection(res.data.election);
        setCandidates(res.data.candidates || []);

        const [voteRes, meRes] = await Promise.all([
          api.get(`/api/elections/${id}/vote-status`),
          api.get("/api/auth/me"),
        ]);

        setHasVoted(!!voteRes.data.hasVoted);
        
        const serverData = voteRes.data;
        const recoveredId = serverData.candidateId || 
                            serverData.votedCandidateId || 
                            serverData.vote?.candidateId || 
                            serverData.vote?.candidate;

        if (serverData.hasVoted && recoveredId) {
            setVotedCandidateId(recoveredId);
        }

        setCanVote(
          meRes.data.user.verificationStatus === "approved" || 
          meRes.data.user.verificationStatus === "verified"
        );
        setCurrentUser(meRes.data.user);

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

  // Check if current user is admin
  const isAdmin = currentUser?.role === 'admin';

  // --- MODIFIED: Execute vote after confirmation ---
  const executeVote = (candidateId) => {
      setCandidateToConfirm(null); // Close modal
      handleVote(candidateId); // Call original logic
  };

  const handleVote = async (candidateId) => {
    // 1. Guard Clause for Admin
    if (isAdmin) {
        setMsg({ type: "error", text: t.adminVoteError });
        return;
    }

    setMsg(null);
    setVotingFor(candidateId);
    
    try {
      const res = await api.post(`/api/elections/${id}/vote`, { candidateId });
      setMsg({ type: "success", text: res.data.msg || t.voteSuccess });
      
      setHasVoted(true);
      setVotedCandidateId(candidateId);

      const detailRes = await api.get(`/api/elections/${id}`);
      setCandidates(detailRes.data.candidates || []);
    } catch (err) {
      console.error(err);
      setMsg({
        type: "error",
        text: err?.response?.data?.msg || err.message,
      });
    } finally {
      setVotingFor(null);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f0f] flex items-center justify-center">
       <div className="flex items-center gap-2 text-[#0B2447] dark:text-yellow-400 font-semibold animate-pulse">
         <Loader2 className="animate-spin" /> {t.loading}
       </div>
    </div>
  );

  if (!election) return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f0f] p-6 text-center text-gray-500">
      {t.notFound}
    </div>
  );

  const now = new Date();
  const locale = lang === 'en' ? 'en-US' : 'en-IN'; 
  const start = election.startTime ? new Date(election.startTime) : null;
  const end = election.endTime ? new Date(election.endTime) : null;

  const isCompleted = end && now > end;
  const isNotStarted = start && now < start;
  const isActive = !isCompleted && !isNotStarted;
  
  const canSeeVotes = isCompleted || isAdmin;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f0f] pb-20 transition-colors duration-500 font-sans">

      <div className="container mx-auto px-4 max-w-[1400px] mt-8">
        
        {/* --- Hero Section --- */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#1a1a1a] rounded-3xl border border-gray-200 dark:border-gray-800 p-8 shadow-sm relative overflow-hidden mb-12"
        >
          <div className={`absolute top-0 left-0 bottom-0 w-2 ${
            isActive ? 'bg-gradient-to-b from-green-400 to-green-600' : isCompleted ? 'bg-gray-500' : 'bg-blue-500'
          }`}></div>

          <div className="relative z-10 flex flex-col justify-between gap-8 md:flex-row">
            <div className="max-w-2xl space-y-6">
              <div className="space-y-2">
                  <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border flex items-center gap-2 w-fit ${
                        isActive
                          ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
                          : isCompleted
                          ? "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700"
                          : "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                      }`}>
                        {isActive && <span className="relative flex w-2 h-2">
                          <span className="absolute inline-flex w-full h-full bg-green-400 rounded-full opacity-75 animate-ping"></span>
                          <span className="relative inline-flex w-2 h-2 bg-green-500 rounded-full"></span>
                        </span>}
                        {isCompleted ? t.completed : isActive ? t.active : t.upcoming}
                      </span>
                      <span className="text-xs font-medium text-gray-400">{t.id}: {election._id.slice(-6).toUpperCase()}</span>
                  </div>
                  
                  <h1 className="text-3xl font-black leading-tight tracking-tight text-gray-900 md:text-5xl dark:text-white">
                    {election.title}
                  </h1>
              </div>
              
              <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-400">
                {election.description}
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                  {start && (
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-[#222] px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-800">
                    <div className="p-2 bg-white rounded-lg shadow-sm dark:bg-black">
                       <Calendar size={16} className="text-gray-500" />
                    </div>
                    <div>
                       <p className="text-[10px] font-bold text-gray-400 uppercase">{t.starts}</p>
                       <p className="font-semibold">{start.toLocaleString(locale)}</p>
                    </div>
                  </div>
                  )}
                  {end && (
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-[#222] px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-800">
                    <div className="p-2 bg-white rounded-lg shadow-sm dark:bg-black">
                       <Clock size={16} className="text-gray-500" />
                    </div>
                    <div>
                       <p className="text-[10px] font-bold text-gray-400 uppercase">{t.ends}</p>
                       <p className="font-semibold">{end.toLocaleString(locale)}</p>
                    </div>
                  </div>
                  )}
              </div>
            </div>
            
            <div className="flex-col items-end justify-center hidden md:flex">
              <div className="flex items-center justify-center w-24 h-24 transition-transform transform shadow-lg bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl rotate-3 hover:rotate-6">
                <Vote size={40} className="text-white" />
              </div>
              <p className="mt-4 text-xs font-bold tracking-widest text-gray-400 uppercase">{t.officialBallot}</p>
            </div>
          </div>
        </motion.div>

        {/* --- Messages --- */}
        <AnimatePresence>
          {msg && (
             <motion.div 
               initial={{ opacity: 0, height: 0, marginBottom: 0 }}
               animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
               className={`p-4 rounded-xl flex items-center gap-3 border-l-4 shadow-sm mb-6 ${
                 msg.type === "success" 
                   ? "bg-green-50 text-green-800 border-green-500 dark:bg-green-900/20 dark:text-green-400" 
                   : "bg-red-50 text-red-800 border-red-500 dark:bg-red-900/20 dark:text-red-400"
               }`}
             >
                {msg.type === "success" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                {msg.text}
             </motion.div>
          )}
          
          {isAdmin && (
             <motion.div initial={{opacity:0}} animate={{opacity:1}} className="flex items-center gap-3 p-4 mb-8 text-blue-800 border border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-900/10 dark:text-blue-200 dark:border-blue-900/30">
                <Shield size={20} />
                <span>{t.adminModeMsg}</span>
             </motion.div>
          )}

          {!canVote && !isAdmin && (
             <motion.div initial={{opacity:0}} animate={{opacity:1}} className="flex items-center gap-2 p-4 mb-8 text-yellow-800 border border-yellow-200 rounded-lg bg-yellow-50 dark:bg-yellow-900/10 dark:text-yellow-200 dark:border-yellow-900/30">
                <AlertCircle size={20} />
                <span>{t.verifyMsg} <span className="font-bold underline">{t.verifiedLink}</span></span>
             </motion.div>
          )}
        </AnimatePresence>

        {/* --- Candidates Grid --- */}
        <div className="space-y-6">
          <div className="flex items-end justify-between px-2">
             <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gray-900 text-white dark:bg-yellow-500 dark:text-black rounded-xl shadow-sm">
                   <User size={20} />
                </div>
                <div>
                   <h2 className="text-2xl font-black text-gray-900 dark:text-white">{t.candidates}</h2>
                   <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t.selectCandidate}</p>
                </div>
             </div>
             <div className="hidden px-3 py-1 text-xs font-bold tracking-widest text-gray-400 uppercase border border-gray-200 rounded-full md:block dark:border-zinc-800">
                {candidates.length} {t.qualified}
             </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
            {candidates.length === 0 ? (
                <div className="col-span-full py-16 px-6 text-center bg-white dark:bg-[#1a1a1a] rounded-3xl border-2 border-dashed border-gray-200 dark:border-zinc-800 flex flex-col items-center justify-center gap-4">
                   <div className="p-4 text-gray-400 rounded-full bg-gray-50 dark:bg-zinc-800">
                      <User size={32} />
                   </div>
                   <div className="space-y-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t.noCandidates}</h3>
                      <p className="max-w-sm mx-auto text-gray-500 dark:text-gray-400">{t.noCandidatesDesc}</p>
                   </div>
                </div>
            ) : (
                candidates.map((candidate, index) => {
                  const isSelected = votedCandidateId === candidate._id; 
                  const isVoting = votingFor === candidate._id;
                  
                  const isDisabled = !isActive || (!canVote) || (hasVoted && !isSelected) || isAdmin;

                  return (
                    <motion.div
                      key={candidate._id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`group relative flex flex-col overflow-hidden rounded-3xl border-2 transition-all duration-300 ${
                         isSelected
                           ? "bg-green-50/50 dark:bg-[#1a1a1a] border-green-500 dark:border-green-500 shadow-xl shadow-green-500/10 scale-[1.02]"
                           : "bg-white dark:bg-[#151515] border-gray-200 dark:border-zinc-800 shadow-sm dark:shadow-none hover:border-gray-300 dark:hover:border-zinc-600 hover:shadow-2xl hover:shadow-gray-200/50 dark:hover:shadow-none hover:-translate-y-1"
                      }`}
                    >
                       <div className="relative z-10 flex flex-col flex-1 p-8">
                          <div className="flex items-start justify-between mb-6">
                             {/* Avatar */}
                             <div className="relative w-20 h-20 rounded-2xl bg-gray-50 dark:bg-[#222] p-1.5 shadow-sm border border-gray-100 dark:border-zinc-800">
                                <div className="w-full h-full bg-white dark:bg-[#1a1a1a] rounded-xl flex items-center justify-center overflow-hidden">
                                   {candidate.iconUrl ? (
                                     <img src={`${API_BASE}${candidate.iconUrl}`} alt={candidate.name} className="object-cover w-full h-full" />
                                   ) : (
                                     <User size={32} className="text-gray-300 dark:text-gray-500" />
                                   )}
                                </div>
                                {isSelected && (
                                    <div className="absolute -top-2 -right-2 bg-green-500 text-white p-1.5 rounded-full shadow-lg border-2 border-white dark:border-[#151515]">
                                        <ShieldCheck size={14} fill="currentColor" />
                                    </div>
                                )}
                             </div>

                             {/* Party Badge */}
                             <div className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                                 isSelected 
                                   ? 'bg-green-100 text-green-700 border-green-200' 
                                   : 'bg-gray-50 dark:bg-black border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-gray-400'
                             }`}>
                                {candidate.party}
                             </div>
                          </div>

                          <div className="space-y-3">
                             <h3 className="text-2xl font-black text-gray-900 dark:text-white group-hover:text-[#0B2447] dark:group-hover:text-yellow-400 transition-colors">
                                {candidate.name}
                             </h3>
                             <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400 line-clamp-3">
                                {candidate.description || t.noManifesto}
                             </p>
                             
                             <button className="flex items-center gap-1.5 text-xs font-bold text-[#0B2447] dark:text-white hover:underline underline-offset-4 decoration-2 decoration-yellow-500 transition-all pt-1">
                                {t.readManifesto} <ExternalLink size={12} className="text-yellow-500" />
                             </button>
                          </div>

                          {/* Vote Count (Only if allowed) */}
                          {canSeeVotes && (
                              <div className="flex items-center gap-3 pt-6 mt-auto">
                                <div className="flex-1 h-px bg-gray-100 dark:bg-zinc-800"></div>
                                <div className="flex items-center gap-2 font-mono text-xs font-bold text-gray-500 dark:text-gray-400">
                                  <BarChart2 size={14} />
                                  <span>{candidate.votesCount || 0} {t.votes}</span>
                                </div>
                              </div>
                          )}
                       </div>

                       {/* Footer Action Area */}
                       <div className={`p-4 border-t ${
                          isSelected 
                            ? 'bg-green-50/50 dark:bg-green-900/10 border-green-100 dark:border-green-900/30' 
                            : 'bg-gray-50/80 dark:bg-[#1a1a1a] border-gray-100 dark:border-zinc-800'
                       }`}>
                          {isSelected ? (
                              <div className="w-full py-3.5 rounded-xl bg-green-500 text-white font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-green-500/20">
                                 <Check size={18} strokeWidth={3} /> {t.votedSuccess}
                              </div>
                          ) : (
                              <button
                                 /* MODIFIED: Set candidate to confirm instead of direct vote */
                                 onClick={() => setCandidateToConfirm(candidate)}
                                 disabled={isDisabled}
                                 className={`w-full py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2 shadow-sm ${
                                    isDisabled 
                                       ? "bg-gray-200 dark:bg-zinc-800 text-gray-400 dark:text-zinc-500 cursor-not-allowed border border-transparent"
                                       : "bg-[#0B2447] text-white hover:bg-[#1a3a5e] dark:bg-white dark:text-black dark:hover:bg-gray-200 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                                 }`}
                              >
                                 {isVoting ? (
                                    <>
                                       <Loader2 size={16} className="animate-spin" /> {t.confirming}
                                    </>
                                 ) : (
                                    <>
                                       {isAdmin ? (
                                          <span className="flex items-center gap-2 opacity-70"><Shield size={14}/> {t.adminViewOnly}</span>
                                       ) : hasVoted ? (
                                          t.unavailable
                                       ) : isActive ? (
                                           /* Added ChevronRight icon here */
                                          <span className="flex items-center gap-1">
                                            {t.voteFor} {candidate.name.split(' ')[0]} <ChevronRight size={14} className="ml-1" />
                                          </span>
                                       ) : (
                                          t.electionClosed
                                       )}
                                    </>
                                 )}
                              </button>
                          )}
                       </div>
                    </motion.div>
                  );
                })
            )}
          </div>
        </div>

      </div>

      {/* --- CONFIRM VOTE MODAL (NEW) --- */}
      <AnimatePresence>
         {candidateToConfirm && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
               {/* Backdrop */}
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 onClick={() => setCandidateToConfirm(null)}
                 className="absolute inset-0 bg-black/60 backdrop-blur-sm"
               />

               {/* Modal Content */}
               <motion.div
                 initial={{ opacity: 0, scale: 0.9, y: 20 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.9, y: 20 }}
                 className="relative w-full max-w-lg bg-white dark:bg-[#1a1a1a] rounded-[32px] overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800"
               >
                  <div className="absolute z-10 top-4 right-4">
                     <button 
                       onClick={() => setCandidateToConfirm(null)}
                       className="p-2 text-gray-400 transition-colors hover:text-black dark:hover:text-white"
                     >
                       <X size={20} />
                     </button>
                  </div>

                  <div className="flex flex-col items-center p-8 text-center">
                     {/* Identity Header */}
                     <div className="mb-6 space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-yellow-200 dark:border-yellow-500/20">
                           <ShieldAlert size={12} /> Confirm Your Choice
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white">Review Selection</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Please confirm that you intend to cast your vote for the following candidate.</p>
                     </div>

                     {/* Candidate Profile Card (Mini) */}
                     <div className="w-full p-6 rounded-2xl bg-gradient-to-br from-[#0B2447] to-blue-900 dark:from-[#222] dark:to-black mb-8 shadow-xl flex items-center gap-6 border border-gray-200 dark:border-gray-800">
                        <div className="w-20 h-20 p-1 bg-white rounded-2xl dark:bg-black shrink-0">
                           <div className="w-full h-full bg-gray-100 dark:bg-[#111] rounded-xl flex items-center justify-center overflow-hidden">
                              {candidateToConfirm.iconUrl ? (
                                 <img src={`${API_BASE}${candidateToConfirm.iconUrl}`} alt={candidateToConfirm.name} className="object-cover w-full h-full rounded-xl" />
                              ) : (
                                 <User size={32} className="text-gray-400" />
                              )}
                           </div>
                        </div>
                        <div className="text-left text-white">
                           <h3 className="text-xl font-black">{candidateToConfirm.name}</h3>
                           <p className="text-xs font-bold tracking-wider uppercase opacity-80">{candidateToConfirm.party}</p>
                           <div className="mt-2 flex items-center gap-1.5 text-[10px] font-mono bg-white/20 px-2 py-0.5 rounded-md w-fit">
                              <Fingerprint size={10} /> ID Verified
                           </div>
                        </div>
                     </div>

                     {/* Security Notice */}
                     <div className="flex w-full gap-3 p-4 mb-8 text-left border border-gray-100 bg-gray-50 dark:bg-black/20 dark:border-gray-800 rounded-2xl">
                        <Lock size={20} className="text-gray-400 shrink-0 mt-0.5" />
                        <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                           Once confirmed, your vote is <span className="font-bold text-gray-900 underline dark:text-white decoration-yellow-500/50 decoration-2">irreversible</span>. It will be encrypted and submitted anonymously.
                        </p>
                     </div>

                     {/* Actions */}
                     <div className="flex flex-col w-full gap-3 sm:flex-row">
                        <button 
                          onClick={() => setCandidateToConfirm(null)}
                          className="flex-1 px-6 py-4 text-sm font-bold text-gray-700 transition-all bg-gray-100 rounded-2xl dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                        >
                           Go Back
                        </button>
                        <button 
                          onClick={() => executeVote(candidateToConfirm._id)}
                          className="flex-[1.5] py-4 px-6 rounded-2xl bg-[#0B2447] dark:bg-white text-white dark:text-black font-black text-sm shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 group/confirm"
                        >
                           Confirm Vote <CheckCircle2 size={18} className="transition-transform group-hover/confirm:scale-110" />
                        </button>
                     </div>
                  </div>
                  
                  {/* Decorative Scanline */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 opacity-50 bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

    </div>
  );
}
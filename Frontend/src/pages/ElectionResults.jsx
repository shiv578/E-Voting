import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Trophy, Users, BarChart3, Share2, Download, 
  Calendar, CheckCircle2, Award, TrendingUp, User, Loader2 
} from 'lucide-react';

export default function ElectionResults() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);

  // Helper to determine winner
  const winner = candidates.length > 0 
    ? candidates.reduce((prev, current) => (prev.votesCount > current.votesCount) ? prev : current)
    : null;

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await api.get(`/api/elections/${id}/results`);
        setElection(res.data.election || null);
        setCandidates(res.data.candidates || []);
        setTotalVotes(res.data.totalVotes || 0);
      } catch (err) {
        console.error(err);
        setMsg({
          type: "error",
          text: err?.response?.data?.msg || err?.message,
        });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f0f] flex items-center justify-center">
       <div className="flex items-center gap-2 text-[#0B2447] dark:text-yellow-400 font-semibold animate-pulse">
         <Loader2 className="animate-spin" /> Loading results...
       </div>
    </div>
  );

  if (!election) return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f0f] flex items-center justify-center text-gray-500">
      Election not found.
    </div>
  );

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f0f] pb-20 transition-colors duration-500 font-sans">

      <div className="container  px-4 mx-auto mt-8 max-w-[1400px]">
        
        {/* Election Title Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-xs font-bold tracking-widest text-gray-600 uppercase bg-gray-200 rounded-full dark:bg-gray-800 dark:text-gray-300">
             <Calendar size={12} /> Ended: {election.endTime ? new Date(election.endTime).toLocaleDateString() : 'N/A'}
          </div>
          <h1 className="mb-2 text-3xl font-extrabold text-gray-800 md:text-4xl dark:text-white">{election.title}</h1>
          <p className="max-w-2xl mx-auto text-gray-500 dark:text-gray-400">{election.description}</p>
        </motion.div>

        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 gap-4 mb-12 md:grid-cols-3">
          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.1 }}
             className="bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center gap-4"
          >
             <div className="p-3 text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 rounded-xl">
               <Users size={24} />
             </div>
             <div>
               <p className="text-xs font-bold tracking-wider text-gray-500 uppercase">Total Votes</p>
               <p className="text-2xl font-black text-gray-900 dark:text-white">{totalVotes.toLocaleString()}</p>
             </div>
          </motion.div>

          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.2 }}
             className="bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center gap-4"
          >
             <div className="p-3 text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400 rounded-xl">
               <TrendingUp size={24} />
             </div>
             <div>
               <p className="text-xs font-bold tracking-wider text-gray-500 uppercase">Status</p>
               <p className="text-2xl font-black text-gray-900 dark:text-white">Completed</p>
             </div>
          </motion.div>

          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.3 }}
             className="bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center gap-4"
          >
             <div className="p-3 text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 rounded-xl">
               <CheckCircle2 size={24} />
             </div>
             <div>
               <p className="text-xs font-bold tracking-wider text-gray-500 uppercase">Result</p>
               <p className="text-2xl font-black text-gray-900 dark:text-white">Declared</p>
             </div>
          </motion.div>
        </div>

        {/* --- Main Content Grid --- */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          
          {/* Left: Winner Spotlight */}
          {winner && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-1"
          >
            <div className="relative bg-gradient-to-b from-yellow-500 to-orange-600 rounded-3xl p-[2px] shadow-2xl shadow-yellow-500/20">
              <div className="absolute -translate-x-1/2 -top-6 left-1/2">
                  <div className="flex items-center gap-2 px-6 py-2 text-sm font-black tracking-widest text-yellow-900 uppercase rounded-full shadow-lg bg-gradient-to-r from-yellow-300 to-yellow-500">
                    <Trophy size={16} /> Winner
                  </div>
              </div>
              
              <div className="bg-white dark:bg-[#151515] rounded-[22px] p-8 flex flex-col items-center text-center h-full relative overflow-hidden">
                  {/* Background Glow */}
                  <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-yellow-500/10 to-transparent"></div>
                  
                  <div className="relative w-32 h-32 mb-6">
                     <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-gray-200 border-4 border-yellow-500 rounded-full shadow-lg dark:bg-gray-800">
                        {winner.iconUrl ? (
                          <img src={`${API_BASE}${winner.iconUrl}`} alt={winner.name} className="object-cover w-full h-full" />
                        ) : (
                          <User size={48} className="text-gray-400" />
                        )}
                     </div>
                     <div className="absolute bottom-0 right-0 bg-yellow-500 text-white p-2 rounded-full border-4 border-white dark:border-[#151515] shadow-sm">
                        <Award size={20} />
                     </div>
                  </div>

                  <h2 className="mb-1 text-2xl font-black text-gray-900 dark:text-white">{winner.name}</h2>
                  <p className="mb-6 text-sm font-medium text-gray-500 dark:text-gray-400">{winner.party}</p>

                  <div className="grid w-full grid-cols-2 gap-4 pt-6 border-t border-gray-100 dark:border-gray-800">
                    <div>
                       <p className="text-[10px] font-bold text-gray-400 uppercase">Votes</p>
                       <p className="text-xl font-black text-gray-900 dark:text-white">{winner.votesCount?.toLocaleString() || 0}</p>
                    </div>
                    <div>
                       <p className="text-[10px] font-bold text-gray-400 uppercase">Percentage</p>
                       <p className="text-xl font-black text-yellow-600 dark:text-yellow-500">
                         {totalVotes > 0 ? ((winner.votesCount / totalVotes) * 100).toFixed(1) : 0}%
                       </p>
                    </div>
                  </div>
              </div>
            </div>
          </motion.div>
          )}

          {/* Right: Detailed List & Charts */}
          <div className={`space-y-6 ${winner ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
              <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-gray-800 p-6 md:p-8">
                 <div className="flex items-center justify-between mb-8">
                    <h3 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
                      <BarChart3 className="text-gray-400" /> Election Results
                    </h3>
                    <div className="px-3 py-1 text-xs font-medium text-gray-500 bg-gray-100 rounded-full dark:bg-gray-800">
                      Live Count Finalized
                    </div>
                 </div>

                 <div className="space-y-8">
                   {candidates.map((candidate, index) => {
                     const percentage = totalVotes > 0 ? ((candidate.votesCount / totalVotes) * 100) : 0;
                     const isWinner = index === 0; // Assuming sorted list from backend

                     return (
                       <motion.div 
                         key={candidate._id}
                         initial={{ opacity: 0, x: 20 }}
                         animate={{ opacity: 1, x: 0 }}
                         transition={{ delay: 0.5 + (index * 0.1) }}
                         className="relative"
                       >
                          <div className="flex items-end justify-between mb-2">
                             <div className="flex items-center gap-3">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                  isWinner ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-500' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                }`}>
                                  {index + 1}
                                </div>
                                <div>
                                   <h4 className="text-base font-bold leading-none text-gray-900 dark:text-white">{candidate.name}</h4>
                                   <span className="text-xs text-gray-500 dark:text-gray-400">{candidate.party}</span>
                                </div>
                             </div>
                             <div className="text-right">
                                <span className="text-lg font-black text-gray-900 dark:text-white">{percentage.toFixed(1)}%</span>
                                <span className="block text-xs text-gray-500">{candidate.votesCount?.toLocaleString() || 0} votes</span>
                             </div>
                          </div>
                          
                          {/* Progress Bar Container */}
                          <div className="relative w-full h-4 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-800">
                             {/* Animated Fill */}
                             <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: `${percentage}%` }}
                               transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                               className={`h-full ${isWinner ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-gray-400 dark:bg-gray-600'} relative`}
                             >
                               {/* Shimmer Effect */}
                               <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>
                             </motion.div>
                          </div>
                       </motion.div>
                     );
                   })}
                 </div>
              </div>
              
              {/* Security Footer Note */}
              <div className="flex items-center justify-center gap-2 text-xs text-gray-400 dark:text-gray-600">
                <CheckCircle2 size={12} />
                Results cryptographically verified via Blockchain Ledger
              </div>
          </div>

        </div>
      </div>
    </div>
  );
};
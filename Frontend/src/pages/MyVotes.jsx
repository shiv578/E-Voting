import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import { 
  ArrowLeft, 
  History, 
  Vote, 
  User, 
  Calendar, 
  ExternalLink, 
  Loader2, 
  AlertCircle 
} from "lucide-react";

export default function MyVotes() {
  const navigate = useNavigate();
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        // ensure logged in
        await api.get("/api/auth/me");

        const res = await api.get("/api/votes/my");
        setVotes(res.data.votes || []);
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

  if (loading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f0f] flex items-center justify-center">
       <div className="flex items-center gap-2 text-[#0B2447] dark:text-yellow-400 font-semibold animate-pulse">
         <Loader2 className="animate-spin" /> Loading voting history...
       </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f0f] p-4 md:p-8 transition-colors duration-200 font-sans">
      {/* Container Width: 1400px */}
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
             <div className="h-12 w-12 rounded-full bg-[#0B2447] dark:bg-yellow-400 flex items-center justify-center text-white dark:text-black shadow-lg">
                <History size={24} />
             </div>
             <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Voting History</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Record of all elections you have participated in
                </p>
             </div>
          </div>
          
          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#0B2447] bg-white border border-[#0B2447] rounded-lg hover:bg-[#0B2447] hover:text-white dark:bg-zinc-800 dark:text-yellow-400 dark:border-yellow-400 dark:hover:bg-yellow-400 dark:hover:text-black transition-all shadow-sm"
          >
            <ArrowLeft size={16} />
            Back to Profile
          </button>
        </div>

        {/* --- MESSAGES --- */}
        {msg && (
           <div className={`p-4 rounded-lg flex items-center gap-2 border-l-4 shadow-sm ${
               msg.type === "success"
               ? "bg-green-50 text-green-800 border-green-500 dark:bg-green-900/20 dark:text-green-400"
               : "bg-red-50 text-red-800 border-red-500 dark:bg-red-900/20 dark:text-red-400"
           }`}>
             <AlertCircle size={20}/>
             {msg.text}
           </div>
        )}

        {/* --- VOTES TABLE CARD --- */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl shadow-md border border-gray-200 dark:border-zinc-800 overflow-hidden transition-colors duration-200">
           
           {votes.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center text-gray-500 dark:text-gray-400">
                 <div className="flex items-center justify-center w-16 h-16 mb-4 bg-gray-100 rounded-full dark:bg-zinc-800">
                    <Vote size={32} className="opacity-50" />
                 </div>
                 <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No Votes Yet</h3>
                 <p className="max-w-sm mt-2 text-sm">
                    You haven't participated in any elections yet. Check the dashboard for upcoming voting opportunities.
                 </p>
                 <Link 
                    to="/dashboard"
                    className="mt-6 px-4 py-2 text-sm font-medium text-white bg-[#0B2447] rounded hover:bg-[#1a3a5e] dark:bg-yellow-400 dark:text-black dark:hover:bg-yellow-300 transition-colors"
                 >
                    Go to Dashboard
                 </Link>
              </div>
           ) : (
              <div className="overflow-x-auto">
                 <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-[#222] border-b border-gray-200 dark:border-zinc-700">
                       <tr>
                          <th className="px-6 py-4 font-semibold text-left text-gray-600 dark:text-gray-300">Election</th>
                          <th className="px-6 py-4 font-semibold text-left text-gray-600 dark:text-gray-300">Candidate Selected</th>
                          <th className="hidden px-6 py-4 font-semibold text-left text-gray-600 dark:text-gray-300 md:table-cell">Party</th>
                          <th className="px-6 py-4 font-semibold text-left text-gray-600 dark:text-gray-300">Voted At</th>
                           <th className="px-6 py-4 font-semibold text-center text-gray-600 dark:text-gray-300">Results</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                       {votes.map((v) => {
                          const election = v.election || {};
                          const candidate = v.candidate || {};
                          const votedAt = v.createdAt
                             ? new Date(v.createdAt).toLocaleString()
                             : new Date(parseInt(v._id.substring(0, 8), 16) * 1000).toLocaleString(); // fallback

                          return (
                             <tr key={v._id} className="hover:bg-gray-50 dark:hover:bg-[#1f1f1f] transition-colors">
                                <td className="px-6 py-4">
                                   <div className="flex items-center gap-3">
                                      <div className="flex items-center justify-center w-8 h-8 text-blue-600 rounded-full bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400">
                                         <Vote size={14} />
                                      </div>
                                      <span className="font-medium text-gray-900 dark:text-white">
                                         {election.title || <span className="italic text-gray-400">Deleted Election</span>}
                                      </span>
                                   </div>
                                </td>
                                <td className="px-6 py-4">
                                   <div className="flex items-center gap-2">
                                      <User size={14} className="text-gray-400" />
                                      <span className="font-medium text-gray-700 dark:text-gray-300">
                                         {candidate.name || <span className="italic text-gray-400">Unknown</span>}
                                      </span>
                                   </div>
                                </td>
                                <td className="hidden px-6 py-4 md:table-cell">
                                   <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-zinc-800 dark:text-gray-300">
                                      {candidate.party || "—"}
                                   </span>
                                </td>
                                <td className="px-6 py-4">
                                   <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                      <Calendar size={14} />
                                      {votedAt}
                                   </div>
                                </td>
                              
                             </tr>
                          );
                       })}
                    </tbody>
                 </table>
              </div>
           )}
        </div>

      </div>
    </div>
  );
}
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, HelpCircle, ShieldCheck, UserCheck, EyeOff, 
  AlertTriangle, FileText, Lock, Info, ChevronDown, Search, 
  Check, AlertOctagon, Terminal
} from "lucide-react";

export default function HelpFAQ() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [openSection, setOpenSection] = useState(0); // Default open first item

  const toggleSection = (index) => {
    setOpenSection(openSection === index ? null : index);
  };

  const faqs = [
    {
      id: 1,
      question: "How to use this E-Voting System?",
      icon: <FileText size={20} />,
      color: "blue",
      content: (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Follow these simple steps to cast your secure vote:</p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
             <StepCard number="01" title="Register" desc="Create an account with your name, email, and password." />
             <StepCard number="02" title="KYC Verification" desc="Upload your ID document. An admin will verify your details." />
             <StepCard number="03" title="Wait for Approval" desc="Your status will be 'Pending' until reviewed. Once 'Approved', you can proceed." />
             <StepCard number="04" title="Cast Vote" desc="Navigate to active elections and cast exactly one vote per election." />
          </div>
        </div>
      )
    },
    {
      id: 2,
      question: "Why do we need KYC / ID verification?",
      icon: <ShieldCheck size={20} />,
      color: "purple",
      content: (
        <div className="space-y-4">
           <p className="text-sm text-gray-600 dark:text-gray-400">
             This project focuses on <strong>secure, fair elections</strong>. Verification helps us:
           </p>
           <ul className="space-y-2">
              <ListItem text="Prevent fake or duplicate accounts from voting." />
              <ListItem text="Ensure each real student/citizen gets exactly one vote." />
              <ListItem text="Allow admins to audit suspicious activity if needed." />
           </ul>
           <div className="flex gap-3 p-3 mt-4 border border-yellow-200 rounded-lg bg-yellow-50 dark:bg-yellow-500/10 dark:border-yellow-500/20">
              <AlertTriangle className="text-yellow-600 dark:text-yellow-500 shrink-0" size={20} />
              <p className="text-xs font-medium text-yellow-800 dark:text-yellow-500">
                <strong>Privacy Note:</strong> Your actual ID number is not stored directly – only a <span className="underline">secure hash</span> is stored in the database for uniqueness checking.
              </p>
           </div>
        </div>
      )
    },
    {
      id: 3,
      question: "Who verifies my account?",
      icon: <UserCheck size={20} />,
      color: "green",
      content: (
        <div className="space-y-4">
           <p className="text-sm text-gray-600 dark:text-gray-400">
             Only users with the <strong>Admin Role</strong> (e.g., faculty members or election organizers) can:
           </p>
           <ul className="space-y-2">
              <ListItem text="View your uploaded ID document." />
              <ListItem text="Approve or reject your account based on eligibility." />
              <ListItem text="See system audit logs for security purposes." />
           </ul>
           <p className="text-xs italic text-gray-500 dark:text-gray-500">
             Note: Normal voters cannot see other people's IDs or personal details.
           </p>
        </div>
      )
    },
    {
      id: 4,
      question: "Why can't I see live vote counts?",
      icon: <EyeOff size={20} />,
      color: "orange",
      content: (
        <div className="space-y-4">
           <p className="text-sm text-gray-600 dark:text-gray-400">
             To keep the election <strong>fair</strong> and avoid bias (bandwagon effect):
           </p>
           <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg bg-gray-50 dark:bg-white/5 dark:border-white/10">
                 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                 <div className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-bold text-gray-900 dark:text-white">Active Election:</span> Voters <span className="font-bold text-red-500">cannot see</span> the number of votes.
                 </div>
              </div>
              <div className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg bg-gray-50 dark:bg-white/5 dark:border-white/10">
                 <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                 <div className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-bold text-gray-900 dark:text-white">Ended Election:</span> The results page becomes available with total counts and winners.
                 </div>
              </div>
           </div>
        </div>
      )
    },
    {
      id: 5,
      question: "Security Protocols",
      icon: <Lock size={20} />,
      color: "indigo",
      content: (
        <div className="space-y-4">
           <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <SecurityBadge title="Bcrypt Hashing" desc="Passwords stored securely" />
              <SecurityBadge title="JWT Tokens" desc="API requests authenticated" />
              <SecurityBadge title="Audit Logging" desc="Full tracking for admins" />
           </div>
           <p className="text-xs text-gray-500">
             You can vote <strong>only once</strong> per election. If you try again, the system will block it via strict database rules.
           </p>
        </div>
      )
    },
    {
      id: 6,
      question: "Troubleshooting & Errors",
      icon: <AlertOctagon size={20} />,
      color: "red",
      content: (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
           <ErrorCard 
             title="PROBLEM: I CAN'T VOTE" 
             desc="Check if your status is approved. If pending, please wait for verification." 
           />
           <ErrorCard 
             title="PROBLEM: 'ENDED' BUTTON" 
             desc="The election time is over. You can only view results now." 
           />
           <ErrorCard 
             title="PROBLEM: 'ALREADY VOTED'" 
             desc="You have already cast your vote for this election. Duplicate votes are blocked." 
           />
           <ErrorCard 
             title="PROBLEM: LOGGED OUT" 
             desc="Your session expired for security. Please log in again." 
           />
        </div>
      )
    }
  ];

  const filteredFaqs = faqs.filter(f => 
    f.question.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f0f] p-4 md:p-8 transition-colors duration-200 font-sans">
      {/* Container width set to 1400px */}
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* --- HEADER --- */}
     

        {/* --- SEARCH --- */}
        <div className="relative mb-6">
             <Search className="absolute text-gray-400 -translate-y-1/2 left-4 top-1/2" size={18} />
             <input 
               type="text" 
               placeholder="Search help topics..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full pl-11 pr-4 py-3 rounded-xl bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-zinc-800 shadow-sm focus:outline-none focus:border-[#0B2447] dark:focus:border-yellow-400 transition-all"
             />
        </div>

        {/* --- MAIN CONTENT LIST --- */}
        <div className="space-y-4">
            <AnimatePresence>
               {filteredFaqs.map((faq, index) => (
                  <FAQItem 
                    key={faq.id} 
                    faq={faq} 
                    isOpen={openSection === index} 
                    onClick={() => toggleSection(index)}
                    index={index}
                  />
               ))}
            </AnimatePresence>
            
            {filteredFaqs.length === 0 && (
               <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-zinc-800">
                  <p>No results found for "{searchQuery}"</p>
               </div>
            )}
        </div>

        {/* --- FOOTER CARD --- */}
        <div className="relative p-6 mt-8 overflow-hidden text-center text-white shadow-lg bg-gradient-to-br from-gray-900 to-black rounded-2xl">
           <div className="absolute top-0 right-0 w-64 h-64 -translate-y-1/2 rounded-full bg-yellow-500/10 blur-3xl translate-x-1/3"></div>
           <div className="relative z-10">
              <h3 className="mb-2 text-lg font-bold">Still need help?</h3>
              <p className="mb-4 text-sm text-gray-400">Our support team is available 24/7 for election emergencies.</p>
              <button 
                onClick={() => navigate('/contact')}
                className="px-6 py-2 text-sm font-bold text-black transition-colors bg-white rounded-lg hover:bg-gray-100"
              >
                 Contact Support
              </button>
           </div>
        </div>

      </div>
    </div>
  );
}

const FAQItem = ({ faq, isOpen, onClick, index }) => {
   const colors = {
      blue: "text-blue-500 bg-blue-50 dark:bg-blue-900/20",
      purple: "text-purple-500 bg-purple-50 dark:bg-purple-900/20",
      green: "text-green-500 bg-green-50 dark:bg-green-900/20",
      orange: "text-orange-500 bg-orange-50 dark:bg-orange-900/20",
      indigo: "text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20",
      red: "text-red-500 bg-red-50 dark:bg-red-900/20",
   };

   return (
      <motion.div 
         initial={{ opacity: 0, y: 10 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: index * 0.05 }}
         className={`border rounded-2xl transition-all duration-300 overflow-hidden ${
            isOpen 
               ? 'bg-white dark:bg-[#1a1a1a] border-yellow-500/30 shadow-lg shadow-yellow-500/5' 
               : 'bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-gray-700'
         }`}
      >
         <button 
            onClick={onClick}
            className="flex items-center justify-between w-full p-5 text-left focus:outline-none"
         >
            <div className="flex items-center gap-4">
               <div className={`p-2.5 rounded-xl ${colors[faq.color]}`}>
                  {faq.icon}
               </div>
               <span className={`font-bold text-base md:text-lg ${isOpen ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                  {faq.question}
               </span>
            </div>
            <div className={`p-1 rounded-full transition-transform duration-300 ${isOpen ? 'rotate-180 bg-gray-100 dark:bg-white/10' : ''}`}>
               <ChevronDown size={20} className="text-gray-500" />
            </div>
         </button>
         
         <AnimatePresence>
            {isOpen && (
               <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
               >
                  <div className="p-5 pt-0 pl-[4.5rem]">
                     {faq.content}
                  </div>
               </motion.div>
            )}
         </AnimatePresence>
      </motion.div>
   )
}

const StepCard = ({ number, title, desc }) => (
  <div className="bg-gray-50 dark:bg-[#111] p-4 rounded-xl border border-gray-100 dark:border-zinc-800 flex flex-col gap-2">
     <span className="text-2xl font-black text-gray-200 dark:text-zinc-800">{number}</span>
     <h4 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h4>
     <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">{desc}</p>
  </div>
);

const ListItem = ({ text }) => (
   <li className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
      <Check size={16} className="text-green-500 shrink-0 mt-0.5" />
      <span>{text}</span>
   </li>
);

const SecurityBadge = ({ title, desc }) => (
   <div className="p-3 text-center border border-indigo-100 rounded-lg bg-indigo-50 dark:bg-indigo-900/10 dark:border-indigo-900/20">
      <p className="text-sm font-bold text-indigo-700 dark:text-indigo-400">{title}</p>
      <p className="text-[10px] text-indigo-600/70 dark:text-indigo-400/70 uppercase tracking-wide">{desc}</p>
   </div>
);

const ErrorCard = ({ title, desc }) => (
   <div className="relative p-4 overflow-hidden border border-red-100 bg-red-50 dark:bg-red-900/10 dark:border-red-900/30 rounded-xl group">
      <div className="absolute top-0 right-0 p-2 transition-opacity opacity-10 group-hover:opacity-20">
         <Terminal size={40} className="text-red-500" />
      </div>
      <p className="mb-1 font-mono text-xs font-bold text-red-700 dark:text-red-400">{title}</p>
      <p className="relative z-10 text-xs leading-relaxed text-red-800/70 dark:text-red-300/70">{desc}</p>
   </div>
);
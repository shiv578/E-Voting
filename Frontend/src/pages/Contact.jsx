import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Mail, Phone, MapPin, Clock, Send, 
  MessageSquare, CheckCircle, AlertCircle, Loader2 
} from 'lucide-react';

// Import Shared Contexts
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext"; 

export default function Contact() {
  const navigate = useNavigate();
  
  // --- USE SHARED CONTEXTS ---
  const { t } = useLanguage(); 
  const { isDarkMode } = useTheme();

  const [form, setForm] = useState({
    name: "",
    email: "",
    category: "",
    subject: "",
    message: "",
  });

  const [submitState, setSubmitState] = useState('idle'); // 'idle' | 'processing' | 'success'
  const [msg, setMsg] = useState(null);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  function validateForm() {
    if (!form.name.trim()) return "Please enter your full name.";
    if (!form.email.trim()) return "Please enter your email address.";
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
    if (!emailOk) return "Please enter a valid email address.";
    if (!form.category) return "Please select a query type.";
    if (!form.subject.trim()) return "Please enter a brief subject.";
    if (!form.message.trim() || form.message.trim().length < 15) {
      return "Please describe your issue (at least 15 characters).";
    }
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg(null);

    const validationError = validateForm();
    if (validationError) {
      setMsg({ type: "error", text: validationError });
      return;
    }

    setSubmitState('processing');
    try {
      await api.post("/api/support/contact", form);
      
      setSubmitState('success');
      setMsg({
        type: "success",
        text: t.querySuccessMsg || "Your message has been submitted.",
      });

      setForm({
        name: "",
        email: "",
        category: "",
        subject: "",
        message: "",
      });
    } catch (err) {
      console.error(err);
      setSubmitState('idle');
      const text = err?.response?.data?.msg || err?.message || "Unable to send your message.";
      setMsg({ type: "error", text });
    }
  }

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f0f] pb-20 transition-colors duration-500 font-sans">
      
      {/* --- Sticky Header --- */}
      <div className="bg-white/80 dark:bg-[#151515]/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
        <div className="container flex items-center justify-between px-4 py-4 mx-auto">
            {/* <button
            onClick={() => navigate("/login")}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm md:text-sm hover:bg-gray-50 dark:bg-yellow-400 dark:text-black dark:hover:bg-yellow-300 transition-all transform hover:-translate-y-0.5"
          >
            <ArrowLeft size={16} />
            {t.backToDash || "Back"}
          </button> */}
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              {t.supportOnline || "Official Support Online"}
          </div>
        </div>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container max-w-6xl px-4 mx-auto mt-8"
      >
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
           
           {/* --- Left Panel: Contact Info --- */}
           <div className="w-full space-y-8 lg:w-1/3">
              <motion.div variants={itemVariants}>
                 <h1 className="mb-2 text-4xl font-extrabold text-gray-900 dark:text-white">
                   {t.contactTitle || "Contact"} <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-500 dark:from-yellow-400 dark:to-orange-500">Support</span>
                 </h1>
                 <p className="text-lg text-gray-500 dark:text-gray-400">
                   {t.contactSub || "We are here to help you."}
                 </p>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-4">
                 <ContactCard 
                   icon={<MapPin size={24} />}
                   title={t.headquarters || "Headquarters"}
                   details={
                     <>
                       National E-Voting Cell, Ministry of Electronics & IT,<br/>
                       Electronics Niketan, New Delhi
                     </>
                   }
                   color="blue"
                 />
                 <ContactCard 
                   icon={<Clock size={24} />}
                   title={t.supportHours || "Support Hours"}
                   details="Mon – Fri, 9:00 AM to 6:00 PM IST"
                   color="orange"
                 />
                 <ContactCard 
                   icon={<Phone size={24} />}
                   title={t.helpline || "Helpline"}
                   details="1800-111-2222"
                   color="green"
                   isLink
                   href="tel:18001112222"
                 />
                 <ContactCard 
                   icon={<Mail size={24} />}
                   title={t.emailSupport || "Email Support"}
                   details="support@e-voting.gov.in"
                   color="purple"
                   isLink
                   href="mailto:support@e-voting.gov.in"
                 />
              </motion.div>

              <motion.div variants={itemVariants} className="p-4 border border-blue-100 rounded-xl bg-blue-50 dark:bg-blue-900/10 dark:border-blue-900/30">
                 <div className="flex gap-3">
                    <AlertCircle size={20} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <p className="text-xs leading-relaxed text-blue-800 dark:text-blue-300">
                       <strong>Note:</strong> {t.urgentNote || "For urgent election-day issues, please call the helpline."}
                    </p>
                 </div>
              </motion.div>
           </div>

           {/* --- Right Panel: Contact Form --- */}
           <motion.div variants={itemVariants} className="w-full lg:w-2/3">
              <div className="bg-white dark:bg-[#151515] rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden relative">
                 
                 {/* Decorative Top Line */}
                 <div className="h-1.5 w-full bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500"></div>

                 <div className="relative z-10 p-8 md:p-10">
                    <div className="flex items-center gap-3 mb-8">
                       <div className="p-3 text-yellow-600 bg-yellow-100 dark:bg-yellow-500/10 dark:text-yellow-500 rounded-2xl">
                          <MessageSquare size={24} />
                       </div>
                       <div>
                          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t.sendMessage || "Send us a Message"}</h2>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{t.fillForm || "Fill out the form below."}</p>
                       </div>
                    </div>

                    {msg && (
                      <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 border-l-4 shadow-sm ${
                        msg.type === "success" 
                          ? "bg-green-50 text-green-800 border-green-500 dark:bg-green-900/20 dark:text-green-400" 
                          : "bg-red-50 text-red-800 border-red-500 dark:bg-red-900/20 dark:text-red-400"
                      }`}>
                        {msg.type === "success" ? <CheckCircle size={20}/> : <AlertCircle size={20}/>}
                        {msg.text}
                      </div>
                    )}

                    {submitState === 'success' ? (
                       <motion.div 
                         initial={{ opacity: 0, scale: 0.9 }}
                         animate={{ opacity: 1, scale: 1 }}
                         className="flex flex-col items-center justify-center py-16 space-y-4 text-center"
                       >
                          <div className="flex items-center justify-center w-20 h-20 mb-4 text-green-600 bg-green-100 rounded-full dark:bg-green-900/20 dark:text-green-500">
                             <CheckCircle size={40} strokeWidth={3} />
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{t.querySubmitted || "Query Submitted!"}</h3>
                          <p className="max-w-md text-gray-500 dark:text-gray-400">
                             {t.querySuccessMsg}
                          </p>
                          <button 
                            onClick={() => {
                               setSubmitState('idle');
                               setMsg(null);
                               setForm({ ...form, subject: '', message: '' });
                            }}
                            className="mt-6 font-bold text-yellow-600 dark:text-yellow-500 hover:underline"
                          >
                             {t.submitAnother || "Submit Another Query"}
                          </button>
                       </motion.div>
                    ) : (
                       <form onSubmit={handleSubmit} className="space-y-6">
                          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                             <div>
                                <label className="block mb-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.fullName || "Full Name"} <span className="text-red-500">*</span></label>
                                <input 
                                  name="name"
                                  value={form.name}
                                  onChange={handleChange}
                                  placeholder="Enter your full name"
                                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-300 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0B2447] dark:focus:ring-yellow-400 focus:border-transparent transition-all"
                                />
                             </div>
                             <div>
                                <label className="block mb-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.emailAddress || "Email Address"} <span className="text-red-500">*</span></label>
                                <input 
                                  name="email"
                                  type="email"
                                  value={form.email}
                                  onChange={handleChange}
                                  placeholder="you@example.com"
                                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-300 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0B2447] dark:focus:ring-yellow-400 focus:border-transparent transition-all"
                                />
                             </div>
                          </div>

                          <div>
                             <label className="block mb-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.queryType || "Query Type"} <span className="text-red-500">*</span></label>
                             <select 
                                name="category"
                                value={form.category}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-300 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0B2447] dark:focus:ring-yellow-400 focus:border-transparent transition-all"
                             >
                                <option value="">{t.selectCategory || "Select a category"}</option>
                                <option value="login">Login / OTP Issue</option>
                                <option value="registration">Registration / KYC Issue</option>
                                <option value="voting">Voting Process Issue</option>
                                <option value="technical">Technical Error</option>
                                <option value="other">Other Inquiry</option>
                             </select>
                          </div>

                          <div>
                             <label className="block mb-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.subject || "Subject"} <span className="text-red-500">*</span></label>
                             <input 
                                name="subject"
                                value={form.subject}
                                onChange={handleChange}
                                placeholder="Brief summary of your issue"
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-300 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0B2447] dark:focus:ring-yellow-400 focus:border-transparent transition-all"
                             />
                          </div>

                          <div>
                             <label className="block mb-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t.description || "Detailed Description"} <span className="text-red-500">*</span></label>
                             <textarea 
                                name="message"
                                value={form.message}
                                onChange={handleChange}
                                rows={5}
                                placeholder="Please describe your issue in detail..."
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-300 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0B2447] dark:focus:ring-yellow-400 focus:border-transparent transition-all resize-y"
                             ></textarea>
                          </div>

                          <div className="flex justify-end pt-4">
                             <button 
                               type="submit" 
                               disabled={submitState === 'processing'}
                               className="flex items-center gap-2 px-8 py-4 text-sm font-bold text-black transition-all bg-yellow-500 shadow-lg hover:bg-yellow-400 rounded-xl shadow-yellow-500/20 hover:shadow-yellow-500/30 hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed"
                             >
                                {submitState === 'processing' ? (
                                   <>
                                     <Loader2 size={18} className="animate-spin" /> {t.sending || "Sending..."}
                                   </>
                                ) : (
                                   <>
                                     {t.submitQuery || "Submit Query"} <Send size={18} />
                                   </>
                                )}
                             </button>
                          </div>
                       </form>
                    )}
                 </div>
              </div>
           </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

// Helper Component for Contact Cards
const ContactCard = ({ icon, title, details, color, isLink, href }) => {
   const colors = {
      blue: "text-blue-600 dark:text-blue-500 bg-blue-100 dark:bg-blue-900/20",
      orange: "text-orange-600 dark:text-orange-500 bg-orange-100 dark:bg-orange-900/20",
      green: "text-green-600 dark:text-green-500 bg-green-100 dark:bg-green-900/20",
      purple: "text-purple-600 dark:text-purple-500 bg-purple-100 dark:bg-purple-900/20",
   };

   const Content = () => (
      <div className="flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-[#151515] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all group">
         <div className={`p-3 rounded-xl ${colors[color]} shrink-0 group-hover:scale-110 transition-transform`}>
            {icon}
         </div>
         <div>
            <h3 className="mb-1 text-sm font-bold text-gray-900 dark:text-white">{title}</h3>
            <div className="text-sm font-medium leading-relaxed text-gray-500 dark:text-gray-400">
               {details}
            </div>
         </div>
      </div>
   );

   if (isLink) {
      return (
         <a href={href} className="block">
            <Content />
         </a>
      );
   }

   return <Content />;
};
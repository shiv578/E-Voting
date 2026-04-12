import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Link } from "react-router-dom";
import { 
  Moon, 
  Sun, 
  LogOut, 
  LayoutDashboard, 
  HelpCircle, 
  UserCircle, 
  Menu, 
  X,
  Globe,
  ChevronDown,
  Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- IMPORT CONTEXTS ---
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { LanguageProvider, useLanguage } from "./context/LanguageContext";

// --- PAGE IMPORTS ---
import Footer from "./components/Footer";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ElectionDetail from "./pages/ElectionDetail";
import ElectionResults from "./pages/ElectionResults";
import Profile from "./pages/Profile";
import Help from "./pages/HelpFAQ";
import AdminPanel from "./pages/AdminPanel";
import Contact from "./pages/Contact";
import MyVotes from './pages/MyVotes';  
import ForgotOtp from "./pages/ForgotOtp";
import VerifyOtp from "./pages/VerifyOtp";
import AdminUserReview from "./pages/AdminUserReview";
import AdminSupport from "./pages/AdminSupport";

// --- NAVBAR COMPONENT ---
const Navbar = () => {
  // 1. Get Contexts
  const { isDarkMode, toggleTheme } = useTheme();
  const { lang, setLang, t, languages } = useLanguage();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  
  const location = useLocation();
  const langMenuRef = useRef(null);

  // 2. Click Outside Logic for Language Menu
  useEffect(() => {
    function handleClickOutside(event) {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target)) {
        setIsLangMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 3. Dynamic Links using Translations
  const navLinks = [
    { name: t.navDashboard, path: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { name: t.navHelp, path: '/help', icon: <HelpCircle size={18} /> },
    { name: t.navContact, path: '/contact', icon: <Phone size={18} /> },
    { name: t.navProfile, path: '/profile', icon: <UserCircle size={18} /> },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
   <nav className="sticky top-0 z-50 w-full transition-colors duration-300 bg-white shadow-md dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-zinc-800">
      
      {/* 1. Top Govt Strip (Translated) */}
      <div className="bg-[#0B2447] dark:bg-black text-white text-[10px] md:text-xs font-semibold py-1.5 px-4 border-b border-yellow-500">
          <div className="max-w-[1400px] mx-auto flex justify-between items-center">
              <span>{t.govtTitle}</span>
              <span>{t.ministry}</span>
          </div>
      </div>

      {/* 2. Main Header Content */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
        
        {/* Left: Emblem & Title */}
        <Link to="/" className="flex items-center gap-4 group">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" 
            alt="National Emblem" 
            className="object-contain w-auto h-12 transition-transform opacity-90 dark:invert dark:opacity-90 group-hover:scale-105"
          />
          <div className="flex flex-col justify-center">
            <h1 className="text-xl md:text-2xl font-bold text-[#0B2447] dark:text-white leading-tight">
              {t.portalTitle}
            </h1>
            <p className="text-[10px] md:text-xs font-bold text-[#FF9933] tracking-wide uppercase">
              {t.portalSubtitle}
            </p>
          </div>
        </Link>

        {/* Center: Desktop Navigation */}
        <div className="items-center hidden h-full space-x-1 lg:flex">
            {navLinks.map((link) => (
                <Link
                key={link.path}
                to={link.path}
                className={`inline-flex items-center px-4 py-2 text-sm font-bold rounded-full transition-all duration-200
                    ${isActive(link.path)
                    ? 'bg-[#0B2447] text-white dark:bg-yellow-400 dark:text-black shadow-md' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-[#0B2447] dark:text-gray-300 dark:hover:bg-zinc-800 dark:hover:text-white'
                    }`}
                >
                <span className="mr-2">{link.icon}</span>
                {link.name}
                </Link>
            ))}
        </div>
        
        {/* Right: Actions */}
        <div className="flex items-center gap-2 md:gap-4">
           
           {/* --- Language Selector (Added) --- */}
           <div className="relative" ref={langMenuRef}>
              <button 
                  onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                  className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-gray-600 uppercase transition-colors bg-gray-100 border border-gray-200 rounded-full md:gap-2 dark:bg-zinc-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700 dark:border-zinc-700"
              >
                  <Globe size={16} />
                  <span className="hidden sm:inline">{lang}</span>
                  <ChevronDown size={14} className={`transition-transform duration-200 ${isLangMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                  {isLangMenuOpen && (
                      <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 mt-2 w-40 bg-white dark:bg-[#1a1a1a] rounded-xl shadow-xl border border-gray-200 dark:border-zinc-700 overflow-hidden py-1 z-50"
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
                                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800'
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
             className="p-2 text-gray-600 transition-colors bg-gray-100 border border-gray-200 rounded-full dark:bg-zinc-800 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-zinc-700 dark:border-zinc-700"
             title="Toggle Theme"
           >
             {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
           </button>

           {/* Digital India Logo (Hidden on small screens) */}
           <div className="hidden md:block h-8 w-[1px] bg-gray-300 dark:bg-zinc-700"></div>
           <img 
              src="https://upload.wikimedia.org/wikipedia/en/9/95/Digital_India_logo.svg" 
              alt="Digital India" 
              className="hidden w-auto h-10 opacity-80 md:block dark:bg-white dark:p-1 dark:rounded"
           />

           {/* Logout Button (Desktop) */}
           <button 
              onClick={handleLogout}
              className="items-center hidden gap-2 px-4 py-2 ml-2 text-sm font-bold text-white transition-colors bg-red-600 rounded-lg shadow-sm md:flex hover:bg-red-700"
           >
              <LogOut size={16} />
              {t.logout}
           </button>

           {/* Mobile Menu Toggle */}
           <div className="flex items-center md:hidden">
             <button
               onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
               className="inline-flex items-center justify-center p-2 text-gray-600 rounded-md hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-800"
             >
               {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
             </button>
           </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="bg-white border-b border-gray-200 md:hidden dark:bg-[#111] dark:border-zinc-800">
          <div className="px-4 pt-2 pb-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center px-4 py-3 text-base font-medium rounded-lg transition-colors
                  ${isActive(link.path)
                    ? 'bg-blue-50 text-[#0B2447] border border-blue-100 dark:bg-zinc-800 dark:text-yellow-400 dark:border-zinc-700'
                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-zinc-800'
                  }`}
              >
                <span className="mr-3">{link.icon}</span>
                {link.name}
              </Link>
            ))}
            <div className="pt-4 mt-2 border-t border-gray-100 dark:border-zinc-800">
               <button 
                 onClick={handleLogout}
                 className="flex items-center w-full px-4 py-3 text-base font-medium text-left text-white bg-red-600 rounded-lg hover:bg-red-700"
               >
                 <LogOut size={18} className="mr-3"/>
                 {t.signOut}
               </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

// --- ROUTES UTILS ---
function isLoggedIn() {
  return !!localStorage.getItem("token");
}

function ProtectedRoute({ children }) {
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  return children;
}

function AdminRoute({ children }) {
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (user && user.role === "admin") return children;
  } catch (e) { }
  return children;
}

function Layout({ children }) {
  const location = useLocation();
  const hideNav = ["/login", "/register", "/forgot-password", "/verify-otp", "/contact"].includes(location.pathname);
  
  return (
    // NOTE: The ThemeProvider inside App now handles the outer "dark" class and background colors
    <div className="flex flex-col w-full min-h-screen">
      {!hideNav && <Navbar />}
      <main className="flex-1 w-full">
        {children}
      </main>
      <Footer />
    </div>
  );
}

// --- MAIN APP ---
export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Layout>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/help" element={<Help />} />
            <Route path="/forgot-password" element={<ForgotOtp />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />

            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/elections/:id" element={<ProtectedRoute><ElectionDetail /></ProtectedRoute>} />
            <Route path="/elections/:id/results" element={<ProtectedRoute><ElectionResults /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/my-votes" element={<ProtectedRoute><MyVotes /></ProtectedRoute>} />

            <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
            <Route path="/admin/users/:id" element={<AdminRoute><AdminUserReview /></AdminRoute>} />

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin/support" element={<AdminSupport />} />
   
          </Routes>
        </Layout>
      </Router>
      </LanguageProvider>
    </ThemeProvider>
  );
}
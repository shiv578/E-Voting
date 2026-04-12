// src/components/Navbar.jsx
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../api";
import { Sun, Moon, Menu, X, User, LogOut } from "lucide-react";

export default function Navbar({ theme, setTheme, hideOnAuth = false }) {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [user, setUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadMe() {
      if (!token) {
        setUser(null);
        return;
      }
      try {
        const res = await api.get("/api/auth/me");
        if (mounted) setUser(res.data.user);
      } catch {
        setUser(null);
      }
    }
    loadMe();
    return () => (mounted = false);
  }, [token]);

  const isActive = (path) =>
    location.pathname === path || (path !== "/" && location.pathname.startsWith(path));

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");
 if (hideOnAuth && ["/login", "/register"].includes(location.pathname)) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 dark:bg-[#1a1a1a] dark:border-zinc-800 transition-colors duration-200">
      <div className="max-w-6xl px-4 mx-auto">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
             <img 
                src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" 
                alt="National Emblem" 
                className="object-contain w-auto h-8 opacity-90 dark:invert dark:opacity-100 dark:brightness-200"
              />
            <div
              className="text-lg md:text-xl font-bold cursor-pointer text-[#0B2447] dark:text-white leading-tight"
              onClick={() => navigate("/dashboard")}
            >
              E Voting <span className="text-[#FF9933] dark:text-yellow-400">Portal</span>
            </div>
          </div>
  <div className="items-center hidden gap-6 text-sm font-medium md:flex">
            <Link 
              className={`transition-colors duration-200 ${isActive("/dashboard") ? "text-[#0B2447] dark:text-yellow-400 font-bold border-b-2 border-[#0B2447] dark:border-yellow-400" : "text-gray-600 hover:text-[#0B2447] dark:text-gray-300 dark:hover:text-yellow-400"}`} 
              to="/dashboard"
            >
              Dashboard
            </Link>
            <Link 
              className={`transition-colors duration-200 ${isActive("/help") ? "text-[#0B2447] dark:text-yellow-400 font-bold border-b-2 border-[#0B2447] dark:border-yellow-400" : "text-gray-600 hover:text-[#0B2447] dark:text-gray-300 dark:hover:text-yellow-400"}`} 
              to="/help"
            >
              Help
            </Link>
            {token && (
              <Link 
                className={`transition-colors duration-200 ${isActive("/profile") ? "text-[#0B2447] dark:text-yellow-400 font-bold border-b-2 border-[#0B2447] dark:border-yellow-400" : "text-gray-600 hover:text-[#0B2447] dark:text-gray-300 dark:hover:text-yellow-400"}`} 
                to="/profile"
              >
                Profile
              </Link>
            )}
            {user?.role === "admin" && (
              <Link 
                className={`transition-colors duration-200 ${isActive("/admin") ? "text-[#0B2447] dark:text-yellow-400 font-bold border-b-2 border-[#0B2447] dark:border-yellow-400" : "text-gray-600 hover:text-[#0B2447] dark:text-gray-300 dark:hover:text-yellow-400"}`} 
                to="/admin"
              >
                Admin Panel
              </Link>
            )}
          </div>
  <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-600 transition-colors rounded-full hover:bg-gray-100 dark:text-yellow-400 dark:hover:bg-zinc-800 focus:outline-none"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {token && (
               <div className="items-center hidden gap-2 px-3 py-1 border border-gray-200 rounded-full md:flex bg-gray-50 dark:bg-zinc-800 dark:border-zinc-700">
                  <User size={14} className="text-[#0B2447] dark:text-yellow-400" />
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{user?.name}</span>
               </div>
            )}

            {!token ? (
              <div className="hidden gap-3 md:flex">
                <button onClick={() => navigate("/login")} className="px-4 py-1.5 text-sm font-semibold text-[#0B2447] border border-[#0B2447] rounded hover:bg-[#0B2447] hover:text-white dark:text-yellow-400 dark:border-yellow-400 dark:hover:bg-yellow-400 dark:hover:text-black transition-all">
                  Login
                </button>
                <button onClick={() => navigate("/register")} className="px-4 py-1.5 text-sm font-semibold text-white bg-[#0B2447] rounded hover:bg-[#1a3a5e] dark:bg-yellow-400 dark:text-black dark:hover:bg-yellow-300 transition-all">
                  Register
                </button>
              </div>
            ) : (
              <button onClick={handleLogout} className="hidden md:flex items-center gap-1 px-3 py-1.5 text-sm font-semibold text-red-600 border border-red-200 rounded hover:bg-red-50 dark:text-red-400 dark:border-red-900 dark:hover:bg-red-900/20">
                <LogOut size={14} />
                Logout
              </button>
            )}
   <button 
              onClick={() => setMobileOpen((s) => !s)} 
              className="p-2 text-gray-600 border rounded md:hidden dark:text-white dark:border-zinc-700"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
  {mobileOpen && (
          <div className="pb-4 mt-2 border-t border-gray-100 md:hidden dark:border-zinc-800">
            <div className="flex flex-col gap-2 pt-4 text-sm">
              {token && <div className="px-2 pb-2 text-xs font-bold text-gray-400 uppercase">Signed in as {user?.name}</div>}
              
              <Link 
                to="/dashboard" 
                onClick={() => setMobileOpen(false)} 
                className={`px-2 py-2 rounded ${isActive("/dashboard") ? "bg-[#0B2447] text-white dark:bg-yellow-400 dark:text-black font-bold" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800"}`}
              >
                Dashboard
              </Link>
              <Link 
                to="/help" 
                onClick={() => setMobileOpen(false)} 
                className={`px-2 py-2 rounded ${isActive("/help") ? "bg-[#0B2447] text-white dark:bg-yellow-400 dark:text-black font-bold" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800"}`}
              >
                Help
              </Link>
              {token && (
                <Link 
                  to="/profile" 
                  onClick={() => setMobileOpen(false)} 
                  className={`px-2 py-2 rounded ${isActive("/profile") ? "bg-[#0B2447] text-white dark:bg-yellow-400 dark:text-black font-bold" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800"}`}
                >
                  Profile
                </Link>
              )}
              {user?.role === "admin" && (
                <Link 
                  to="/admin" 
                  onClick={() => setMobileOpen(false)} 
                  className={`px-2 py-2 rounded ${isActive("/admin") ? "bg-[#0B2447] text-white dark:bg-yellow-400 dark:text-black font-bold" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800"}`}
                >
                  Admin Panel
                </Link>
              )}
              
              <div className="h-px my-1 bg-gray-200 dark:bg-zinc-800"></div>

              {!token ? (
                <div className="flex flex-col gap-2 mt-2">
                  <button onClick={() => navigate("/login")} className="w-full px-2 py-2 font-semibold text-center text-[#0B2447] border border-[#0B2447] rounded dark:text-yellow-400 dark:border-yellow-400">
                    Login
                  </button>
                  <button onClick={() => navigate("/register")} className="w-full px-2 py-2 font-semibold text-center text-white bg-[#0B2447] rounded dark:bg-yellow-400 dark:text-black">
                    Register
                  </button>
                </div>
              ) : (
                <button onClick={handleLogout} className="flex items-center w-full gap-2 px-2 py-2 mt-2 font-semibold text-red-600 rounded dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                  <LogOut size={16} />
                  Logout
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
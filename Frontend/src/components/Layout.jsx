// src/components/Layout.jsx
import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Layout({ children, hideNavOnAuth = false }) {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("theme") || "light";
    } catch {
      return "light";
    }
  });

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    try {
      localStorage.setItem("theme", theme);
    } catch {}
  }, [theme]);

  return (
    <div className="flex flex-col min-h-screen transition-colors duration-200 bg-white dark:bg-gov-900 text-gov-700 dark:text-gov-200">
      <Navbar theme={theme} setTheme={setTheme} hideOnAuth={hideNavOnAuth} />
      <main className="flex-1">
        <div className="max-w-6xl p-6 mx-auto">{children}</div>
      </main>
      <Footer />
    </div>
  );
}

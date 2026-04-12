import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, languages } from '../utils/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  // 1. Get from localStorage or default to 'en'
  const [lang, setLangState] = useState(() => {
    return localStorage.getItem('app_lang') || 'en';
  });

  // 2. Update localStorage when lang changes
  useEffect(() => {
    localStorage.setItem('app_lang', lang);
  }, [lang]);

  // 3. Helper to switch language
  const setLang = (code) => {
    setLangState(code);
  };

  // 4. Get current translation object
  // Fallback to English if translation is missing for some reason
  const t = translations[lang] || translations['en'];

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, languages }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Custom hook for easy usage
export function useLanguage() {
  return useContext(LanguageContext);
}
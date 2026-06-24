// src/contexts/ThemeContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { translations, languages } from '../translations';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'pt-BR');
  const [notifications, setNotifications] = useState(() => {
    return localStorage.getItem('notifications') === 'true' || true;
  });

  // Persistir
  useEffect(() => localStorage.setItem('theme', theme), [theme]);
  useEffect(() => localStorage.setItem('language', language), [language]);
  useEffect(() => localStorage.setItem('notifications', String(notifications)), [notifications]);

  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  const toggleNotifications = () => setNotifications(prev => !prev);
  const changeLanguage = (lang) => setLanguage(lang);

  // Função de tradução
  const t = (key) => {
    return translations[language]?.[key] || translations['pt-BR'][key] || key;
  };

  const themes = {
    light: {
      background: '#f8fafc',
      cardBackground: '#ffffff',
      textPrimary: '#0f172a',
      textSecondary: '#475569',
      border: '#e2e8f0',
      headerBackground: 'rgba(255,255,255,0.85)',
      inputBackground: '#ffffff',
      shadow: '0 4px 12px rgba(0,0,0,0.03)',
      hoverBg: 'rgba(59,130,246,0.06)',
      activeBg: 'rgba(59,130,246,0.1)',
    },
    dark: {
      background: '#0f172a',
      cardBackground: '#1e293b',
      textPrimary: '#f1f5f9',
      textSecondary: '#94a3b8',
      border: '#334155',
      headerBackground: 'rgba(15,23,42,0.85)',
      inputBackground: '#1e293b',
      shadow: '0 4px 12px rgba(0,0,0,0.3)',
      hoverBg: 'rgba(59,130,246,0.15)',
      activeBg: 'rgba(59,130,246,0.2)',
    },
  };

  const value = {
    theme,
    setTheme,
    toggleTheme,
    currentTheme: themes[theme],
    language,
    changeLanguage,
    languages,
    notifications,
    toggleNotifications,
    t, // disponível para todos
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
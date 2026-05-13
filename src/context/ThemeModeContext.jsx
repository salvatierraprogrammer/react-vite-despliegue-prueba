import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeModeContext = createContext(null);

export const ThemeModeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem('themeMode');
    return saved || 'light';
  });

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
    document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);

  const toggleTheme = useCallback(() => {
    setMode(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  return (
    <ThemeModeContext.Provider value={{ mode, toggleTheme }}>
      {children}
    </ThemeModeContext.Provider>
  );
};

export const useThemeMode = () => {
  const context = useContext(ThemeModeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeModeProvider');
  }
  return context;
};

export default ThemeModeContext;

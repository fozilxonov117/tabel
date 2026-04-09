import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext({ dark: false, toggleDark: () => {} });

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem('theme') === 'dark'; } catch { return false; }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch {}
  }, [dark]);

  return (
    <ThemeContext.Provider value={{ dark, toggleDark: () => setDark(d => !d) }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() { return useContext(ThemeContext); }

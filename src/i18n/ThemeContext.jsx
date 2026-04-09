import React, { createContext, useContext, useState, useCallback, startTransition } from 'react';

const ThemeContext = createContext({ dark: false, toggleDark: () => {} });

function applyTheme(isDark) {
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  try { localStorage.setItem('theme', isDark ? 'dark' : 'light'); } catch {}
}

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    try {
      const saved = localStorage.getItem('theme') === 'dark';
      document.documentElement.setAttribute('data-theme', saved ? 'dark' : 'light');
      return saved;
    } catch { return false; }
  });

  const toggleDark = useCallback(() => {
    const next = document.documentElement.getAttribute('data-theme') !== 'dark';
    applyTheme(next);
    startTransition(() => setDark(next)); // low-priority — only updates button icon
  }, []);

  return (
    <ThemeContext.Provider value={{ dark, toggleDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() { return useContext(ThemeContext); }

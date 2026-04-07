import React, { createContext, useContext, useState } from 'react';

const LangContext = createContext({ lang: 'ru', setLang: () => {} });

export function LangProvider({ children }) {
  const [lang, setLang] = useState('ru');
  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}

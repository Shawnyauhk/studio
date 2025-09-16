'use client';

import React, { createContext, useState, useEffect, type ReactNode } from 'react';
import en from '@/locales/en.json';
import zh from '@/locales/zh.json';

type Translations = typeof en;
type Language = 'en' | 'zh';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  translations: Translations;
}

const translationsMap = { en, zh };

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const browserLang = navigator.language.split('-')[0];
    if (browserLang === 'zh') {
      setLanguage('zh');
    }
  }, []);

  const value = {
    language,
    setLanguage,
    translations: translationsMap[language],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

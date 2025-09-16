'use client';

import { useContext } from 'react';
import { LanguageContext } from '@/context/LanguageContext';

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }

  const { translations, ...rest } = context;

  const t = (key: keyof typeof translations) => {
    return translations[key] || key;
  };

  return { ...rest, t };
};

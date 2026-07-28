'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { ko, zh, Lang } from './translations';

interface I18nContextType {
  lang: Lang;
  t: (key: string) => string;
  setLang: (lang: Lang) => void;
  swapLang: () => void;
}

const I18nContext = createContext<I18nContextType | null>(null);

const dictionaries = { zh, ko };

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('zh');

  useEffect(() => {
    const saved = localStorage.getItem('app-lang') as Lang;
    if (saved === 'ko' || saved === 'zh') setLangState(saved);
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem('app-lang', l);
    document.documentElement.lang = l === 'ko' ? 'ko' : 'zh-CN';
  }, []);

  const swapLang = useCallback(() => {
    setLang(lang === 'zh' ? 'ko' : 'zh');
  }, [lang, setLang]);

  const t = useCallback((key: string): string => {
    const dict = dictionaries[lang] as unknown as Record<string, string>;
    return dict[key] ?? key;
  }, [lang]);

  return (
    <I18nContext.Provider value={{ lang, t, setLang, swapLang }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}

// 针对 homepage 的 generationTypes 返回 Record
export function useI18nGen() {
  const { lang } = useI18n();
  return lang === 'ko'
    ? { 'verse_1': '1절', 'verse_7': '7절', 'verse_12': '12절', 'verse_27': '27절', 'verse_39': '39절', 'chapter_full': '한 장 전체' }
    : { 'verse_1': '1节', 'verse_7': '7节', 'verse_12': '12节', 'verse_27': '27节', 'verse_39': '39节', 'chapter_full': '整一章' };
}

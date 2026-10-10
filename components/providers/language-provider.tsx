"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { translate } from "@/lib/i18n/translations";
import type { Language, TranslationKey } from "@/lib/i18n/translations";

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, values?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);
const storageKey = "maison-luxe-language";

function isSupportedLanguage(value: string | null): value is Language {
  return value === "uz" || value === "ru" || value === "en";
}

export function LanguageProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [language, setCurrentLanguage] = useState<Language>("en");

  useEffect(() => {
    try {
      const savedLanguage = window.localStorage.getItem(storageKey);
      if (isSupportedLanguage(savedLanguage)) setCurrentLanguage(savedLanguage);
    } catch (error) {
      console.error("Unable to restore the saved language preference.", error);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((nextLanguage: Language) => {
    setCurrentLanguage(nextLanguage);
    try {
      window.localStorage.setItem(storageKey, nextLanguage);
    } catch (error) {
      console.error("Unable to save the selected language.", error);
    }
  }, []);

  const value = useMemo<LanguageContextValue>(() => ({
    language,
    setLanguage,
    t: (key, values) => translate(language, key, values),
  }), [language, setLanguage]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within a LanguageProvider.");
  return context;
}

"use client";

import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { SupportedLanguage, translations } from "@/lib/translations";

type TranslationValues = Record<string, string | number>;

type LanguageContextValue = {
  language: SupportedLanguage;
  direction: "ltr" | "rtl";
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string, values?: TranslationValues) => string;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const STORAGE_KEY = "alnoor-language";

function isSupportedLanguage(value: string | null): value is SupportedLanguage {
  return value === "en" || value === "ur" || value === "ar";
}

function getDirection(language: SupportedLanguage): "ltr" | "rtl" {
  return language === "ar" || language === "ur" ? "rtl" : "ltr";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>("en");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isSupportedLanguage(stored)) {
      setLanguageState(stored);
    }
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = language;
      const dir = getDirection(language);
      document.documentElement.dir = dir;
      if (document.body) {
        document.body.dir = dir;
      }
    }
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, language);
    }
  }, [language]);

  const setLanguage = useCallback((lang: SupportedLanguage) => {
    setLanguageState(lang);
  }, []);

  const value = useMemo<LanguageContextValue>(() => {
    const direction = getDirection(language);
    return {
      language,
      direction,
      setLanguage,
      t: (key, values) => {
        const template = translations[language][key] ?? translations.en[key] ?? key;
        if (!values) return template;
        return Object.keys(values).reduce((acc, valueKey) => {
          const pattern = new RegExp(`{${valueKey}}`, "g");
          return acc.replace(pattern, String(values[valueKey]));
        }, template);
      },
    };
  }, [language, setLanguage]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return ctx;
}

export const supportedLanguages: Array<{ value: SupportedLanguage; label: string }> = [
  { value: "en", label: "English" },
  { value: "ur", label: "اردو" },
  { value: "ar", label: "العربية" },
];

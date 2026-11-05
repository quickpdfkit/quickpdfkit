"use client";

import { createContext, useContext, useMemo } from "react";
import type { Dictionary } from "@/lib/i18n/types";
import type { AppLocale } from "@/lib/i18n/locales";
import { localizedPath } from "@/lib/i18n/paths";

type I18nValue = {
  locale: AppLocale;
  dictionary: Dictionary;
  phrases: Record<string, string>;
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({
  locale,
  dictionary,
  phrases = {},
  children,
}: {
  locale: AppLocale;
  dictionary: Dictionary;
  phrases?: Record<string, string>;
  children: React.ReactNode;
}) {
  const value = useMemo(
    () => ({ locale, dictionary, phrases }),
    [locale, dictionary, phrases],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const value = useContext(I18nContext);
  if (!value) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return value;
}

export function useLocalizedHref() {
  const { locale } = useI18n();
  return (href: string) => {
    if (!href.startsWith("/") || href.startsWith("//")) return href;
    return localizedPath(locale, href);
  };
}

export function useT() {
  const { phrases } = useI18n();
  return (english: string, vars?: Record<string, string | number>) => {
    let text = phrases[english] ?? english;
    if (vars) {
      for (const [key, value] of Object.entries(vars)) {
        text = text.replaceAll(`{${key}}`, String(value));
      }
    }
    return text;
  };
}

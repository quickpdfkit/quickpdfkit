export const LOCALES = ["es", "ar", "fr", "pt", "hi"] as const;

export type Locale = (typeof LOCALES)[number];
export type AppLocale = "en" | Locale;

export const OG_LOCALE: Record<AppLocale, string> = {
  en: "en_US",
  es: "es_ES",
  ar: "ar_AR",
  fr: "fr_FR",
  pt: "pt_BR",
  hi: "hi_IN",
};

export const LOCALE_LABELS: Record<AppLocale, string> = {
  en: "English",
  es: "Español",
  ar: "العربية",
  fr: "Français",
  pt: "Português",
  hi: "हिन्दी",
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

export function textDirection(locale: AppLocale): "rtl" | "ltr" {
  return locale === "ar" ? "rtl" : "ltr";
}

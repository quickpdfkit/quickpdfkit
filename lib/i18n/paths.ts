import { isLocale, type AppLocale, type Locale } from "./locales";

const LOCALE_LIST: AppLocale[] = ["en", "es", "ar", "fr", "pt", "hi"];

export function localizedPath(locale: AppLocale, englishPath: string): string {
  if (locale === "en") return englishPath;
  if (englishPath === "/") return `/${locale}`;
  if (englishPath === "/tools") return `/${locale}/tools`;
  if (englishPath.startsWith("/tools/")) {
    return `/${locale}/${englishPath.slice("/tools/".length)}`;
  }
  return englishPath;
}

export function toEnglishPath(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return "/";
  if (!isLocale(parts[0])) {
    return pathname.startsWith("/") ? pathname : `/${pathname}`;
  }
  const rest = parts.slice(1);
  if (rest.length === 0) return "/";
  if (rest[0] === "tools" && rest.length === 1) return "/tools";
  if (rest.length === 1) return `/tools/${rest[0]}`;
  return "/";
}

export function pathForLocale(pathname: string, target: AppLocale): string {
  const englishPath = toEnglishPath(pathname || "/");
  if (target === "en") return englishPath;
  const next = localizedPath(target, englishPath);
  if (next === englishPath && englishPath !== "/") return `/${target}`;
  return next;
}

export function languageAlternates(englishPath: string): Record<string, string> {
  const languages: Record<string, string> = {
    en: englishPath,
    "x-default": englishPath,
  };
  for (const locale of LOCALE_LIST) {
    if (locale === "en") continue;
    languages[locale] = localizedPath(locale as Locale, englishPath);
  }
  return languages;
}

export function toolIdFromHref(href: string): string {
  return href.startsWith("/tools/") ? href.slice("/tools/".length) : href;
}

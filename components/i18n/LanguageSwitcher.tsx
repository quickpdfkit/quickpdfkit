"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe } from "lucide-react";
import { LOCALE_LABELS, type AppLocale } from "@/lib/i18n/locales";
import { pathForLocale } from "@/lib/i18n/paths";
import { useI18n } from "./I18nProvider";

const OPTIONS: AppLocale[] = ["en", "es", "fr", "pt", "ar", "hi"];

export default function LanguageSwitcher() {
  const { locale, dictionary } = useI18n();
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={dictionary.language.label}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-2 text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600"
      >
        <Globe className="h-4 w-4" aria-hidden="true" />
        <span className="uppercase">{locale}</span>
      </button>
      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-label={dictionary.language.label}
          className="absolute end-0 z-50 mt-2 w-44 rounded-xl border border-gray-200 bg-white py-1 shadow-xl"
        >
          {OPTIONS.map((code) => {
            const selected = code === locale;
            return (
              <li key={code} role="option" aria-selected={selected}>
                <Link
                  href={pathForLocale(pathname, code)}
                  hrefLang={code}
                  lang={code}
                  className={`block px-3 py-2 text-sm ${
                    selected
                      ? "bg-orange-50 font-semibold text-orange-600"
                      : "text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {LOCALE_LABELS[code]}
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

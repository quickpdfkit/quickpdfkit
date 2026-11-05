import type { Metadata } from "next";
import { OG_LOCALE, type AppLocale } from "@/lib/i18n/locales";

export const SITE_NAME = "QuickPDFKit";
export const SITE_URL = "https://quickpdfkit.com";

export const HOME_TITLE =
  "QuickPDFKit — Free, Private, In-Browser PDF Tools";

export const HOME_DESCRIPTION =
  "QuickPDFKit is a free PDF toolkit that runs in your browser. Merge, split, compress, convert, edit, and protect PDFs privately — no account required.";

export const HOME_KEYWORDS = [
  "QuickPDFKit",
  "free PDF tools",
  "private PDF editor",
  "in-browser PDF tools",
  "merge PDF",
  "split PDF",
  "compress PDF",
  "PDF converter",
  "PDF to Word",
  "image to PDF",
  "edit PDF online",
];

export function absoluteUrl(path: string): string {
  if (path === "/") return SITE_URL;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function pageMetadata({
  title,
  description,
  path,
  keywords,
  locale = "en",
  languages,
  noIndex = false,
}: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  locale?: AppLocale;
  languages?: Record<string, string>;
  noIndex?: boolean;
}): Metadata {
  const fullTitle = title.includes(SITE_NAME)
    ? title
    : `${title} | ${SITE_NAME}`;

  return {
    title: { absolute: fullTitle },
    description,
    keywords,
    alternates: {
      canonical: path,
      ...(languages ? { languages } : {}),
    },
    openGraph: {
      type: "website",
      locale: OG_LOCALE[locale],
      ...(languages
        ? {
            alternateLocale: (Object.keys(OG_LOCALE) as AppLocale[])
              .filter((code) => code !== locale)
              .map((code) => OG_LOCALE[code]),
          }
        : {}),
      url: path,
      siteName: SITE_NAME,
      title: fullTitle,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}

type HowToStep = { name: string; text: string };

export function softwareApplicationJsonLd(
  description: string,
  featureList: string[],
  path = "/",
) {
  return {
    "@context": "https://schema.org",
    "@type": ["WebApplication", "SoftwareApplication"],
    name: SITE_NAME,
    url: absoluteUrl(path),
    description,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web browser",
    browserRequirements: "Requires a modern web browser.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    isAccessibleForFree: true,
    featureList,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: absoluteUrl(path),
    },
  };
}

export function webApplicationJsonLd({
  name,
  description,
  path,
  homePath = "/",
}: {
  name: string;
  description: string;
  path: string;
  homePath?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name,
    description,
    url: absoluteUrl(path),
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web browser",
    browserRequirements: "Requires a modern web browser.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    isAccessibleForFree: true,
    provider: {
      "@type": "Organization",
      name: SITE_NAME,
      url: absoluteUrl(homePath),
    },
  };
}

export function howToJsonLd({
  name,
  description,
  steps,
}: {
  name: string;
  description: string;
  steps: HowToStep[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    description,
    step: steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  };
}

export function faqPageJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

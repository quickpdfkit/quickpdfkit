import type { Metadata } from "next";

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
}: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
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
    },
    openGraph: {
      type: "website",
      locale: "en_US",
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
  };
}

type HowToStep = { name: string; text: string };

export function softwareApplicationJsonLd(
  description: string,
  featureList: string[],
) {
  return {
    "@context": "https://schema.org",
    "@type": ["WebApplication", "SoftwareApplication"],
    name: SITE_NAME,
    url: absoluteUrl("/"),
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
      url: absoluteUrl("/"),
    },
  };
}

export function webApplicationJsonLd({
  name,
  description,
  path,
}: {
  name: string;
  description: string;
  path: string;
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
      url: absoluteUrl("/"),
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

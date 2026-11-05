import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_Arabic, Noto_Sans_Devanagari } from "next/font/google";
import { notFound } from "next/navigation";
import "../../globals.css";
import { SITE_NAME, SITE_URL } from "@/lib/seo";
import SiteScripts from "@/components/seo/SiteScripts";
import { I18nProvider } from "@/components/i18n/I18nProvider";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getPhrases } from "@/lib/i18n/phrases";
import { isLocale, LOCALES, OG_LOCALE, textDirection, type Locale } from "@/lib/i18n/locales";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
});

const notoArabic = Noto_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  display: "swap",
});

const notoHindi = Noto_Sans_Devanagari({
  variable: "--font-devanagari",
  subsets: ["devanagari"],
  display: "swap",
});

export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dictionary = getDictionary(locale);
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: dictionary.meta.homeTitle,
      template: `%s | ${SITE_NAME}`,
    },
    description: dictionary.meta.homeDescription,
    keywords: dictionary.meta.homeKeywords,
    authors: [{ name: SITE_NAME }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      type: "website",
      locale: OG_LOCALE[locale],
      siteName: SITE_NAME,
      title: dictionary.meta.homeTitle,
      description: dictionary.meta.homeDescription,
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: dictionary.meta.ogImageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: dictionary.meta.homeTitle,
      description: dictionary.meta.homeDescription,
      images: ["/twitter-image.png"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    icons: {
      icon: [{ url: "/favicon.ico" }],
    },
    other: {
      "google-adsense-account": "ca-pub-4916350136769682",
    },
    category: "Technology",
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) notFound();
  const locale: Locale = localeParam;
  const fontClass =
    locale === "ar" ? notoArabic.variable : locale === "hi" ? notoHindi.variable : "";

  return (
    <html lang={locale} dir={textDirection(locale)}>
      <body className={`${geistSans.variable} ${geistMono.variable} ${fontClass} antialiased`}>
        <SiteScripts />
        <I18nProvider
          locale={locale}
          dictionary={getDictionary(locale)}
          phrases={getPhrases(locale)}
        >
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}

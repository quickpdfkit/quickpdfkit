import Header from "@/components/layout/Header";
import Hero from "@/components/layout/Hero";
import ToolsGrid from "@/components/layout/ToolsGrid";
import Features from "@/components/layout/Features";
import HowItWorks from "@/components/layout/HowItWorks";
import Footer from "@/components/layout/Footer";
import JsonLd from "@/components/seo/JsonLd";
import { notFound } from "next/navigation";
import { allTools } from "@/config/toolsData";
import {
  howToJsonLd,
  pageMetadata,
  softwareApplicationJsonLd,
} from "@/lib/seo";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale, LOCALES } from "@/lib/i18n/locales";
import { languageAlternates } from "@/lib/i18n/paths";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dictionary = getDictionary(locale);
  return pageMetadata({
    title: dictionary.meta.homeTitle,
    description: dictionary.meta.homeDescription,
    path: `/${locale}`,
    keywords: dictionary.meta.homeKeywords,
    locale,
    languages: languageAlternates("/"),
  });
}

export default async function LocalizedHome({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dictionary = getDictionary(locale);
  const path = `/${locale}`;

  return (
    <div className="min-h-screen bg-black">
      <JsonLd
        data={softwareApplicationJsonLd(
          dictionary.meta.homeDescription,
          allTools.map((tool) => dictionary.tools[tool.href.replace("/tools/", "")]?.title ?? tool.title),
          path,
        )}
      />
      <JsonLd
        data={howToJsonLd({
          name: dictionary.meta.howToName,
          description: dictionary.meta.howToDescription,
          steps: dictionary.howItWorks.steps.map((step) => ({
            name: step.name,
            text: step.text,
          })),
        })}
      />
      <Header />
      <Hero />
      <ToolsGrid />
      <Features />
      <HowItWorks />
      <Footer />
    </div>
  );
}

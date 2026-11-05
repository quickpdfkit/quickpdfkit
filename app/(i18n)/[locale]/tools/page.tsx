import AllTools from "@/components/pages/AllTools";
import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/seo";
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
    title: dictionary.meta.toolsIndexTitle,
    description: dictionary.meta.toolsIndexDescription,
    path: `/${locale}/tools`,
    keywords: dictionary.meta.toolsIndexKeywords,
    locale,
    languages: languageAlternates("/tools"),
  });
}

export default async function LocalizedToolsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <AllTools />;
}

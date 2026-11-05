import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import ContactUs from "@/components/pages/ContactUs";
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
  const copy = getDictionary(locale).contactPage;
  return pageMetadata({
    title: copy.metaTitle,
    description: copy.metaDescription,
    path: `/${locale}/contact`,
    keywords: copy.metaKeywords,
    locale,
    languages: languageAlternates("/contact"),
  });
}

export default async function LocalizedContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <div>
      <Header />
      <ContactUs />
      <Footer />
    </div>
  );
}

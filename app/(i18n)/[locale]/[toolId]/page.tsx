import { toolsMap } from "@/config/tools";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ToolPageWrapper from "@/components/layout/ToolPageWrapper";
import JsonLd from "@/components/seo/JsonLd";
import { howToJsonLd, pageMetadata, webApplicationJsonLd } from "@/lib/seo";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale, LOCALES } from "@/lib/i18n/locales";
import { languageAlternates } from "@/lib/i18n/paths";

interface LocalizedToolPageProps {
  params: Promise<{ locale: string; toolId: string }>;
}

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.flatMap((locale) =>
    Object.keys(toolsMap).map((toolId) => ({ locale, toolId })),
  );
}

export async function generateMetadata({
  params,
}: LocalizedToolPageProps): Promise<Metadata> {
  const { locale, toolId } = await params;
  if (!isLocale(locale)) return {};
  const dictionary = getDictionary(locale);
  const tool = dictionary.tools[toolId];
  const path = `/${locale}/${toolId}`;

  if (!tool || !toolsMap[toolId]) {
    return pageMetadata({
      title: dictionary.notFound.title,
      description: dictionary.notFound.description,
      path,
      locale,
      noIndex: true,
    });
  }

  return pageMetadata({
    title: tool.metaTitle,
    description: tool.metaDescription,
    path,
    keywords: tool.keywords,
    locale,
    languages: languageAlternates(`/tools/${toolId}`),
  });
}

export default async function LocalizedToolPage({ params }: LocalizedToolPageProps) {
  const { locale, toolId } = await params;
  if (!isLocale(locale)) notFound();
  const toolData = toolsMap[toolId];
  const dictionary = getDictionary(locale);
  const tool = dictionary.tools[toolId];

  if (!toolData || !tool) notFound();

  const ToolComponent = toolData.component;
  const path = `/${locale}/${toolId}`;
  const guide = dictionary.toolGuides[toolId as keyof typeof dictionary.toolGuides];

  return (
    <>
      <JsonLd
        data={webApplicationJsonLd({
          name: tool.metaTitle,
          description: tool.metaDescription,
          path,
          homePath: `/${locale}`,
        })}
      />
      {guide ? (
        <JsonLd
          data={howToJsonLd({
            name: guide.name,
            description: guide.description,
            steps: [{ name: guide.stepName, text: guide.stepText }],
          })}
        />
      ) : null}
      <ToolPageWrapper>
        <ToolComponent />
      </ToolPageWrapper>
    </>
  );
}

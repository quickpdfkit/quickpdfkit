import { toolsMap } from "@/config/tools";
import { toolHowToById } from "@/config/toolGuides";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ToolPageWrapper from "@/components/layout/ToolPageWrapper";
import JsonLd from "@/components/seo/JsonLd";
import { howToJsonLd, pageMetadata, webApplicationJsonLd } from "@/lib/seo";
import { languageAlternates } from "@/lib/i18n/paths";

interface ToolPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(toolsMap).map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: ToolPageProps): Promise<Metadata> {
  const { id } = await params;
  const toolData = toolsMap[id];

  if (!toolData) {
    return {
      title: { absolute: "Tool Not Found | QuickPDFKit" },
      description: "The requested PDF tool could not be found on QuickPDFKit.",
      robots: { index: false, follow: false },
    };
  }

  return pageMetadata({
    title: toolData.metadata.title,
    description: toolData.metadata.description,
    path: `/tools/${id}`,
    keywords: toolData.metadata.keywords,
    languages: languageAlternates(`/tools/${id}`),
  });
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { id } = await params;
  const toolData = toolsMap[id];

  if (!toolData) {
    return notFound();
  }

  const ToolComponent = toolData.component;
  const path = `/tools/${id}`;
  const howTo = toolHowToById[id];

  return (
    <>
      <JsonLd
        data={webApplicationJsonLd({
          name: toolData.metadata.title,
          description: toolData.metadata.description,
          path,
        })}
      />
      {howTo ? (
        <JsonLd
          data={howToJsonLd({
            name: howTo.name,
            description: howTo.description,
            steps: howTo.steps,
          })}
        />
      ) : null}
      <ToolPageWrapper>
        <ToolComponent />
      </ToolPageWrapper>
    </>
  );
}

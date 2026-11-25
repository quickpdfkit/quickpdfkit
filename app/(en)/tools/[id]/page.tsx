import { toolsMap } from "@/config/tools";
import { toolHowToById } from "@/config/toolGuides";
import { duplicateToolCanonical, toolPages } from "@/config/toolPages";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ToolPageWrapper from "@/components/layout/ToolPageWrapper";
import ClientTool from "@/components/tools/ClientTool";
import ToolPageHeading from "@/components/tools/ToolPageHeading";
import ToolArticle from "@/components/tools/ToolArticle";
import JsonLd from "@/components/seo/JsonLd";
import { NOINDEX_FOLLOW, faqPageJsonLd, howToJsonLd, pageMetadata, webApplicationJsonLd } from "@/lib/seo";

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

  const indexable = Boolean(toolPages[id]);

  return pageMetadata({
    title: toolData.metadata.title,
    description: toolData.metadata.description,
    path: `/tools/${id}`,
    canonicalPath: duplicateToolCanonical[id] ?? `/tools/${id}`,
    keywords: toolData.metadata.keywords,
    robots: indexable ? undefined : NOINDEX_FOLLOW,
  });
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { id } = await params;
  const toolData = toolsMap[id];

  if (!toolData) {
    return notFound();
  }

  const path = `/tools/${id}`;
  const howTo = toolHowToById[id];
  const article = toolPages[id];

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
      {article ? <JsonLd data={faqPageJsonLd(article.faqs)} /> : null}
      <ToolPageWrapper supplementary={article ? <ToolArticle page={article} /> : null}>
        <ToolPageHeading toolId={id} />
        <ClientTool id={id} />
      </ToolPageWrapper>
    </>
  );
}

import { toolsMap } from "@/config/tools";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ToolPageWrapper from "@/components/layout/ToolPageWrapper";

interface ToolPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const { id } = await params;
  const toolData = toolsMap[id];

  if (!toolData) {
    return {
      title: "Tool Not Found",
      description: "The requested tool could not be found.",
    };
  }

  return {
    title: toolData.metadata.title,
    description: toolData.metadata.description,
    keywords: toolData.metadata.keywords,
  };
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { id } = await params;
  const toolData = toolsMap[id];

  if (!toolData) {
    return notFound();
  }

  const ToolComponent = toolData.component;

  return (
    <ToolPageWrapper
    
    >
      <ToolComponent />
    </ToolPageWrapper>
  );
}

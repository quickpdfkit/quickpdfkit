"use client";

import { useI18n } from "./I18nProvider";

const COMPACT_HEADINGS = new Set(["edit-pdf", "sign-pdf"]);

export default function ToolHeading({
  toolId,
  size,
}: {
  toolId: string;
  size?: "md" | "lg";
}) {
  const { dictionary } = useI18n();
  const tool = dictionary.tools[toolId];
  if (!tool) return null;
  const resolved = size ?? (COMPACT_HEADINGS.has(toolId) ? "md" : "lg");
  const className =
    resolved === "md"
      ? "text-4xl sm:text-5xl font-bold mb-3 text-gray-900"
      : "text-4xl sm:text-5xl lg:text-6xl font-bold mb-3 text-gray-900";

  return (
    <>
      <h1 className={className}>
        {tool.lead}
        <span className="text-orange-500">{tool.accent}</span>
        {tool.trail}
      </h1>
      <p className="text-gray-600 text-sm sm:text-base">{tool.subtitle}</p>
    </>
  );
}

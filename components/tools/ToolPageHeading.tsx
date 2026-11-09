import ToolHeading from "@/components/i18n/ToolHeading";

const COMPACT_HEADINGS = new Set(["edit-pdf", "sign-pdf"]);

export default function ToolPageHeading({ toolId }: { toolId: string }) {
  const className = COMPACT_HEADINGS.has(toolId)
    ? "text-center mb-8"
    : "text-center mb-8 sm:mb-12";

  return (
    <div className={className}>
      <ToolHeading toolId={toolId} />
    </div>
  );
}

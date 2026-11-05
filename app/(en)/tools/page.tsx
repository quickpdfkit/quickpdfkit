import AllTools from "@/components/pages/AllTools";
import { pageMetadata } from "@/lib/seo";
import { languageAlternates } from "@/lib/i18n/paths";

export const metadata = pageMetadata({
  title: "All Free PDF Tools",
  description:
    "Browse every free QuickPDFKit tool. Merge, split, compress, convert, edit, sign, and protect PDFs privately in your browser.",
  path: "/tools",
  languages: languageAlternates("/tools"),
  keywords: [
    "QuickPDFKit tools",
    "free PDF tools",
    "PDF converter",
    "merge PDF",
    "compress PDF",
    "edit PDF online",
  ],
});

export default function ToolsPage() {
  return <AllTools />;
}

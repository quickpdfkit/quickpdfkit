import AllTools from "@/components/pages/AllTools";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "All Free PDF Tools",
  description:
    "Browse every free QuickPDFKit tool. Merge, split, compress, convert, edit, sign, and protect PDFs privately in your browser.",
  path: "/tools",
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

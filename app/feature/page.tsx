import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import OurFeatures from "@/components/pages/OurFeatures";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Features",
  description:
    "See what QuickPDFKit includes: free, private, in-browser tools to convert, merge, split, compress, edit, and protect PDFs.",
  path: "/feature",
  keywords: [
    "QuickPDFKit features",
    "free PDF tools",
    "PDF converter",
    "merge PDF",
    "split PDF",
    "compress PDF",
  ],
});

const page = () => {
  return (
    <div>
      <Header />
      <OurFeatures />
      <Footer />
    </div>
  );
};

export default page;

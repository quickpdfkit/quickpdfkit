import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import FAQSection from "@/components/pages/FAQSection";
import JsonLd from "@/components/seo/JsonLd";
import { faqs } from "@/config/faqs";
import { faqPageJsonLd, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "FAQ",
  description:
    "Frequently asked questions about QuickPDFKit: privacy, browser support, and how to merge, split, compress, and convert PDFs for free.",
  path: "/faq",
  keywords: [
    "QuickPDFKit FAQ",
    "PDF tools help",
    "private PDF editor",
    "merge PDF",
    "compress PDF",
    "in-browser PDF tools",
  ],
});

const page = () => {
  return (
    <div>
      <JsonLd data={faqPageJsonLd(faqs)} />
      <Header />
      <FAQSection />
      <Footer />
    </div>
  );
};

export default page;

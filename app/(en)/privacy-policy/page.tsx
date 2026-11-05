import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import PrivacyPolicy from "@/components/pages/PrivacyPolicy";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Privacy Policy",
  description:
    "Read the QuickPDFKit privacy policy. PDF tools run in your browser, and we explain what information the site collects.",
  path: "/privacy-policy",
  keywords: [
    "QuickPDFKit privacy policy",
    "PDF privacy",
    "in-browser PDF tools",
    "data protection",
  ],
});

const page = () => {
  return (
    <div>
      <Header />
      <PrivacyPolicy />
      <Footer />
    </div>
  );
};

export default page;

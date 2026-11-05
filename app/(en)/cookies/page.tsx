import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import CookiePolicy from "@/components/pages/CookiePolicy";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Cookie Policy",
  description:
    "Read how QuickPDFKit uses cookies to keep the site working and understand usage. PDF files are processed in your browser.",
  path: "/cookies",
  keywords: [
    "QuickPDFKit cookie policy",
    "cookies",
    "PDF tools privacy",
  ],
});

const page = () => {
  return (
    <div>
      <Header />
      <CookiePolicy />
      <Footer />
    </div>
  );
};

export default page;

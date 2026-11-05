import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import TermsAndConditions from "@/components/pages/TermsAndConditions";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Terms and Conditions",
  description:
    "Terms and conditions for using QuickPDFKit, the free in-browser toolkit for converting, editing, and protecting PDFs.",
  path: "/terms-conditions",
  keywords: [
    "QuickPDFKit terms",
    "PDF tools terms of use",
    "QuickPDFKit legal",
  ],
});

const page = () => {
  return (
    <div>
      <Header />
      <TermsAndConditions />
      <Footer />
    </div>
  );
};

export default page;

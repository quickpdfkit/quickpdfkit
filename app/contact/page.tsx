import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import ContactUs from "@/components/pages/ContactUs";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Contact Us",
  description:
    "Contact the QuickPDFKit team for support, feedback, or partnership questions about our free in-browser PDF tools.",
  path: "/contact",
  keywords: [
    "Contact QuickPDFKit",
    "QuickPDFKit support",
    "PDF tools help",
    "QuickPDFKit feedback",
  ],
});

const page = () => {
  return (
    <div>
      <Header />
      <ContactUs />
      <Footer />
    </div>
  );
};

export default page;

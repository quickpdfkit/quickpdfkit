import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import AboutUs from "@/components/pages/AboutUs";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "About Us",
  description:
    "Learn about QuickPDFKit, a free PDF toolkit that runs privately in your browser. Merge, convert, edit, and protect PDFs without creating an account.",
  path: "/about",
  keywords: [
    "About QuickPDFKit",
    "QuickPDFKit",
    "free PDF tools",
    "private PDF editor",
    "in-browser PDF tools",
  ],
});

const page = () => {
  return (
    <div>
      <Header />
      <AboutUs />
      <Footer />
    </div>
  );
};

export default page;

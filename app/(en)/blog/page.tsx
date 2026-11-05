import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import BlogPage from "@/components/pages/BlogPage";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Blog",
  description:
    "Tips and guides from QuickPDFKit on merging, splitting, compressing, and editing PDFs privately in your browser.",
  path: "/blog",
  keywords: [
    "QuickPDFKit blog",
    "PDF tips",
    "PDF guides",
    "merge PDF",
    "compress PDF",
    "edit PDF online",
  ],
});

const page = () => {
  return (
    <div>
      <Header />
      <BlogPage />
      <Footer />
    </div>
  );
};

export default page;

import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import BlogPage from "@/components/pages/BlogPage";
import JsonLd from "@/components/seo/JsonLd";
import { blogPosts } from "@/config/blogPosts";
import { blogIndexJsonLd, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

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
      <JsonLd
        data={blogIndexJsonLd(
          blogPosts.map((post) => ({
            title: post.title,
            description: post.description,
            path: `/blog/${post.slug}`,
          })),
        )}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
        ])}
      />
      <Header />
      <BlogPage />
      <Footer />
    </div>
  );
};

export default page;

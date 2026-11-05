import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import ContactUs from "@/components/pages/ContactUs";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { languageAlternates } from "@/lib/i18n/paths";
import { pageMetadata } from "@/lib/seo";

const copy = getDictionary("en").contactPage;

export const metadata = pageMetadata({
  title: copy.metaTitle,
  description: copy.metaDescription,
  path: "/contact",
  keywords: copy.metaKeywords,
  languages: languageAlternates("/contact"),
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

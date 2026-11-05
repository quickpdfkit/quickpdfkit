import Header from "@/components/layout/Header";
import Hero from "@/components/layout/Hero";
import ToolsGrid from "@/components/layout/ToolsGrid";
import Features from "@/components/layout/Features";
import HowItWorks from "@/components/layout/HowItWorks";
import Footer from "@/components/layout/Footer";
import JsonLd from "@/components/seo/JsonLd";
import { allTools } from "@/config/toolsData";
import { howItWorksSteps } from "@/config/howItWorks";
import {
  HOME_DESCRIPTION,
  HOME_KEYWORDS,
  HOME_TITLE,
  howToJsonLd,
  pageMetadata,
  softwareApplicationJsonLd,
} from "@/lib/seo";
import { languageAlternates } from "@/lib/i18n/paths";

export const metadata = pageMetadata({
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  path: "/",
  keywords: HOME_KEYWORDS,
  languages: languageAlternates("/"),
});

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      <JsonLd
        data={softwareApplicationJsonLd(
          HOME_DESCRIPTION,
          allTools.map((tool) => tool.title),
        )}
      />
      <JsonLd
        data={howToJsonLd({
          name: "How to use QuickPDFKit",
          description:
            "Handle your PDFs efficiently with a simple workflow. Everything you need is in one place.",
          steps: howItWorksSteps.map((step) => ({
            name: step.name,
            text: step.text,
          })),
        })}
      />
      <Header />
      <Hero />
      <ToolsGrid />
      <Features />
      <HowItWorks />
      <Footer />
    </div>
  );
}

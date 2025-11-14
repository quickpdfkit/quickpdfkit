import Header from "@/components/layout/Header";
import Hero from "@/components/layout/Hero";
import ToolsGrid from "@/components/layout/ToolsGrid";
import Features from "@/components/layout/Features";
import HowItWorks from "@/components/layout/HowItWorks";
import Footer from "@/components/layout/Footer";


export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      <Header />
      <Hero />
      <ToolsGrid />
      <Features />
      <HowItWorks />
      <Footer/>
    </div>
  );
}

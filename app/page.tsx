import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ToolsGrid from "@/components/ToolsGrid";

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      <Header />
      <Hero />
      <ToolsGrid />
    </div>
  );
}

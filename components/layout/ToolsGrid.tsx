"use client";

import ToolCard from "./ToolCard";
import { useI18n } from "@/components/i18n/I18nProvider";
import { useLocalizedTools } from "@/components/i18n/useLocalizedTools";

export default function ToolsGrid() {
  const { dictionary } = useI18n();
  const tools = useLocalizedTools();
  const copy = dictionary.toolsGrid;

  return (
    <section
      className="relative py-20 px-4 overflow-hidden bg-white"
      id="features"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(251,146,60,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(251,146,60,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900">
            {copy.titleLead} <span className="text-orange-500">{copy.titleAccent}</span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {copy.subtitle}
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tools.map((tool, index) => (
            <ToolCard key={tool.href} {...tool} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

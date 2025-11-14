"use client";

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

export default function InfoCards() {
  const cards = [
    {
      title: "Work offline with Desktop",
      description:
        "Batch edit and manage documents locally with no internet and no limits.",
      image: "/img/desktop.webp", // replace with your image path
    },
    {
      title: "On-the-go with Mobile",
      description:
        "Your favorite tools, right in your pocket. Keep working anytime, anywhere.",
      image: "/img/mobile.webp", // replace with your image path
    },
    {
      title: "Built for business",
      description:
        "Automate workflows, onboard teams easily, and scale with flexible plans.",
      image: "/img/business.webp", // replace with your image path
    },
  ];

  return (
<section className="py-24 bg-gradient-to-br from-orange-50 via-white to-gray-50 px-4">
  <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
    {cards.map((card, i) => (
      <div
        key={i}
        className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1"
      >
        {/* Top Image Section */}
        <div className="relative w-full h-[250px]">
          <Image
            src={card.image}
            alt={card.title}
            fill
            className="object-cover"
          />
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            {card.title}
          </h3>
          <p className="text-gray-600 leading-relaxed mb-6 text-sm">
            {card.description}
          </p>

          <div className="flex justify-end">
            <ArrowUpRight className="w-5 h-5 text-gray-400 hover:text-gray-900 transition-colors" />
          </div>
        </div>
      </div>
    ))}
  </div>
</section>

  );
}
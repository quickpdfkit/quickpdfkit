"use client";

import { FileText, Sparkles, Zap, Shield } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  const features = [
    { icon: Zap, text: "Lightning Fast" },
    { icon: Shield, text: "100% Secure" },
    { icon: Sparkles, text: "Free Forever" },
  ];

  return (
    <section className="relative min-h-screen py-10 flex items-center justify-center overflow-hidden px-4 pt-20 bg-gradient-to-br from-orange-50 via-white to-gray-50">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(251,146,60,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(251,146,60,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex mt-10 items-center gap-2 px-4 py-2 bg-white border border-orange-200 rounded-full mb-8 shadow-sm">
          <Sparkles className="w-4 h-4 text-orange-500" />
          <span className="text-sm text-orange-600 font-medium">
            Free Online PDF Tools
          </span>
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 text-gray-900">
          Transform Your PDFs
          <br />
          <span className="text-orange-500">In Seconds</span>
        </h1>

        {/* Subheading */}
        <p className="text-md sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          Merge, split, compress, and convert your PDF files with our powerful
          suite of tools. No registration required, completely free.
        </p>

        {/* Features */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-orange-300 transition-all"
            >
              <feature.icon className="w-5 h-5 text-orange-500" />
              <span className="text-sm text-gray-700 font-medium">
                {feature.text}
              </span>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/tools">
            <button className="inline-flex px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 gap-2">
              <FileText className="w-5 h-5" />
              Explore Tools
            </button>
          </Link>

          <Link href="#features">
            <button className="inline-flex px-8 py-4 bg-white hover:bg-gray-50 border border-gray-300 hover:border-orange-400 text-gray-700 rounded-xl font-semibold text-lg shadow-sm hover:shadow-md transition-all duration-300">
              Learn More
            </button>
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-20 hidden grid grid-cols-2 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
          {[
            { label: "Tools Available", value: "15+" },
            { label: "Files Processed", value: "1M+" },
            { label: "Happy Users", value: "500K+" },
          ].map((stat, index) => (
            <div
              key={index}
              className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-3xl sm:text-4xl font-bold text-orange-500 mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

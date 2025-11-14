



"use client";

import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface ToolCardProps {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  gradient: string;
  index?: number;
}

export default function ToolCard({
  title,
  description,
  href,
  icon: Icon,
  gradient,
  index = 0,
}: ToolCardProps) {
  return (
    <Link href={href} className="block h-full group">
      <div className="h-full bg-white border border-gray-200 hover:border-orange-400 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300">
        {/* Icon Container */}
        <div className="mb-4">
          <div className="inline-flex p-4 rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 shadow-md">
            <Icon className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Content */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
          {title}
        </h3>
        <p className="text-gray-600 text-sm group-hover:text-gray-700 transition-colors">
          {description}
        </p>

        {/* Arrow Icon */}
        <div className="mt-4 flex items-center text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-sm font-medium mr-2">Get started</span>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </div>
      </div>
    </Link>
  );
}
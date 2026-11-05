import type { MetadataRoute } from "next";
import { allTools } from "@/config/toolsData";
import { toolsMap } from "@/config/tools";
import { SITE_URL } from "@/lib/seo";

const staticRoutes: {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/tools", changeFrequency: "weekly", priority: 0.9 },
  { path: "/feature", changeFrequency: "monthly", priority: 0.6 },
  { path: "/faq", changeFrequency: "monthly", priority: 0.6 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.6 },
  { path: "/about", changeFrequency: "yearly", priority: 0.5 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.5 },
  { path: "/privacy-policy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms-conditions", changeFrequency: "yearly", priority: 0.3 },
  { path: "/cookies", changeFrequency: "yearly", priority: 0.3 },
];

function toAbsolute(path: string): string {
  if (path === "/") return SITE_URL;
  return `${SITE_URL}${path}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const toolPaths = new Set<string>([
    ...Object.keys(toolsMap).map((id) => `/tools/${id}`),
    ...allTools.map((tool) => tool.href),
  ]);

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: toAbsolute(route.path),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const toolEntries: MetadataRoute.Sitemap = [...toolPaths]
    .sort()
    .map((path) => ({
      url: toAbsolute(path),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));

  return [...staticEntries, ...toolEntries];
}

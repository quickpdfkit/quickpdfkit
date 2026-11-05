import type { MetadataRoute } from "next";
import { allTools } from "@/config/toolsData";
import { toolsMap } from "@/config/tools";
import { SITE_URL } from "@/lib/seo";
import { LOCALES } from "@/lib/i18n/locales";
import { languageAlternates, localizedPath } from "@/lib/i18n/paths";

const staticRoutes: {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
  localized?: boolean;
}[] = [
  { path: "/", changeFrequency: "weekly", priority: 1, localized: true },
  { path: "/tools", changeFrequency: "weekly", priority: 0.9, localized: true },
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

function languageMap(englishPath: string): Record<string, string> {
  return Object.fromEntries(
    Object.entries(languageAlternates(englishPath)).map(([locale, path]) => [
      locale,
      toAbsolute(path),
    ]),
  );
}

export default function sitemap(): MetadataRoute.Sitemap {
  const toolPaths = [...new Set<string>([
    ...Object.keys(toolsMap).map((id) => `/tools/${id}`),
    ...allTools.map((tool) => tool.href),
  ])].sort();

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.flatMap((route) => {
    const english: MetadataRoute.Sitemap[number] = {
      url: toAbsolute(route.path),
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      ...(route.localized
        ? { alternates: { languages: languageMap(route.path) } }
        : {}),
    };
    if (!route.localized) return [english];
    const localized = LOCALES.map((locale) => ({
      url: toAbsolute(localizedPath(locale, route.path)),
      changeFrequency: route.changeFrequency,
      priority: route.path === "/" ? 0.9 : route.priority,
      alternates: { languages: languageMap(route.path) },
    }));
    return [english, ...localized];
  });

  const toolEntries: MetadataRoute.Sitemap = toolPaths.flatMap((path) => {
    const english: MetadataRoute.Sitemap[number] = {
      url: toAbsolute(path),
      changeFrequency: "monthly",
      priority: 0.8,
      alternates: { languages: languageMap(path) },
    };
    const localized = LOCALES.map((locale) => ({
      url: toAbsolute(localizedPath(locale, path)),
      changeFrequency: "monthly" as const,
      priority: 0.8,
      alternates: { languages: languageMap(path) },
    }));
    return [english, ...localized];
  });

  return [...staticEntries, ...toolEntries];
}

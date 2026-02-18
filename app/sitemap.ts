// app/sitemap.ts
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://quickpdfkit.com";

  const productLinks = [
    "/",              // Home
    "/feature",
    "/tools",
    "/faq",
  ];

  const solutionsLinks = [
    "/tools/edit-pdf",
    "/tools/merge-pdf",
    "/tools/split-pdf-online",
    "/tools/image-to-pdf-converter",
  ];

  const policiesLinks = [
    "/privacy-policy",
    "/terms-conditions",
    "/cookies",
  ];

  const companyLinks = [
    "/about",
    "/contact",
    "/blog",
  ];

  const allRoutes = [
    ...productLinks,
    ...solutionsLinks,
    ...policiesLinks,
    ...companyLinks,
  ];

  return allRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: route === "/" ? 1 : 0.8,
  }));
}

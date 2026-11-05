"use client";

import { allTools } from "@/config/toolsData";
import { localizedPath } from "@/lib/i18n/paths";
import type { Dictionary } from "@/lib/i18n/types";
import { useI18n } from "./I18nProvider";

export function categoryLabel(dictionary: Dictionary, category: string) {
  if (category in dictionary.categories) {
    return dictionary.categories[category as keyof Dictionary["categories"]];
  }
  return category;
}

export function useLocalizedTools() {
  const { locale, dictionary } = useI18n();
  return allTools.map((tool) => {
    const id = tool.href.replace("/tools/", "");
    const copy = dictionary.tools[id];
    const label = categoryLabel(dictionary, tool.category);
    return {
      ...tool,
      id,
      title: copy?.title ?? tool.title,
      description: copy?.description ?? tool.description,
      href: localizedPath(locale, tool.href),
      categoryKey: tool.category,
      categoryLabel: label,
      searchText: [tool.title, tool.description, copy?.title, copy?.description, tool.category, label]
        .filter(Boolean)
        .join(" ")
        .toLowerCase(),
    };
  });
}

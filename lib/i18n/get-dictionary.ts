import type { Dictionary, ToolCopy, UiCopy } from "./types";
import type { AppLocale } from "./locales";
import { enUi } from "./dictionaries/ui/en";
import { esUi } from "./dictionaries/ui/es";
import { arUi } from "./dictionaries/ui/ar";
import { frUi } from "./dictionaries/ui/fr";
import { ptUi } from "./dictionaries/ui/pt";
import { hiUi } from "./dictionaries/ui/hi";
import { enTools } from "./dictionaries/tools/en";
import { esTools } from "./dictionaries/tools/es";
import { arTools } from "./dictionaries/tools/ar";
import { frTools } from "./dictionaries/tools/fr";
import { ptTools } from "./dictionaries/tools/pt";
import { hiTools } from "./dictionaries/tools/hi";

function build(ui: UiCopy, tools: Record<string, ToolCopy>): Dictionary {
  return { ...ui, tools };
}

const dictionaries: Record<AppLocale, Dictionary> = {
  en: build(enUi, enTools),
  es: build(esUi, esTools),
  ar: build(arUi, arTools),
  fr: build(frUi, frTools),
  pt: build(ptUi, ptTools),
  hi: build(hiUi, hiTools),
};

const toolIds = Object.keys(enTools);

function assertDictionary(locale: string, dictionary: Dictionary) {
  const missing = toolIds.filter((id) => {
    const tool = dictionary.tools[id];
    return (
      !tool ||
      !tool.title ||
      !tool.description ||
      !tool.metaTitle ||
      !tool.metaDescription ||
      tool.lead == null ||
      !tool.accent ||
      tool.trail == null ||
      !tool.subtitle
    );
  });
  if (missing.length > 0) {
    throw new Error(`Incomplete tool copy for ${locale}: ${missing.join(", ")}`);
  }
  const extra = Object.keys(dictionary.tools).filter((id) => !toolIds.includes(id));
  if (extra.length > 0) {
    throw new Error(`Unknown tool ids for ${locale}: ${extra.join(", ")}`);
  }
}

for (const [locale, dictionary] of Object.entries(dictionaries)) {
  assertDictionary(locale, dictionary);
}

export function getDictionary(locale: AppLocale): Dictionary {
  return dictionaries[locale];
}

export const TOOL_IDS = toolIds;

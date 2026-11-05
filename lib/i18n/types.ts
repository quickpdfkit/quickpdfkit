export interface ToolCopy {
  title: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  lead: string;
  accent: string;
  trail: string;
  subtitle: string;
}

export interface ToolGuideCopy {
  name: string;
  description: string;
  stepName: string;
  stepText: string;
}

export interface Dictionary {
  meta: {
    homeTitle: string;
    homeDescription: string;
    homeKeywords: string[];
    toolsIndexTitle: string;
    toolsIndexDescription: string;
    toolsIndexKeywords: string[];
    ogImageAlt: string;
    howToName: string;
    howToDescription: string;
  };
  language: {
    label: string;
  };
  nav: {
    home: string;
    tools: string;
    about: string;
    contact: string;
    allTools: string;
    search: string;
    convertToPdf: string;
    editOrganize: string;
    featured: string;
    protectPdf: string;
    secureYourFiles: string;
    mostPopular: string;
    viewAllTools: string;
    searchPlaceholder: string;
    popularSearches: string;
    suggestions: string[];
    noToolsFound: string;
    trySearching: string;
    clearSearch: string;
    viewAllResults: string;
    pressEnter: string;
    resultsCount: string;
    toggleMenu: string;
    imageToPdf: string;
    jpgToPdf: string;
    pngToPdf: string;
    webpToPdf: string;
    mergePdf: string;
    splitPdf: string;
    compressPdf: string;
    editPdf: string;
  };
  hero: {
    badge: string;
    titleLead: string;
    titleAccent: string;
    subtitle: string;
    fast: string;
    secure: string;
    freeForever: string;
    exploreTools: string;
    learnMore: string;
    stats: { value: string; label: string }[];
  };
  features: {
    cards: { title: string; description: string }[];
  };
  howItWorks: {
    titleLead: string;
    titleAccent: string;
    subtitle: string;
    steps: { positionLabel: string; name: string; text: string }[];
    trustedTitle: string;
    trustedText: string;
  };
  toolsGrid: {
    titleLead: string;
    titleAccent: string;
    subtitle: string;
    getStarted: string;
  };
  toolsIndex: {
    titleLead: string;
    titleAccent: string;
    subtitle: string;
    searchPlaceholder: string;
    filterByCategory: string;
    showing: string;
    toolSingular: string;
    toolPlural: string;
    clearSearch: string;
    noToolsFound: string;
    noToolsHint: string;
    resetFilters: string;
    ctaTitle: string;
    ctaText: string;
    contactUs: string;
  };
  footer: {
    product: string;
    solutions: string;
    policies: string;
    company: string;
    home: string;
    features: string;
    tools: string;
    faq: string;
    editPdf: string;
    mergePdf: string;
    splitPdf: string;
    imageToPdf: string;
    privacy: string;
    terms: string;
    cookies: string;
    about: string;
    contact: string;
    blog: string;
    rights: string;
  };
  categories: {
    All: string;
    Convert: string;
    Edit: string;
    Organize: string;
    Security: string;
    Optimize: string;
    View: string;
  };
  notFound: {
    title: string;
    description: string;
  };
  toolGuides: {
    "add-blank-pages-to-pdf": ToolGuideCopy;
    "hyper-compress-pdf": ToolGuideCopy;
  };
  tools: Record<string, ToolCopy>;
}

export type UiCopy = Omit<Dictionary, "tools">;

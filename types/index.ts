export interface SiteSettings {
  site_title: string;
  site_description: string;
  logo_text: string;
  head_scripts: string;
}

export interface MenuItem {
  id: number;
  title: string;
  url: string;
  is_active: boolean;
  sort_order: number;
}

export interface PageMeta {
  title: string;
  description: string;
  keywords: string;
  author: string;
  canonical_url: string;
}

export interface AdPosition {
  header: string;
  footer: string;
  homepage_top: string;
}
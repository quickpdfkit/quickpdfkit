"use client";

import {
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
  Music, // Using for TikTok
} from "lucide-react";
import Link from "next/link";
import { useI18n, useLocalizedHref } from "@/components/i18n/I18nProvider";
import { CONTACT_EMAIL } from "@/lib/contact";

export default function Footer() {
  const { dictionary } = useI18n();
  const href = useLocalizedHref();
  const copy = dictionary.footer;
  const productLinks = [
    { name: copy.home, href: href("/") },
    { name: copy.features, href: "/feature" },
    { name: copy.tools, href: href("/tools") },
    { name: copy.faq, href: "/faq" },
  ];

  const solutionsLinks = [
    { name: copy.editPdf, href: href("/tools/edit-pdf") },
    { name: copy.mergePdf, href: href("/tools/merge-pdf") },
    { name: copy.splitPdf, href: href("/tools/split-pdf-online") },
    { name: copy.imageToPdf, href: href("/tools/image-to-pdf-converter") },
  ];

  const policiesLinks = [
    { name: copy.privacy, href: "/privacy-policy" },
    { name: copy.terms, href: "/terms-conditions" },
    { name: copy.cookies, href: "/cookies" },
  ];

  const companyLinks = [
    { name: copy.about, href: "/about" },
    { name: copy.contact, href: href("/contact") },
    { name: copy.blog, href: "/blog" },
  ];

  const socialIcons = [
    { icon: Twitter, link: "https://twitter.com" },
    { icon: Facebook, link: "https://facebook.com" },
    { icon: Instagram, link: "https://instagram.com" },
    { icon: Linkedin, link: "https://linkedin.com" },
    { icon: Music, link: "https://tiktok.com" }, // TikTok placeholder
  ];

  const renderLinks = (links: { name: string; href: string }[]) =>
    links.map((link) => (
      <li key={link.name} className="mb-2">
        <Link
          href={link.href}
          className="text-gray-700 hover:text-orange-500 transition-colors text-sm"
        >
          {link.name}
        </Link>
      </li>
    ));

  return (
    <footer className="bg-gray-100 text-gray-700 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
        <div>
          <h4 className="text-lg font-semibold mb-4">{copy.product}</h4>
          <ul>{renderLinks(productLinks)}</ul>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">{copy.solutions}</h4>
          <ul>{renderLinks(solutionsLinks)}</ul>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">{copy.policies}</h4>
          <ul>{renderLinks(policiesLinks)}</ul>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">{copy.company}</h4>
          <ul>
            {renderLinks(companyLinks)}
            <li className="mb-2">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-gray-700 hover:text-orange-500 transition-colors text-sm"
              >
                {copy.email}{" "}
                <span dir="ltr">{CONTACT_EMAIL}</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <hr className="border-gray-300 my-8" />

      <div className="flex justify-center gap-6">
        {socialIcons.map((social, index) => (
          <Link
            key={index}
            href={social.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-700 hover:text-orange-500 transition-colors"
          >
            <social.icon className="w-5 h-5" />
          </Link>
        ))}
      </div>

      <p className="text-center text-gray-500 text-sm mt-6">
        &copy; {new Date().getFullYear()} <Link href={href("/")}>quickpdfkit.com</Link> . {copy.rights}
      </p>
    </footer>
  );
}

"use client";

import {
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
  Music, // Using for TikTok
} from "lucide-react";
import Link from "next/link";

export default function Footer() {
  const productLinks = [
    { name: "Home", href: "/" },
    { name: "Features", href: "/feature" },
    { name: "Tools", href: "/tools" },
    { name: "FAQ", href: "/faq" },
  ];

  const solutionsLinks = [
    { name: "Edit PDF", href: "/tools/edit-pdf" },
    { name: "Merge PDF", href: "/tools/merge-pdf" },
    { name: "Split PDF", href: "/tools/split-pdf-online" },
    { name: "Imgae to PDF", href: "/tools/image-to-pdf-converter" },
  ];

  const policiesLinks = [
    { name: "Privacy policy", href: "/privacy-policy" },
    { name: "Terms & conditions", href: "/terms-conditions" },
    { name: "Cookies", href: "/cookies" },
  ];

  const companyLinks = [
    { name: "About us", href: "/about" },
    { name: "Contact us", href: "/contact" },
    { name: "Blog", href: "/blog" },
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
          <h4 className="text-lg font-semibold mb-4">Product</h4>
          <ul>{renderLinks(productLinks)}</ul>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">Solutions</h4>
          <ul>{renderLinks(solutionsLinks)}</ul>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">Policies</h4>
          <ul>{renderLinks(policiesLinks)}</ul>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4">Company</h4>
          <ul>{renderLinks(companyLinks)}</ul>
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
        &copy; {new Date().getFullYear()} <Link href="/">quickpdfkit.com</Link> . All rights reserved.
      </p>
    </footer>
  );
}

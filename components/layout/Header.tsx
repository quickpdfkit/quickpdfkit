"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  X,
  Search,
  Heart,
  ChevronDown,
  FileText,
  Image as ImageIcon,
  Lock,
  Unlock,
  Scissors,
  Minimize2,
  FileEdit,
  Star,
  ArrowRight,
  Repeat,
} from "lucide-react";
import { allTools } from "@/config/toolsData";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Filter tools based on search query
  const filteredTools = searchQuery
    ? allTools.filter(
        (tool) =>
          tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tool.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Show max 6 results in search modal
  const searchResults = filteredTools.slice(0, 6);

  const handleToolClick = (href: string) => {
    setIsSearchOpen(false);
    setSearchQuery("");
    router.push(href);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchResults.length > 0) {
      handleToolClick(searchResults[0].href);
    }
  };

  const convertToPdfTools = [
    { name: "Image to PDF", href: "/tools/image-to-pdf-converter", icon: ImageIcon },
    { name: "JPG to PDF", href: "/tools/jpg-to-pdf", icon: ImageIcon },
    { name: "PNG to PDF", href: "/tools/png-to-pdf-converter", icon: ImageIcon },
    { name: "WEBP to PDF", href: "/tools/webp-to-pdf-converter", icon: ImageIcon },
  ];

  const editTools = [
    { name: "Merge PDF", href: "/tools/merge-pdf", icon: FileText },
    { name: "Split PDF", href: "/tools/split-pdf-online", icon: Scissors },
    { name: "Compress PDF", href: "/tools/compress-pdf", icon: Minimize2 },
    { name: "Protect PDF", href: "/tools/protect-pdf", icon: Lock },
    { name: "Edit PDF", href: "/tools/edit-pdf", icon: FileEdit },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-sm sm:m-3 sm:rounded-xl "
            : "bg-white/80 backdrop-blur-md "
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative">
                <Repeat className="w-7 h-7 sm:w-8 sm:h-8 fill-orange-500 text-orange-500 transition-transform group-hover:scale-110" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-gray-900">
                Could <span className="text-orange-500">Fix PDF</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link
                href="/"
                className="px-4 py-2 text-gray-600 hover:text-orange-500 transition-colors relative group"
              >
                Home
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300" />
              </Link>

              {/* Tools Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setIsToolsOpen(true)}
                onMouseLeave={() => setIsToolsOpen(false)}
              >
                <button className="px-4 py-2 text-gray-600 hover:text-orange-500 transition-colors flex items-center gap-1 group">
                  Tools
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-300 ${
                      isToolsOpen ? "rotate-180" : ""
                    }`}
                  />
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300" />
                </button>

                {/* Dropdown Menu - Added pt-2 to bridge the gap */}
                {isToolsOpen && (
                  <div className="absolute top-full left-0 pt-2">
                    <div className="w-[800px] bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
                      <div className="grid grid-cols-3 gap-6 p-6">
                        {/* Convert to PDF */}
                        <div>
                          <h4 className="text-sm font-semibold text-orange-600 mb-3 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Convert to PDF
                          </h4>
                          <ul className="space-y-2">
                            {convertToPdfTools.map((tool) => (
                              <li key={tool.name}>
                                <Link
                                  href={tool.href}
                                  className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 rounded-lg hover:bg-orange-50 transition-all group"
                                >
                                  <div className="p-1.5 rounded-lg bg-orange-100">
                                    <tool.icon className="w-3.5 h-3.5 text-orange-600" />
                                  </div>
                                  <span className="group-hover:translate-x-1 transition-transform">
                                    {tool.name}
                                  </span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Edit & Organize */}
                        <div>
                          <h4 className="text-sm font-semibold text-orange-600 mb-3 flex items-center gap-2">
                            <FileEdit className="w-4 h-4" />
                            Edit & Organize
                          </h4>
                          <ul className="space-y-2">
                            {editTools.map((tool) => (
                              <li key={tool.name}>
                                <Link
                                  href={tool.href}
                                  className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 rounded-lg hover:bg-orange-50 transition-all group"
                                >
                                  <div className="p-1.5 rounded-lg bg-orange-100">
                                    <tool.icon className="w-3.5 h-3.5 text-orange-600" />
                                  </div>
                                  <span className="group-hover:translate-x-1 transition-transform">
                                    {tool.name}
                                  </span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Featured */}
                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                          <h4 className="text-sm font-semibold text-orange-600 mb-3 flex items-center gap-2">
                            <Star className="w-4 h-4 fill-orange-500 text-orange-500" />
                            Featured
                          </h4>
                          <div className="space-y-3">
                            <div className="p-3 bg-white rounded-lg border border-orange-200">
                              <div className="flex items-start gap-2 mb-2">
                                <Lock className="w-4 h-4 text-orange-500 mt-0.5" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    Protect PDF
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    Secure your files
                                  </p>
                                </div>
                              </div>
                              <span className="text-xs px-2 py-1 bg-orange-100 text-orange-600 rounded-full">
                                Most Popular
                              </span>
                            </div>
                            <Link
                              href="/tools"
                              className="block w-full py-2 px-4 text-sm text-center bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-all shadow-sm"
                            >
                              View All Tools →
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Link
                href="/about"
                className="px-4 py-2 text-gray-600 hover:text-orange-500 transition-colors relative group"
              >
                About
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300" />
              </Link>

              <Link
                href="/contact"
                className="px-4 py-2 text-gray-600 hover:text-orange-500 transition-colors relative group"
              >
                Contact
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300" />
              </Link>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search Button */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-gray-600 hover:text-orange-500 transition-colors hover:scale-105 active:scale-95"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Login Button - Desktop */}
              <Link
                href="/tools"
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-all shadow-sm hover:shadow-md"
              >
                Tools
              </Link>

              {/* Mobile Menu Button */}
            
            </div>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 text-gray-600 hover:text-orange-500 transition-colors hover:scale-105 active:scale-95"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200 animate-slideDown">
            <div className="px-4 py-6 space-y-2">
              <Link
                href="/"
                className="block px-4 py-2 text-gray-600 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-all"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/tools"
                className="block px-4 py-2 text-gray-600 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-all"
                onClick={() => setIsMenuOpen(false)}
              >
                All Tools
              </Link>
              <Link
                href="/about"
                className="block px-4 py-2 text-gray-600 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-all"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/contact"
                className="block px-4 py-2 text-gray-600 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-all"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Search Modal */}
      {isSearchOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20 px-4 animate-fadeIn"
          onClick={() => {
            setIsSearchOpen(false);
            setSearchQuery("");
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-white border border-gray-200 rounded-2xl shadow-2xl animate-scaleIn overflow-hidden"
          >
            {/* Search Input */}
            <div className="flex items-center gap-4 p-6 border-b border-gray-100">
              <Search className="w-6 h-6 text-orange-500" />
              <input
                type="text"
                placeholder="Search for tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent text-gray-900 placeholder-gray-400 outline-none text-lg"
                autoFocus
              />
              <button
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchQuery("");
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Search Results */}
            <div className="max-h-96 overflow-y-auto">
              {searchQuery === "" ? (
                // Default suggestions
                <div className="p-6">
                  <p className="text-sm text-gray-500 mb-4">
                    Popular searches:
                  </p>
                  <div className="space-y-2">
                    {["Merge PDF", "Compress PDF", "Convert to PDF", "Protect PDF", "Edit PDF"].map(
                      (suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => setSearchQuery(suggestion)}
                          className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-orange-50 rounded-lg transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <Search className="w-4 h-4 text-gray-400 group-hover:text-orange-500" />
                            <span className="group-hover:text-orange-600">
                              {suggestion}
                            </span>
                          </div>
                        </button>
                      )
                    )}
                  </div>
                </div>
              ) : searchResults.length > 0 ? (
                // Search results
                <div className="p-2">
                  {searchResults.map((tool) => {
                    const IconComponent = tool.icon;
                    return (
                      <button
                        key={tool.href}
                        onClick={() => handleToolClick(tool.href)}
                        className="w-full text-left px-4 py-4 hover:bg-orange-50 rounded-lg transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl bg-gradient-to-br ${tool.gradient}`}>
                            <IconComponent className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                              {tool.title}
                            </h4>
                            <p className="text-sm text-gray-500 line-clamp-1">
                              {tool.description}
                            </p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-orange-500 opacity-0 group-hover:opacity-100 transition-all" />
                        </div>
                      </button>
                    );
                  })}
                  {filteredTools.length > 6 && (
                    <div className="px-4 py-3 text-center border-t border-gray-100 mt-2">
                      <button
                        onClick={() => {
                          router.push("/tools");
                          setIsSearchOpen(false);
                          setSearchQuery("");
                        }}
                        className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                      >
                        View all {filteredTools.length} results →
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                // No results
                <div className="p-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-4">
                    <Search className="w-8 h-8 text-orange-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No tools found
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Try searching for "merge", "compress", or "convert"
                  </p>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                  >
                    Clear search
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            {searchQuery && searchResults.length > 0 && (
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                <p className="text-xs text-gray-500 flex items-center justify-between">
                  <span>Press Enter to select first result</span>
                  <span className="font-medium">
                    {searchResults.length} of {filteredTools.length} results
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
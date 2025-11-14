import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://pdftools.com'),
  title: {
    default: "PDF Tools - Free Online PDF Converter & Editor | 48+ Tools",
    template: "%s | PDF Tools"
  },
  description: "Free online PDF tools for all your needs. Convert, merge, split, compress, edit, and protect PDFs. 48+ powerful tools including PDF to Word, Image to PDF, and more. No registration required.",
  keywords: [
    "PDF tools",
    "PDF converter",
    "merge PDF",
    "split PDF",
    "compress PDF",
    "PDF editor",
    "PDF to Word",
    "Image to PDF",
    "protect PDF",
    "free PDF tools",
    "online PDF converter",
    "PDF merger",
    "PDF splitter",
    "edit PDF online",
    "convert PDF",
    "PDF watermark"
  ],
  authors: [{ name: "PDF Tools Team" }],
  creator: "PDF Tools",
  publisher: "PDF Tools",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://pdftools.com",
    siteName: "PDF Tools",
    title: "PDF Tools - Free Online PDF Converter & Editor",
    description: "Free online PDF tools for all your needs. Convert, merge, split, compress, edit, and protect PDFs. 48+ powerful tools available.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PDF Tools - Free Online PDF Converter & Editor"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "PDF Tools - Free Online PDF Converter & Editor",
    description: "Free online PDF tools for all your needs. Convert, merge, split, compress, edit, and protect PDFs.",
    images: ["/twitter-image.png"],
    creator: "@pdftools"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png" },
    ],
  },
  manifest: "/site.webmanifest",
  alternates: {
    canonical: "https://pdftools.com",
  },
  category: "Technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

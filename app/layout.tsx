import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://quickpdfkit.com'),
  title: {
    default: "Fix PDF Tools - Free Online PDF Converter & Editor | 48+ Tools",
    template: "%s | Fix PDF Tools"
  },
  description: "Free online Could Fix Fix PDF Tools for all your needs. Convert, merge, split, compress, edit, and protect PDFs. 48+ powerful tools including PDF to Word, Image to PDF, and more. No registration required.",
  keywords: [
    "Fix PDF Tools",
    "PDF converter",
    "merge PDF",
    "split PDF",
    "compress PDF",
    "PDF editor",
    "PDF to Word",
    "Image to PDF",
    "protect PDF",
    "free Fix PDF Tools",
    "online PDF converter",
    "PDF merger",
    "PDF splitter",
    "edit PDF online",
    "convert PDF",
    "PDF watermark",
    "Could Fix It"

  ],
  authors: [{ name: "Fix PDF Tools Team" }],
  creator: "Could Fix It",
  publisher: "Could Fix It",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://quickpdfkit.com",
    siteName: "Fix PDF Tools",
    title: "Fix PDF Tools - Free Online Could Fix PDF Converter & Editor",
    description: "Free online Fix PDF Tools for all your needs. Convert, merge, split, compress, edit, and protect PDFs. 48+ powerful tools available.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Fix PDF Tools - Free Online PDF Converter & Editor"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Fix PDF Tools - Free Online Could Fix PDF Converter & Editor",
    description: "Free online Fix PDF Tools for all your needs. Convert, merge, split, compress, edit, and protect PDFs.",
    images: ["/twitter-image.png"],
    creator: "@QuickFixPdf"
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
    canonical: "https://quickpdfkit.com",
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
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-FBM4Q0Q5XM"
          strategy="afterInteractive"
        />

        <Script id="google-analytics" strategy="afterInteractive">
          {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-FBM4Q0Q5XM');
  `}
        </Script>

        {children}
      </body>
    </html>
  );
}

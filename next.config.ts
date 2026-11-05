import type { NextConfig } from "next";

/**
 * Static security headers for the App Router site.
 *
 * A nonce CSP would force every page to dynamic rendering. These headers stay
 * in `headers()` so the site can remain static on Vercel.
 *
 * script-src keeps Next.js inline bootstrap and the gtag snippet ('unsafe-inline'),
 * AdSense ('unsafe-eval' plus Google script hosts), and PDF.js
 * ('wasm-unsafe-eval', blob workers). frame-src / connect-src / img-src allow
 * AdSense creatives, SafeFrames, and analytics beacons. In-browser tools also
 * need data: and blob: for previews, signatures, and PDF.js workers.
 *
 * Strict-Transport-Security is omitted on purpose. Vercel already sends HSTS.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  [
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' blob:",
    "https://*.googlesyndication.com",
    "https://*.safeframe.googlesyndication.com",
    "https://*.googleadservices.com",
    "https://*.googletagservices.com",
    "https://*.google.com",
    "https://*.gstatic.com",
    "https://*.google-analytics.com",
    "https://*.analytics.google.com",
    "https://*.googletagmanager.com",
    "https://*.adtrafficquality.google",
    "https://*.doubleclick.net",
    "https://*.g.doubleclick.net",
    "https://*.googleapis.com",
    "https://*.2mdn.net",
  ].join(" "),
  [
    "style-src 'self' 'unsafe-inline'",
    "https://fonts.googleapis.com",
    "https://*.gstatic.com",
    "https://*.googlesyndication.com",
  ].join(" "),
  [
    "img-src 'self' data: blob: https:",
  ].join(" "),
  "font-src 'self' data: https://fonts.gstatic.com https://*.gstatic.com",
  [
    "connect-src 'self' data: blob:",
    "https://*.google.com",
    "https://*.googleapis.com",
    "https://*.gstatic.com",
    "https://*.googlesyndication.com",
    "https://*.googleadservices.com",
    "https://*.doubleclick.net",
    "https://*.g.doubleclick.net",
    "https://*.google-analytics.com",
    "https://*.analytics.google.com",
    "https://*.googletagmanager.com",
    "https://*.adtrafficquality.google",
    "https://*.googleusercontent.com",
    "https://*.googlevideo.com",
    "https://*.2mdn.net",
  ].join(" "),
  [
    "frame-src 'self' blob:",
    "https://*.googlesyndication.com",
    "https://*.safeframe.googlesyndication.com",
    "https://*.doubleclick.net",
    "https://*.g.doubleclick.net",
    "https://*.google.com",
    "https://*.adtrafficquality.google",
    "https://*.googleadservices.com",
    "https://*.googletagmanager.com",
  ].join(" "),
  "worker-src 'self' blob:",
  "media-src 'self' data: blob: https://*.googlesyndication.com https://*.g.doubleclick.net https://*.googlevideo.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const permissionsPolicy = [
  "accelerometer=()",
  "ambient-light-sensor=()",
  "bluetooth=()",
  "camera=()",
  "clipboard-read=(self)",
  "clipboard-write=(self)",
  "display-capture=()",
  "document-domain=()",
  "fullscreen=(self)",
  "geolocation=()",
  "gyroscope=()",
  "hid=()",
  "idle-detection=()",
  "interest-cohort=()",
  "magnetometer=()",
  "microphone=()",
  "midi=()",
  "payment=()",
  "picture-in-picture=()",
  "publickey-credentials-get=()",
  "screen-wake-lock=()",
  "serial=()",
  "usb=()",
  "web-share=()",
  "xr-spatial-tracking=()",
].join(", ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: permissionsPolicy },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;

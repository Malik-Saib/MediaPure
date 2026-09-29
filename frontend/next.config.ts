import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// Next.js's dev bundler wraps every module in eval() and the HMR client opens a
// websocket, so development needs 'unsafe-eval' and ws:. Without them the browser
// refuses to run the client bundle and nothing on the page hydrates.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  // The video cleaner reads duration, dimensions and a poster frame from a blob: URL
  // before uploading, so media: must allow blob: or the preview never loads.
  "media-src 'self' blob:",
  "font-src 'self'",
  // The contact form posts to Formspree from the browser, so that origin has to be
  // reachable or the CSP blocks the request before it is sent.
  `connect-src 'self' https://formspree.io${isDev ? " ws: wss:" : ""}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  output: "standalone",
  images: { formats: ["image/avif", "image/webp"] },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
    // Rewrites to the API buffer request bodies; the default cap is 10 MB. Match the video
    // upload limit plus headroom, which is the larger of the two. In production nginx routes
    // /api straight to FastAPI, so this only applies to dev and single-process setups.
    middlewareClientMaxBodySize: "520mb",
  },
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL?.trim() || (isDev ? "http://127.0.0.1:8000" : "");
    if (!backendUrl) {
      throw new Error("BACKEND_URL must point to the deployed FastAPI origin when building for production.");
    }

    let origin: URL;
    try {
      origin = new URL(backendUrl);
    } catch {
      throw new Error("BACKEND_URL must be a valid HTTP or HTTPS origin.");
    }
    if (!["http:", "https:"].includes(origin.protocol) || origin.pathname !== "/" || origin.search || origin.hash) {
      throw new Error("BACKEND_URL must be an HTTP or HTTPS origin without a path, query, or fragment.");
    }

    return [{ source: "/api/:path*", destination: `${origin.origin}/api/:path*` }];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
      {
        source: "/brand/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default config;

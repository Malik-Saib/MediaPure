import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name} — ${site.tagline}`,
    short_name: site.shortName,
    description: site.description,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1463ff",
    categories: ["utilities", "productivity", "photo", "video"],
    icons: [
      { src: "/brand/mediapure-icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/brand/mediapure-icon-256.webp", sizes: "256x256", type: "image/webp" },
    ],
    shortcuts: site.tools.map((t) => ({ name: t.label, url: t.href, description: t.blurb })),
  };
}

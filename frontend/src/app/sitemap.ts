import type { MetadataRoute } from "next";
import { posts } from "@/lib/blog";
import { absolute } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages: [string, number, MetadataRoute.Sitemap[number]["changeFrequency"]][] = [
    ["/", 1, "weekly"], ["/image-metadata-cleaner", 0.95, "weekly"], ["/video-metadata-cleaner", 0.95, "weekly"],
    ["/features", 0.8, "monthly"],
    ["/how-it-works", 0.8, "monthly"], ["/privacy-security", 0.7, "monthly"], ["/faq", 0.7, "monthly"],
    ["/blog", 0.7, "weekly"], ["/about", 0.5, "yearly"], ["/contact", 0.5, "yearly"],
    ["/privacy-policy", 0.3, "yearly"], ["/terms", 0.3, "yearly"],
  ];
  return [
    ...pages.map(([p, priority, changeFrequency]) => ({ url: absolute(p), lastModified: now, priority, changeFrequency })),
    ...posts.map((p) => ({ url: absolute(`/blog/${p.slug}`), lastModified: new Date(p.updated ?? p.date), priority: 0.6, changeFrequency: "monthly" as const })),
  ];
}

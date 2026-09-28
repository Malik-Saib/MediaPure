import type { Metadata } from "next";
import { absolute, site } from "./site";

export function pageMeta(opts: {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  noindex?: boolean;
  keywords?: string[];
}): Metadata {
  const url = absolute(opts.path);
  return {
    title: { absolute: opts.title },
    description: opts.description,
    keywords: opts.keywords,
    alternates: { canonical: url },
    robots: opts.noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      title: opts.title,
      description: opts.description,
      url,
      siteName: site.name,
      type: opts.type ?? "website",
      images: [{ url: absolute("/og.png"), width: 1200, height: 630, alt: site.name }],
    },
    twitter: { card: "summary_large_image", title: opts.title, description: opts.description, images: [absolute("/og.png")] },
  };
}

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${site.url}/#organization`,
  name: site.name,
  alternateName: ["Media Pure", "MediaPure.com"],
  url: site.url,
  email: site.company.email,
  logo: absolute("/brand/mediapure-icon-512.png"),
  image: absolute("/og.png"),
  description: site.description,
  parentOrganization: { "@type": "Organization", name: site.company.name, url: site.company.url },
  brand: { "@type": "Brand", name: site.name },
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${site.url}/#website`,
  name: site.name,
  alternateName: "Media Pure",
  url: site.url,
  description: site.description,
  publisher: { "@id": `${site.url}/#organization` },
};

const FREE_OFFER = { "@type": "Offer", price: "0", priceCurrency: "USD", availability: "https://schema.org/InStock" };

/** The platform as a whole: what a search engine should treat as "MediaPure". */
export const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": `${site.url}/#software`,
  name: site.name,
  alternateName: "MediaPure Metadata Remover",
  url: site.url,
  applicationCategory: "MultimediaApplication",
  applicationSubCategory: "Media privacy tool",
  operatingSystem: "Any (web browser)",
  browserRequirements: "Requires JavaScript",
  description: site.description,
  offers: FREE_OFFER,
  featureList: [
    "Remove EXIF, GPS, XMP and IPTC metadata from images",
    "Remove video metadata: container tags, handler names and header timestamps",
    "Remove embedded GPS and telemetry tracks from MP4 and MOV recordings",
    "Remove AI prompts, seeds and generation parameters",
    "Remove C2PA Content Credentials manifests",
    "Lossless: pixel-identical images and frame-identical video",
    "No account, no watermark, files deleted automatically",
  ],
  publisher: { "@id": `${site.url}/#organization` },
};

/** Each tool also stands alone, so a query for one can rank the right page. */
export const imageToolSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": `${site.url}/image-metadata-cleaner#software`,
  name: "MediaPure Image Metadata Remover",
  url: absolute("/image-metadata-cleaner"),
  applicationCategory: "MultimediaApplication",
  applicationSubCategory: "Image privacy tool",
  operatingSystem: "Any (web browser)",
  description:
    "Free online EXIF and metadata remover for JPG, PNG and WebP. Strips GPS, camera details, AI prompts and Content Credentials while keeping every pixel identical.",
  offers: FREE_OFFER,
  featureList: [
    "Remove EXIF, GPS, XMP and IPTC metadata",
    "Remove AI prompts and generation parameters",
    "Remove C2PA Content Credentials manifests",
    "Lossless: verified pixel-identical output",
    "Batch processing and ZIP download",
  ],
  isPartOf: { "@id": `${site.url}/#software` },
  publisher: { "@id": `${site.url}/#organization` },
};

export const videoToolSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": `${site.url}/video-metadata-cleaner#software`,
  name: "MediaPure Video Metadata Remover",
  url: absolute("/video-metadata-cleaner"),
  applicationCategory: "MultimediaApplication",
  applicationSubCategory: "Video privacy tool",
  operatingSystem: "Any (web browser)",
  description:
    "Free online video metadata remover for MP4, MOV, WebM, MKV and AVI. Removes GPS, device names, creation dates, editing history and Content Credentials without re-encoding, so quality is untouched.",
  offers: FREE_OFFER,
  featureList: [
    "Remove GPS coordinates and embedded location tracks",
    "Remove camera, phone and editing software names",
    "Remove creation and modification timestamps",
    "Remove C2PA Content Credentials and AI provenance",
    "No re-encoding: same resolution, frame rate, bitrate and quality",
    "Supports MP4, MOV, WebM, MKV and AVI",
  ],
  isPartOf: { "@id": `${site.url}/#software` },
  publisher: { "@id": `${site.url}/#organization` },
};

export function faqSchema(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
  };
}

export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.name, item: absolute(t.path) })),
  };
}

/** Step-by-step markup for the "how to" intent behind both cleaners. */
export function howToSchema(opts: { name: string; description: string; path: string; steps: { name: string; text: string }[] }) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: opts.name,
    description: opts.description,
    totalTime: "PT1M",
    estimatedCost: { "@type": "MonetaryAmount", currency: "USD", value: "0" },
    tool: [{ "@type": "HowToTool", name: site.name }],
    step: opts.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
      url: `${absolute(opts.path)}#step-${i + 1}`,
    })),
  };
}

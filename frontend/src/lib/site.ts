export const site = {
  name: "MediaPure",
  shortName: "MediaPure",
  tagline: "The complete media metadata cleaning platform.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://mediapure.com").replace(/\/$/, ""),
  description:
    "Remove EXIF, GPS, XMP, IPTC, AI prompts and C2PA Content Credentials from images and videos online. Lossless: your pixels and your frames stay identical.",
  maxFileMb: Number(process.env.NEXT_PUBLIC_MAX_FILE_MB ?? 25),
  maxVideoMb: Number(process.env.NEXT_PUBLIC_MAX_VIDEO_MB ?? 500),
  fileTtlMinutes: 10,
  company: {
    name: "The Vector",
    url: "https://thevector.systems/",
    email: "thevectorrr@gmail.com",
  },
  /** The two products, used for the tool switcher, the homepage and the footer. */
  tools: [
    {
      href: "/image-metadata-cleaner",
      label: "Image cleaner",
      short: "Images",
      blurb: "JPG, PNG and WebP. Strip EXIF, GPS, AI prompts and Content Credentials without touching a pixel.",
    },
    {
      href: "/video-metadata-cleaner",
      label: "Video cleaner",
      short: "Video",
      blurb: "MP4, MOV, WebM, MKV and AVI. Remove GPS tracks, device names and provenance without re-encoding a frame.",
    },
  ],
  nav: [
    { href: "/features", label: "Features" },
    { href: "/how-it-works", label: "How it works" },
    { href: "/privacy-security", label: "Security" },
    { href: "/faq", label: "FAQ" },
    { href: "/contact", label: "Contact" },
  ],
  footer: [
    {
      title: "Product",
      links: [
        { href: "/image-metadata-cleaner", label: "Image metadata cleaner" },
        { href: "/video-metadata-cleaner", label: "Video metadata cleaner" },
        { href: "/features", label: "Features" },
        { href: "/how-it-works", label: "How it works" },
        { href: "/privacy-security", label: "Privacy & security" },
      ],
    },
    {
      title: "Learn",
      links: [
        { href: "/blog", label: "Blog" },
        { href: "/faq", label: "FAQ" },
        { href: "/blog/remove-metadata-from-video", label: "Remove video metadata" },
        { href: "/blog/c2pa-content-credentials-explained", label: "Content Credentials explained" },
        { href: "/blog/remove-exif-data-from-photos", label: "Remove EXIF data" },
      ],
    },
    {
      title: "Company",
      links: [
        { href: "/about", label: "About us" },
        { href: "/contact", label: "Contact" },
        { href: "/privacy-policy", label: "Privacy policy" },
        { href: "/terms", label: "Terms & conditions" },
      ],
    },
  ],
};

export const absolute = (path = "/") => `${site.url}${path === "/" ? "" : path}`;

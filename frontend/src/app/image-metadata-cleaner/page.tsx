import { Cleaner } from "@/components/Cleaner";
import { JsonLd } from "@/components/JsonLd";
import { FaqList } from "@/components/FaqList";
import { breadcrumbSchema, faqSchema, imageToolSchema, pageMeta } from "@/lib/seo";
import { faqs } from "@/lib/faqs";
import Link from "next/link";

export const metadata = pageMeta({
  title: "Remove EXIF Data from Photos Free | MediaPure",
  description:
    "Remove EXIF data, GPS, AI prompts and C2PA from JPG, PNG or WebP photos. Lossless photo metadata removal with pixel checks.",
  path: "/image-metadata-cleaner",
  keywords: [
    "image metadata remover", "remove image metadata online", "EXIF remover",
    "AI image metadata remover", "remove EXIF data", "C2PA remover", "MediaPure",
  ],
});

const toolFaqs = faqs.filter((f) => f.group === "Quality" || f.q.startsWith("Which formats"));

export default function ToolPage() {
  return (
    <>
      <JsonLd data={[imageToolSchema, faqSchema(toolFaqs), breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Image metadata cleaner", path: "/image-metadata-cleaner" }])]} />
      <section className="pixel-field border-b border-line">
        <div className="wrap max-w-4xl py-12 md:py-16">
          <p className="eyebrow">Image cleaner</p>
          <h1 className="t-display mt-3">Remove EXIF data from photos</h1>
          <p className="t-lead mt-4 max-w-2xl text-muted">
            Remove EXIF, location, AI prompts and Content Credentials from your images. You&apos;ll see every field we find before you download the clean copy.
          </p>
          <div className="mt-10"><Cleaner variant="full" /></div>
        </div>
      </section>
      <section className="wrap section grid max-w-5xl gap-12 md:grid-cols-2 md:gap-14">
        <div>
          <h2 className="t-sub">What happens to your file</h2>
          <ol className="mt-5 space-y-4 leading-7 text-ink-2">
            <li><b className="text-ink">Checked.</b> We confirm it&apos;s a real JPG, PNG or WebP by reading its content, and fully decode it once to reject damaged or malicious files.</li>
            <li><b className="text-ink">Scanned.</b> Every metadata block is read and listed: EXIF, GPS, XMP, IPTC, PNG text, C2PA manifests and anything appended after the image.</li>
            <li><b className="text-ink">Cleaned.</b> Those blocks are dropped while the compressed image data is copied unchanged. The colour profile stays so colours render the same.</li>
            <li><b className="text-ink">Verified.</b> Both versions are decoded and compared pixel by pixel. Your original is discarded from memory.</li>
            <li><b className="text-ink">Delivered.</b> You get a private download link that expires after 10 minutes.</li>
          </ol>
          <p className="mt-6 text-sm text-muted">Want the technical detail? Read <Link className="link" href="/how-it-works">how it works</Link>.</p>
          <p className="mt-2 text-sm text-muted">Cleaning a video instead? Use the <Link className="link" href="/video-metadata-cleaner">video metadata cleaner</Link>.</p>
        </div>
        <div>
          <h2 className="t-sub">About quality</h2>
          <div className="mt-5"><FaqList items={toolFaqs} /></div>
        </div>
      </section>
      <section className="wrap pb-12 text-sm text-muted">
        <p>Need device-specific steps? See how to <Link className="link" href="/guides/remove-exif-iphone">remove EXIF on iPhone</Link>, <Link className="link" href="/guides/remove-exif-android">remove photo metadata on Android</Link>, <Link className="link" href="/guides/remove-exif-windows">remove metadata on Windows</Link>, or <Link className="link" href="/guides/remove-exif-mac">remove metadata on Mac</Link>. You can also <Link className="link" href="/guides/remove-gps-from-photo">remove GPS from a photo</Link> and <Link className="link" href="/guides/remove-c2pa-content-credentials">remove C2PA Content Credentials</Link>.</p>
      </section>
    </>
  );
}

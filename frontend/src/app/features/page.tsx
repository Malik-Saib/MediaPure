import {
  Archive, BadgeCheck, Clipboard, Clock, Files, Gauge, Layers, ListChecks, MapPin, Palette,
  RotateCw, ScanSearch, ShieldCheck, Smartphone, Video, Volume2,
} from "lucide-react";
import { PageIntro } from "@/components/PageIntro";
import { CtaBand } from "@/components/CtaBand";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Features: Lossless Image & Video Metadata Remover | MediaPure",
  description:
    "Batch image cleaning, one-at-a-time video cleaning, a field-by-field report, privacy scores, pixel and frame verification, ZIP downloads and support for JPG, PNG, WebP, MP4, MOV, WebM, MKV and AVI.",
  path: "/features",
  keywords: ["MediaPure features", "video metadata remover features", "EXIF remover", "C2PA remover"],
});

const GROUPS = [
  {
    title: "Cleaning",
    items: [
      { icon: ShieldCheck, t: "Complete metadata removal", d: "EXIF, GPS, XMP, IPTC, Photoshop resources, PNG text, C2PA manifests, comments, thumbnails and vendor blocks, in one pass." },
      { icon: BadgeCheck, t: "Pixel-identical output", d: "No re-encoding. Every result is decoded and compared with your original before it's released." },
      { icon: Palette, t: "Colour stays true", d: "The ICC profile is kept, so wide-gamut and print images look exactly as they did." },
      { icon: RotateCw, t: "Orientation kept", d: "Portrait phone photos stay upright. Only the single orientation value survives, when it's needed." },
      { icon: Layers, t: "Animated images", d: "Animated PNG and animated WebP are cleaned frame-safe, with every frame verified." },
    ],
  },
  {
    title: "Video",
    items: [
      { icon: Video, t: "No re-encoding, ever", d: "Compressed video and audio are copied into a fresh container without being decoded, so resolution, frame rate, bitrate and quality are exactly what you uploaded." },
      { icon: MapPin, t: "Telemetry tracks removed", d: "GoPro GPMF, Apple mebx, Google CAMM and Sony RTMD tracks log your position second by second. They are dropped entirely, not copied across." },
      { icon: Clock, t: "Header timestamps zeroed", d: "Creation and modification times hide in the mvhd, tkhd and mdhd headers, where they survive almost every other tool. We blank them." },
      { icon: BadgeCheck, t: "Frame-level verification", d: "Each stream of the cleaned file is checksummed and compared with your original. A mismatch returns an error, never a file." },
      { icon: RotateCw, t: "Rotation preserved", d: "Portrait clips keep their rotation flag, so a phone video never ends up playing sideways." },
      { icon: Volume2, t: "Audio untouched", d: "The same codec, channels and sample rate, copied packet for packet. Subtitles are kept where the container supports them." },
    ],
  },
  {
    title: "Understanding",
    items: [
      { icon: ScanSearch, t: "Metadata scanner", d: "See every field in your image or video, grouped by what it reveals: location, device, creator, AI data and more." },
      { icon: Gauge, t: "Privacy score", d: "A simple before-and-after score weighted by risk. Location data counts far more than a resolution tag." },
      { icon: ListChecks, t: "Before and after report", d: "Field counts, file sizes, codecs and a verification result for every file, so you know exactly what changed." },
    ],
  },
  {
    title: "Workflow",
    items: [
      { icon: Files, t: "Batch processing", d: "Add up to 20 images at once; three are processed in parallel while the rest queue. Videos run one at a time so each gets the whole machine." },
      { icon: Archive, t: "ZIP download", d: "Download the whole cleaned set in one archive, named after your originals." },
      { icon: Clipboard, t: "Paste to clean", d: "Copy an image and press Ctrl+V or ⌘V anywhere on the page. Handy for screenshots." },
      { icon: Smartphone, t: "Works on your phone", d: "Both cleaners run in any modern mobile browser. No app to install." },
    ],
  },
];

export default function Features() {
  return (
    <>
      <PageIntro crumb="Features" path="/features" title="Everything you need to share media safely"
        intro="One job, done thoroughly: find what's hidden in your images and videos, remove it without harming the picture or the sound, and prove that it worked." />
      <div className="wrap section">
        {GROUPS.map((g) => (
          <section key={g.title} className="grid gap-8 border-b border-line py-12 first:pt-0 last:border-0 last:pb-0 lg:grid-cols-[14rem_1fr] lg:gap-10">
            <h2 className="t-sub">{g.title}</h2>
            <div className="grid gap-x-10 gap-y-9 sm:grid-cols-2">
              {g.items.map(({ icon: Icon, t, d }) => (
                <div key={t} className="flex gap-4">
                  <Icon size={22} className="mt-0.5 shrink-0 text-signal" aria-hidden />
                  <div>
                    <h3 className="font-bold">{t}</h3>
                    <p className="mt-1.5 leading-7 text-muted">{d}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
        <section className="mt-14 rounded-[var(--radius-card)] border border-line bg-paper p-7 md:p-9">
          <h2 className="t-card">Supported formats and limits</h2>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[32rem] text-left">
              <thead className="text-xs uppercase tracking-wide text-muted"><tr><th className="py-2 pr-6 font-bold">Format</th><th className="py-2 pr-6 font-bold">Variants</th><th className="py-2 font-bold">Max size</th></tr></thead>
              <tbody className="divide-y divide-line">
                <tr><td className="py-3 pr-6 font-bold">JPG / JPEG</td><td className="py-3 pr-6 text-ink-2">Baseline, progressive, CMYK</td><td className="py-3">25 MB</td></tr>
                <tr><td className="py-3 pr-6 font-bold">PNG</td><td className="py-3 pr-6 text-ink-2">All bit depths, transparency, APNG</td><td className="py-3">25 MB</td></tr>
                <tr><td className="py-3 pr-6 font-bold">WebP</td><td className="py-3 pr-6 text-ink-2">Lossy, lossless, alpha, animated</td><td className="py-3">25 MB</td></tr>
                <tr><td className="py-3 pr-6 font-bold">MP4 / M4V</td><td className="py-3 pr-6 text-ink-2">H.264, H.265/HEVC, AV1, any stream-copyable codec</td><td className="py-3">500 MB</td></tr>
                <tr><td className="py-3 pr-6 font-bold">MOV</td><td className="py-3 pr-6 text-ink-2">QuickTime, including iPhone and DSLR recordings</td><td className="py-3">500 MB</td></tr>
                <tr><td className="py-3 pr-6 font-bold">WebM</td><td className="py-3 pr-6 text-ink-2">VP8, VP9, AV1 with Vorbis or Opus audio</td><td className="py-3">500 MB</td></tr>
                <tr><td className="py-3 pr-6 font-bold">MKV</td><td className="py-3 pr-6 text-ink-2">Matroska, with subtitle tracks preserved</td><td className="py-3">500 MB</td></tr>
                <tr><td className="py-3 pr-6 font-bold">AVI</td><td className="py-3 pr-6 text-ink-2">Legacy RIFF recordings and screen captures</td><td className="py-3">500 MB</td></tr>
              </tbody>
            </table>
          </div>
          <p className="mt-5 text-sm leading-6 text-muted">
            Images up to 100 megapixels, 20 per batch, 30 per minute and 500 per day. Videos up to 4 hours long,
            one at a time, 6 per minute and 60 per day. Every file is identified by its bytes, not its extension.
          </p>
        </section>
      </div>
      <CtaBand
        title="Try it on your next file"
        text="Free, no signup, and nothing you upload is kept."
        href="/video-metadata-cleaner"
        cta="Clean a video"
        secondary={{ href: "/image-metadata-cleaner", label: "Clean an image" }}
      />
    </>
  );
}

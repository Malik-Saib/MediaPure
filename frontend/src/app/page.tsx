import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight, Braces, Briefcase, Camera, Clock, Code2, EyeOff, FileText, Film, Fingerprint, Gauge, Lock,
  MapPin, Megaphone, Palette, ScanLine, Server, ShieldCheck, Smartphone, Sparkles, Store, Trash2, Users, Video,
} from "lucide-react";
import { HeroTools } from "@/components/HeroTools";
import { FileAnatomy } from "@/components/FileAnatomy";
import { FaqList } from "@/components/FaqList";
import { CtaBand } from "@/components/CtaBand";
import { SectionHeading } from "@/components/SectionHeading";
import { JsonLd } from "@/components/JsonLd";
import { faqs } from "@/lib/faqs";
import { posts } from "@/lib/blog";
import { faqSchema, imageToolSchema, pageMeta, softwareSchema, videoToolSchema } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = pageMeta({
  title: "MediaPure: Remove Metadata From Images & Video Free",
  description:
    "MediaPure is the complete media metadata cleaning platform. Remove EXIF, GPS, AI prompts and C2PA Content Credentials from images and video online. Lossless, free, no signup.",
  path: "/",
  keywords: [
    "MediaPure", "Media Pure", "AI metadata remover", "AI image metadata remover",
    "AI video metadata remover", "video metadata remover", "remove video metadata online",
    "remove image metadata online", "EXIF remover", "AI content credentials remover",
  ],
});

const REMOVED = [
  { icon: MapPin, title: "Location", text: "GPS coordinates in photos, location atoms in video, and telemetry tracks that log a whole journey." },
  { icon: Smartphone, title: "Device details", text: "Camera and phone model, lens, serial numbers, vendor codes and media handler names." },
  { icon: Sparkles, title: "AI generation data", text: "Prompts, negative prompts, seeds, samplers, model names and ComfyUI workflows." },
  { icon: Fingerprint, title: "Content Credentials", text: "Signed C2PA manifests naming the service, agent and exact time of creation." },
  { icon: Users, title: "Names & ownership", text: "Artist, author, creator, copyright and licence-holder fields from XMP, IPTC and container tags." },
  { icon: Clock, title: "Timestamps", text: "Capture, edit and export dates, including the video header times most tools never touch." },
  { icon: FileText, title: "Captions & history", text: "Descriptions, keywords, comments, chapter names and editor history logs." },
  { icon: EyeOff, title: "Hidden extras", text: "Embedded thumbnails, depth maps, vendor blocks and data smuggled after the file ends." },
];

const USE_CASES = [
  { icon: Palette, who: "Designers", text: "Send client files without your tool stack, licence name or prompt recipes attached." },
  { icon: Code2, who: "Developers", text: "Ship screenshots and screen recordings free of machine names and file paths." },
  { icon: Megaphone, who: "Marketers", text: "Publish campaign visuals and AI concepts without internal notes or timestamps." },
  { icon: Camera, who: "Photographers & filmmakers", text: "Share previews and rushes without GPS, serial numbers or the shoot location." },
  { icon: Briefcase, who: "Businesses", text: "Clean press kits, product videos and listings before they leave the company." },
  { icon: Store, who: "Social media users", text: "Post from anywhere without your coordinates riding along in the file." },
];

const TOOL_CARDS = [
  {
    href: "/image-metadata-cleaner",
    eyebrow: "Images",
    title: "Image metadata cleaner",
    text: "JPG, PNG and WebP. Strip EXIF, GPS, XMP, IPTC, AI prompts and Content Credentials, then download a file whose pixels are verified identical to your original.",
    points: ["Up to 20 files at once", "Pixel-identical output", "ZIP download"],
    mark: "/brand/icon-256.webp",
  },
  {
    href: "/video-metadata-cleaner",
    eyebrow: "Video",
    title: "Video metadata cleaner",
    text: "MP4, MOV, WebM, MKV and AVI. Remove location atoms, GPS telemetry tracks, device names, header timestamps and provenance manifests without re-encoding a single frame.",
    points: ["Up to 500 MB per video", "Frame-identical output", "No quality loss"],
    mark: "/brand/mediapure-icon-256.webp",
  },
];

const STEPS = [
  ["Add your file", "Drop up to 20 images, or one video. Nothing to install and no account."],
  ["We scan and clean", "Every metadata block is identified and removed. Then we compare both versions, pixel by pixel or stream by stream."],
  ["Download clean files", "Save each file or grab a ZIP. Links expire and files are deleted after 10 minutes."],
];

const VIDEO_POINTS = [
  [Gauge, "No re-encoding", "Streams are copied, never decoded. Same resolution, frame rate, bitrate and audio."],
  [MapPin, "Telemetry removed", "GoPro GPMF, Apple mebx, Google CAMM and Sony RTMD tracks are dropped, not copied."],
  [Film, "Every container", "MP4, MOV, M4V, WebM, MKV and AVI, identified by their bytes rather than their extension."],
  [ShieldCheck, "Verified output", "Each stream is checksummed before and after. A mismatch returns an error, never a file."],
] as const;

const PRIVACY_POINTS = [
  [Lock, "Originals are not kept", "Images are processed in memory and never written to disk. A video is streamed to a private file and deleted the moment cleaning ends, either way."],
  [Trash2, "Deleted automatically", "Cleaned files expire after 10 minutes. Delete them yourself the moment you've downloaded."],
  [ScanLine, "Validated before processing", "Files are checked by content, not name. Fake media and oversized 'bombs' are rejected."],
  [Braces, "No metadata logging", "What we find in your file goes to your browser only. We keep anonymous counts, nothing else."],
] as const;

const COMPARISON = [
  ["Method", "Decode and re-save", "Container rewrite"],
  ["Image quality", "Recompressed", "Untouched"],
  ["Video quality", "Re-encoded", "Untouched"],
  ["Pixels & frames", "Slightly different", "Verified identical"],
  ["Colour profile", "Often dropped", "Kept"],
  ["AI & C2PA data", "Sometimes missed", "Removed"],
  ["GPS telemetry track", "Rarely checked", "Removed"],
];

export default function Home() {
  return (
    <>
      <JsonLd data={[softwareSchema, imageToolSchema, videoToolSchema, faqSchema(faqs.slice(0, 6))]} />

      <section className="pixel-field relative border-b border-line">
        <div className="wrap grid items-start gap-10 py-12 md:py-16 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14 lg:py-20">
          <div className="lg:sticky lg:top-28">
            {/* Sentence case: this is a sentence, not a label. */}
            <p className="font-semibold text-signal sm:text-lg">{site.tagline}</p>
            <h1 className="t-display mt-4 text-ink">
              Remove hidden metadata from images and video. Keep every pixel and every frame.
            </h1>
            <p className="t-lead mt-6 max-w-xl text-muted">
              MediaPure strips EXIF, GPS, prompts and Content Credentials from JPG, PNG and WebP images and
              from MP4, MOV, WebM, MKV and AVI video. Nothing is re-encoded, so what you download looks and
              sounds exactly like what you uploaded.
            </p>
            <ul className="mt-8 grid max-w-lg gap-3 text-sm font-semibold text-ink-2 sm:grid-cols-3">
              <li className="flex items-center gap-2"><ShieldCheck size={18} className="shrink-0 text-clean" aria-hidden /> No signup</li>
              <li className="flex items-center gap-2"><Server size={18} className="shrink-0 text-clean" aria-hidden /> Originals never kept</li>
              <li className="flex items-center gap-2"><Trash2 size={18} className="shrink-0 text-clean" aria-hidden /> Deleted in 10 min</li>
            </ul>
          </div>
          <div className="rounded-[var(--radius-panel)] bg-white/70 p-2 shadow-hero ring-1 ring-line backdrop-blur">
            <HeroTools />
          </div>
        </div>
      </section>

      <section className="wrap section-lg">
        <SectionHeading
          title="Two cleaners, one guarantee"
          description="Whether it is a photo or a four-minute clip, the rule is the same: remove everything that identifies you, and change nothing you can see or hear."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {TOOL_CARDS.map((t) => (
            <Link key={t.href} href={t.href} className="card card-hover card-pad group flex flex-col">
              <div className="flex items-center gap-3">
                <Image src={t.mark} alt="" aria-hidden width={40} height={40} className="size-10" sizes="40px" />
                <span className="eyebrow">{t.eyebrow}</span>
              </div>
              <h3 className="t-card mt-4 transition-colors group-hover:text-signal">{t.title}</h3>
              <p className="mt-2 flex-1 leading-7 text-muted">{t.text}</p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {t.points.map((p) => (
                  <li key={p} className="rounded-[var(--radius-chip)] bg-paper px-2.5 py-1 text-xs font-semibold text-ink-2">{p}</li>
                ))}
              </ul>
              <span className="link-more mt-6 group-hover:gap-2">Open the cleaner <ArrowRight size={16} aria-hidden /></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-paper">
        <div className="wrap section-lg grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <SectionHeading eyebrow="New" title="Clean videos with the same privacy protection." />
            <p className="t-lead mt-5 text-muted">
              A video says more about you than a photo does. Alongside the usual tags, a clip from a phone or an
              action camera can carry a timed GPS track that logs where you were, second by second, for the whole
              recording. Most metadata tools never even look at it.
            </p>
            <p className="t-lead mt-4 text-muted">
              MediaPure removes the tags, the location atoms, the telemetry track, the device handler names and
              the header timestamps — then copies your compressed video and audio across untouched and checksums
              both files to prove it.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/video-metadata-cleaner" className="btn btn-primary"><Video size={17} aria-hidden /> Clean a video</Link>
              <Link href="/how-it-works" className="btn btn-ghost">See how it works</Link>
            </div>
          </div>
          <dl className="tile-grid sm:grid-cols-2">
            {VIDEO_POINTS.map(([Icon, t, d]) => (
              <div key={t} className="p-6">
                <dt className="flex items-center gap-2.5 font-bold text-ink">
                  <Icon size={19} className="shrink-0 text-signal" aria-hidden /> {t}
                </dt>
                <dd className="mt-2 text-sm leading-6 text-muted">{d}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="wrap section-lg">
        <SectionHeading
          title="Your file carries a second layer you never see"
          description="Phones, cameras, editors and AI tools quietly write information into every file. Anyone who downloads it can read that information in seconds."
        />
        <div className="mt-10"><FileAnatomy /></div>
      </section>

      <section className="border-y border-line bg-paper">
        <div className="wrap section-lg">
          <SectionHeading title="Three steps, about ten seconds" action={{ href: "/how-it-works", label: "See how cleaning works" }} />
          <ol className="mt-12 grid gap-10 md:grid-cols-3">
            {STEPS.map(([t, d], i) => (
              <li key={t} className="border-t-2 border-ink pt-6">
                <span className="text-sm font-bold text-signal">Step {i + 1}</span>
                <h3 className="t-card mt-2">{t}</h3>
                <p className="mt-2 leading-7 text-muted">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="wrap section-lg grid gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <SectionHeading title="Most cleaners re-save your file. We don't." />
          <p className="t-lead mt-5 text-muted">
            The easy way to strip metadata is to open the file and save a new copy. For a JPEG that means another
            round of compression: softer edges, shifted colours, lost detail. For a video it means decoding and
            re-encoding every frame: slower, and visibly worse.
          </p>
          <p className="t-lead mt-4 text-muted">
            We take the file apart at the container level, drop the metadata blocks and copy the compressed data
            through untouched. Then we check the result — every pixel for an image, every packet for a video. If
            anything differs, you get an error, never a damaged file.
          </p>
        </div>
        <div className="card overflow-hidden">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Comparison of re-encoding versus lossless cleaning</caption>
            <thead className="bg-paper">
              <tr>
                <th className="p-4 text-xs font-bold uppercase tracking-wide text-muted" scope="col"><span className="sr-only">Property</span></th>
                <th className="p-4 text-xs font-bold uppercase tracking-wide text-muted" scope="col">Typical tool</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wide text-signal" scope="col">{site.name}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {COMPARISON.map(([a, b, c]) => (
                <tr key={a}>
                  <th scope="row" className="p-4 font-semibold text-ink">{a}</th>
                  <td className="p-4 text-muted">{b}</td>
                  <td className="p-4 font-semibold text-ink">{c}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="border-t border-line bg-paper">
        <div className="wrap section-lg">
          <SectionHeading title="What gets removed" action={{ href: "/features", label: "All features" }} />
          <div className="mt-12 grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-4">
            {REMOVED.map(({ icon: Icon, title, text }) => (
              <div key={title}>
                <Icon size={22} className="text-signal" aria-hidden />
                <h3 className="mt-3 font-bold">{title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-muted">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="wrap section-lg">
        <SectionHeading title="Built for anyone who publishes media" />
        <div className="tile-grid mt-12 sm:grid-cols-2 lg:grid-cols-3">
          {USE_CASES.map(({ icon: Icon, who, text }) => (
            <div key={who} className="p-7">
              <div className="flex items-center gap-3">
                <Icon size={20} className="shrink-0 text-signal" aria-hidden />
                <h3 className="text-lg font-bold">{who}</h3>
              </div>
              <p className="mt-3 leading-7 text-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="band-ink bg-ink text-white">
        <div className="wrap section-lg grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <h2 className="t-section">A privacy tool that practises privacy</h2>
            <p className="t-lead mt-5 text-white/70">
              It would make no sense to protect your media by collecting it. So we built the service to keep as
              little as possible, for as short a time as possible.
            </p>
            <Link href="/privacy-security" className="btn btn-invert mt-8">Read our security model</Link>
          </div>
          <dl className="grid gap-8 sm:grid-cols-2">
            {PRIVACY_POINTS.map(([Icon, t, d]) => (
              <div key={t}>
                <dt className="flex items-center gap-2.5 font-bold"><Icon size={19} className="shrink-0 text-cyan" aria-hidden /> {t}</dt>
                <dd className="mt-2 leading-7 text-white/70">{d}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="wrap section-lg">
        <SectionHeading
          title="Questions people ask first"
          description="Straight answers, including what this tool can't do."
          action={{ href: "/faq", label: "Read all FAQs" }}
        />
        <div className="mt-10"><FaqList items={faqs.slice(0, 6)} /></div>
      </section>

      <section className="border-t border-line bg-paper">
        <div className="wrap section">
          <SectionHeading title="From the blog" action={{ href: "/blog", label: "All articles" }} />
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {posts.slice(0, 3).map((p) => (
              <article key={p.slug}>
                <p className="text-sm font-bold text-signal">{p.tag}</p>
                <h3 className="t-card mt-2">
                  <Link href={`/blog/${p.slug}`} className="transition-colors hover:text-signal">{p.title}</Link>
                </h3>
                <p className="mt-2 leading-7 text-muted">{p.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        title="Clean your next file before you share it"
        text="Free, no signup, and your pixels and frames stay exactly as they are."
        href="/video-metadata-cleaner"
        cta="Clean a video"
        secondary={{ href: "/image-metadata-cleaner", label: "Clean an image" }}
      />
    </>
  );
}

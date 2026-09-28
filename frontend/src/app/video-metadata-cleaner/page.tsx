import Link from "next/link";
import {
  Clapperboard, Film, Gauge, MapPin, ScanLine, ShieldCheck, Smartphone, Sparkles, Timer, Trash2,
} from "lucide-react";
import { VideoCleaner } from "@/components/VideoCleaner";
import { JsonLd } from "@/components/JsonLd";
import { FaqList } from "@/components/FaqList";
import { CtaBand } from "@/components/CtaBand";
import { SectionHeading } from "@/components/SectionHeading";
import { breadcrumbSchema, faqSchema, howToSchema, pageMeta, videoToolSchema } from "@/lib/seo";
import { videoFaqs } from "@/lib/faqs";
import { site } from "@/lib/site";

export const metadata = pageMeta({
  title: "Video Metadata Remover: Remove GPS & EXIF From Video Free",
  description:
    "Remove hidden metadata from MP4, MOV, WebM, MKV and AVI online. Strip GPS, device names, creation dates and Content Credentials with no re-encoding — same resolution, bitrate and quality.",
  path: "/video-metadata-cleaner",
  keywords: [
    "video metadata remover", "remove video metadata online", "AI video metadata remover",
    "remove GPS from video", "MP4 metadata remover", "MOV metadata remover",
    "remove EXIF from video", "strip video metadata", "MediaPure",
  ],
});

const STEPS = [
  { name: "Upload one video", text: "Drop an MP4, MOV, WebM, MKV or AVI file, or choose it from your device. Nothing to install and no account." },
  { name: "We analyse the container", text: "Every tag, atom, handler name, header timestamp and provenance manifest is read and listed for you." },
  { name: "We remove the metadata", text: "The container is rewritten and the compressed video and audio are copied across without being decoded." },
  { name: "We verify every frame", text: "Both files are checksummed stream by stream. If a single packet differed you would get an error, not a file." },
  { name: "Download your clean video", text: "A private link that expires after ten minutes, or delete it yourself the second you've saved it." },
];

const REMOVED = [
  { icon: MapPin, title: "Location", text: "GPS coordinates in QuickTime ©xyz atoms and ISO 6709 tags, plus whole telemetry tracks that log your route second by second." },
  { icon: Smartphone, title: "Camera & phone", text: "Make, model, lens, firmware, vendor codes and the handler names that identify the exact device that recorded the clip." },
  { icon: Clapperboard, title: "Editing history", text: "The editor and version that exported the file, project names, render settings and the encoder signature." },
  { icon: Timer, title: "Timestamps", text: "Creation and modification times in the container tags and in the mvhd, tkhd and mdhd headers where most tools never look." },
  { icon: Sparkles, title: "AI provenance", text: "C2PA Content Credentials, digital source type tags and the generator names left by AI video tools." },
  { icon: Film, title: "Titles & comments", text: "Titles, descriptions, comments, chapter names, artist and copyright fields and album groupings." },
];

const KEPT = [
  ["Resolution", "Every pixel dimension is untouched. A 4K clip stays 4K."],
  ["Frame rate", "Constant or variable, the timing of every frame is preserved."],
  ["Bitrate & quality", "Nothing is re-compressed, so there is no generation loss at all."],
  ["Audio", "The same codec, channels and sample rate, copied without decoding."],
  ["Orientation", "The rotation flag is carried over so portrait clips don't play sideways."],
  ["Subtitles", "Subtitle tracks stay where the container can hold them."],
];

export default function VideoToolPage() {
  return (
    <>
      <JsonLd data={[
        videoToolSchema,
        faqSchema(videoFaqs),
        howToSchema({
          name: "How to remove metadata from a video",
          description: "Remove GPS, device details, timestamps and Content Credentials from a video file without losing quality.",
          path: "/video-metadata-cleaner",
          steps: STEPS.map((s) => ({ name: s.name, text: s.text })),
        }),
        breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Video metadata cleaner", path: "/video-metadata-cleaner" }]),
      ]} />

      <section className="pixel-field border-b border-line">
        <div className="wrap max-w-4xl py-12 md:py-16">
          <p className="eyebrow">Video cleaner</p>
          <h1 className="t-display mt-3">
            Remove hidden metadata from video. Keep every frame.
          </h1>
          <p className="t-lead mt-4 max-w-2xl text-muted">
            A free video metadata remover for MP4, MOV, WebM, MKV and AVI. Strip GPS, device names,
            timestamps and Content Credentials in seconds — without re-encoding, so the picture and sound
            you download are the ones you uploaded.
          </p>
          <ul className="mt-8 grid max-w-2xl gap-3 text-sm font-semibold text-ink-2 sm:grid-cols-3">
            <li className="flex items-center gap-2"><Gauge size={18} className="shrink-0 text-clean" aria-hidden /> No re-encoding</li>
            <li className="flex items-center gap-2"><ShieldCheck size={18} className="shrink-0 text-clean" aria-hidden /> Verified frame by frame</li>
            <li className="flex items-center gap-2"><Trash2 size={18} className="shrink-0 text-clean" aria-hidden /> Deleted in 10 min</li>
          </ul>
          <div className="mt-10"><VideoCleaner variant="full" /></div>
        </div>
      </section>

      <section className="wrap section-lg">
        <SectionHeading
          title="What a video file says about you"
          description="A video carries far more identity than a photo, because it is a container full of boxes and every tool along the chain writes into one. Here is what we find, and remove."
        />
        <div className="mt-12 grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
          {REMOVED.map(({ icon: Icon, title, text }) => (
            <div key={title}>
              <Icon size={22} className="text-signal" aria-hidden />
              <h3 className="mt-3 font-bold">{title}</h3>
              <p className="mt-1.5 text-sm leading-6 text-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-paper">
        <div className="wrap section-lg">
          <SectionHeading title="How the video cleaner works" action={{ href: "/how-it-works", label: "The full pipeline" }} />
          <ol className="mt-12 grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {STEPS.map((s, i) => (
              <li key={s.name} id={`step-${i + 1}`} className="border-t-2 border-ink pt-5">
                <span className="text-sm font-bold text-signal">Step {i + 1}</span>
                <h3 className="mt-2 text-lg font-bold leading-snug">{s.name}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="wrap section-lg grid gap-12 lg:grid-cols-2 lg:items-start">
        <div>
          <h2 className="t-section">
            Most video tools re-encode. We rewrite the container.
          </h2>
          <p className="t-lead mt-5 text-muted">
            The lazy way to strip video metadata is to decode every frame and encode them again. That is slow,
            it burns CPU, and it costs you real quality: softer motion, blocking in dark scenes, a smaller
            file that looks worse. Do it twice and it compounds.
          </p>
          <p className="t-lead mt-4 text-muted">
            We never decode. The compressed video and audio streams are copied across into a fresh container
            while the metadata boxes are dropped, the handler names blanked and the header timestamps zeroed.
            Then both files are checksummed stream by stream. If a single packet differed, you get an error
            instead of a damaged video.
          </p>
          <p className="mt-6 text-sm text-muted">
            Prefer to see the whole pipeline? Read <Link className="link" href="/how-it-works">how it works</Link>.
          </p>
        </div>
        <div className="card overflow-hidden">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Comparison of re-encoding versus container rewriting for video</caption>
            <thead className="bg-paper">
              <tr>
                <th className="p-4 text-xs font-bold uppercase tracking-wide text-muted" scope="col"><span className="sr-only">Property</span></th>
                <th className="p-4 text-xs font-bold uppercase tracking-wide text-muted" scope="col">Typical tool</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wide text-signal" scope="col">{site.name}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {[
                ["Method", "Decode and re-encode", "Container rewrite"],
                ["Quality", "Generation loss", "Untouched"],
                ["Frames", "Re-compressed", "Verified identical"],
                ["Speed", "Minutes", "Seconds"],
                ["GPS telemetry track", "Usually copied across", "Removed"],
                ["Handler & vendor names", "Left behind", "Blanked"],
                ["Header timestamps", "Rarely touched", "Zeroed"],
                ["C2PA Content Credentials", "Sometimes missed", "Removed"],
              ].map(([a, b, c]) => (
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
          <SectionHeading
            title="What we deliberately keep"
            description="Removing metadata should never change how your video plays. These are preserved on purpose, and none of them says anything about you."
          />
          <dl className="mt-10 grid gap-x-10 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
            {KEPT.map(([term, detail]) => (
              <div key={term}>
                <dt className="flex items-center gap-2 font-bold text-ink">
                  <ScanLine size={17} className="shrink-0 text-clean" aria-hidden /> {term}
                </dt>
                <dd className="mt-1.5 text-sm leading-6 text-muted">{detail}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="wrap section-lg">
        <SectionHeading
          title="Video questions, answered"
          description="Including the limits of what metadata removal can do."
          action={{ href: "/faq", label: "Read all FAQs" }}
        />
        <div className="mt-10"><FaqList items={videoFaqs} /></div>
      </section>

      <CtaBand
        title="Cleaning images too?"
        text="The image cleaner strips EXIF, GPS, AI prompts and Content Credentials from JPG, PNG and WebP, with the same lossless guarantee."
        href="/image-metadata-cleaner"
        cta="Clean an image"
      />
    </>
  );
}

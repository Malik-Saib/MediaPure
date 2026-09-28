import { PageIntro } from "@/components/PageIntro";
import { CtaBand } from "@/components/CtaBand";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Privacy & Security: How Your Images and Videos Are Protected",
  description:
    "Image originals are processed in memory and never stored; video originals are deleted the moment cleaning ends. Cleaned files expire after 10 minutes. See the full data lifecycle and security controls.",
  path: "/privacy-security",
  keywords: ["media privacy", "is it safe to remove video metadata online", "MediaPure security"],
});

const LIFECYCLE = [
  ["0 seconds", "You add a file. It's sent over HTTPS directly to our processing service."],
  ["~1 second", "An image is validated, scanned, cleaned and verified entirely in memory, and is never written to disk."],
  ["Seconds (video)", "A video is too large to hold in memory, so it is streamed to a private file in a directory only the service can read, opened exclusively under a random name with owner-only permissions."],
  ["Processing ends", "The image leaves memory; the staged video file is deleted immediately, whether cleaning succeeded or failed. Only the cleaned copy survives, under a random 32-character name."],
  ["Up to 10 minutes", "You download the cleaned file. You can delete it instantly with the delete button."],
  ["10 minutes", "The cleaned file is deleted automatically. A cleanup process checks every minute, and a second sweep removes anything a crash could have left behind."],
];

const CONTROLS = [
  ["Content-based validation", "Files are identified by their bytes, not their extension, and fully decoded once. Scripts, HTML, archives and disguised files are rejected."],
  ["Decompression-bomb protection", "Images over 100 megapixels are refused before they can exhaust server memory. Videos are probed first and refused if they run over four hours or claim an impossible resolution."],
  ["Hard size limits", "Images are capped at 25 MB and videos at 500 MB, enforced while the data arrives rather than after, so an oversized upload is cut off mid-stream."],
  ["Bounded video queue", "Video work runs in a small pool of workers behind a capped queue. When the queue is full the service says so and asks you to retry, instead of accepting work it cannot finish."],
  ["No shell, no user input in commands", "FFmpeg is invoked with a fixed argument list and paths the service generated itself. Your file name never reaches a command line, and the input is always a local file, so no other protocol handler can be reached."],
  ["Polyglot stripping", "Data hidden after the end of an image (a common trick for smuggling files) is always removed."],
  ["Rate limiting", "Per-connection limits on uploads, downloads, contact messages and admin sign-in attempts."],
  ["Unguessable links", "Download links use 192 bits of randomness and expire. There are no listable folders."],
  ["Strict headers", "HTTPS-only with HSTS, a Content Security Policy, no framing, and no-store caching on every file response."],
  ["No third-party trackers", "No ad networks, no analytics scripts, no social widgets. Pages load only our own code and fonts."],
];

export default function Security() {
  return (
    <>
      <PageIntro crumb="Privacy & security" path="/privacy-security" title="We designed this service to forget your files"
        intro="A privacy tool has to be private itself. Here's exactly what happens to your image or video, how long anything exists, and what protects the service." />
      <section className="wrap section-lg">
        <h2 className="t-section">The life of an uploaded file</h2>
        <ol className="mt-10 max-w-3xl divide-y divide-line border-y border-line">
          {LIFECYCLE.map(([t, d]) => (
            <li key={t} className="grid gap-2 py-5 sm:grid-cols-[10rem_1fr] sm:gap-6">
              <span className="font-mono text-sm font-bold text-signal">{t}</span>
              <span className="leading-7 text-ink-2">{d}</span>
            </li>
          ))}
        </ol>
      </section>
      <section className="border-y border-line bg-paper">
        <div className="wrap section-lg">
          <h2 className="t-section">Security controls</h2>
          <dl className="mt-10 grid gap-x-12 gap-y-8 md:grid-cols-2">
            {CONTROLS.map(([t, d]) => (
              <div key={t}>
                <dt className="font-bold">{t}</dt>
                <dd className="mt-1.5 leading-7 text-muted">{d}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
      <section className="wrap section-lg grid gap-12 md:grid-cols-2 md:gap-16">
        <div>
          <h2 className="t-sub">What we do record</h2>
          <p className="mt-4 leading-7 text-ink-2">
            To keep the service running and spot abuse, we record anonymous processing statistics: file format, file size, how many
            fields were found and removed, processing time, whether it was an image or a video, and whether it succeeded. Visitors
            are counted with a salted hash that changes every day, so we can&apos;t link your visits over time. No media, file names
            or metadata values are ever stored.
          </p>
        </div>
        <div>
          <h2 className="t-sub">What this tool can&apos;t do</h2>
          <p className="mt-4 leading-7 text-ink-2">
            We remove information attached to the file. We don&apos;t alter pixels or frames, so anything visible in the picture,
            anything audible in the soundtrack, and any invisible watermark some AI services embed in the pixels themselves, all
            stay. Always check the content itself &mdash; reflections, screens, street signs, background conversation &mdash;
            before you share it.
          </p>
        </div>
      </section>
      <CtaBand
        title="Clean a file and see for yourself"
        text="Every field is listed before you download, and nothing you upload is kept."
        href="/video-metadata-cleaner"
        cta="Clean a video"
        secondary={{ href: "/image-metadata-cleaner", label: "Clean an image" }}
      />
    </>
  );
}

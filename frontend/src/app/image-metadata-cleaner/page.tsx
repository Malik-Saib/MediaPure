import {
  Camera, Clock, FileText, Layers, MapPin, Sparkles,
} from "lucide-react";
import { Cleaner } from "@/components/Cleaner";
import { JsonLd } from "@/components/JsonLd";
import { FaqList } from "@/components/FaqList";
import { CtaBand } from "@/components/CtaBand";
import { SectionHeading } from "@/components/SectionHeading";
import { breadcrumbSchema, faqSchema, imageToolSchema, pageMeta } from "@/lib/seo";
import { faqs } from "@/lib/faqs";
import { site } from "@/lib/site";
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

const TOOL_FAQ_QUESTIONS = [
  "What does this tool remove from my image?",
  "Which formats are supported?",
  "How can I see what metadata is in my photo before I clean it?",
  "Will removing metadata reduce image quality?",
  "Why is the cleaned file slightly smaller?",
  "Will my colours or orientation change?",
  "Does it remove GPS location?",
  "Don't social networks strip metadata anyway?",
  "Do you store my images or videos?",
  "What AI information can be hidden inside an image?",
  "Does it remove C2PA / AI-generated labels?",
  "Does removing metadata make an AI image undetectable?",
  "Can I clean a screenshot the same way?",
];

const toolFaqs = TOOL_FAQ_QUESTIONS
  .map((q) => faqs.find((f) => f.q === q))
  .filter((f): f is NonNullable<typeof f> => Boolean(f));

const REMOVED = [
  { icon: MapPin, title: "Location", text: "GPS latitude and longitude stored in EXIF, often accurate to a few metres, plus altitude and the direction the camera was facing. Enough to place a photo at a home, a school or a hotel room." },
  { icon: Camera, title: "Camera & serial numbers", text: "Make, model, lens, firmware and, on many cameras, the body serial number — a quiet identifier that links every photo that camera has ever taken to the same owner." },
  { icon: Sparkles, title: "AI prompts & workflows", text: "The full prompt and negative prompt, seed, sampler and model name. ComfyUI exports can carry the entire node workflow, and signed C2PA manifests name the service that made the image." },
  { icon: FileText, title: "Names, captions & ownership", text: "Artist, creator and copyright fields, captions, keywords and descriptions from XMP and IPTC — including the name your camera or editor filled in automatically." },
  { icon: Clock, title: "Dates & editing history", text: "When the photo was taken, when it was edited and which apps touched it, with versions. A timeline you probably never meant to publish with the picture." },
  { icon: Layers, title: "Hidden extras", text: "Embedded preview thumbnails that can predate a crop, depth maps, maker-note vendor blocks, comments, and data appended after the image data ends, where some tools tuck extra payloads." },
];

const FORMATS = [
  {
    title: "JPG / JPEG",
    text: "The camera format, and the leakiest. Metadata sits in APP marker segments right after the file header: an EXIF block with GPS, device and timestamps, an XMP packet with captions and edit history, and sometimes a second embedded JPEG used as a preview thumbnail. Editors add their own segments on every save, so a much-shared JPEG can carry a layered history of every app that touched it. We drop every metadata segment and copy the compressed scan data through untouched, keeping the ICC profile so colours render identically.",
  },
  {
    title: "PNG",
    text: "The screenshot and AI-image format. PNG stores metadata in text chunks — tEXt, zTXt and iTXt — which is exactly where Stable Diffusion and ComfyUI write prompts, seeds, samplers and sometimes the complete generation workflow as plain readable text. PNGs can also carry an EXIF chunk and a timestamp chunk. Because the text is uncompressed or lightly compressed, anyone can read it with a basic viewer. We remove the text, EXIF and ancillary metadata chunks while the image data chunks pass through byte for byte.",
  },
  {
    title: "WebP",
    text: "The web format. A WebP file is a RIFF container that can hold a dedicated EXIF chunk and an XMP chunk alongside the image data, and many converters copy both across from the source photo without mentioning it — so a WebP exported for a website can still carry the GPS coordinates of the original shot. Animated and lossless WebP files are handled the same way: the metadata chunks are dropped, the image frames and colour profile are preserved exactly.",
  },
];

const USE_CASES = [
  ["Selling something online", "Marketplace and classified photos are downloaded by strangers. A photo taken in your driveway can carry the GPS coordinates of your house; clean it before the listing goes live, not after."],
  ["Client work & portfolios", "Deliver files without your camera serial, your editing stack, internal captions or the AI prompts behind a concept. Clients get the picture, not your process."],
  ["Family photos", "School runs, birthdays and holidays are the photos most likely to be forwarded at original quality — and the ones where a location tag says the most."],
  ["Property & listings", "Estate agents and landlords publish interior shots taken on site. Cleaning first keeps the exact coordinates and device details out of a file anyone can save."],
];

const CHECKLIST = [
  "Clean the original file, not a screenshot of it — a screenshot lowers quality and still adds fresh device data of its own.",
  "Read the scan report before downloading. If a category surprises you, it would have surprised the person you send the file to as well.",
  "Check the picture itself for visible clues — house numbers, documents, screens. Metadata removal cannot hide what is in the pixels.",
  "Send the cleaned copy, and keep your original somewhere private. Cleaning is one-way; your archive should keep the file with its dates intact.",
  "Re-clean after editing. Editors re-embed their own metadata on export, so a cleaned photo that goes back through an editor needs cleaning again.",
];

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
          <h2 className="t-sub">Why lossless matters</h2>
          <p className="mt-5 leading-7 text-ink-2">
            The easy way to strip a photo&apos;s metadata is to open it and save a new copy — and for a JPEG,
            every save is another round of lossy compression. Edges soften, colours drift, fine detail
            smears, and the damage compounds each time the file passes through another tool. Most people
            never notice on a phone screen; clients, printers and anyone zooming in do.
          </p>
          <p className="mt-4 leading-7 text-ink-2">
            This cleaner never opens your photo that way. It takes the file apart at the container level,
            drops the metadata blocks and copies the compressed image data through exactly as it arrived.
            Then it decodes both versions and compares every pixel. If a single one differed, you would
            get an error instead of a file — that check, not a promise, is the guarantee.
          </p>
        </div>
      </section>

      <section className="wrap section-lg">
        <SectionHeading
          title="What a photo file says about you"
          description="None of this is visible in the picture. All of it travels with the file, readable in seconds by anyone who downloads it. Here is what the scan looks for, and removes."
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
          <SectionHeading
            title="Format by format: where image metadata hides"
            description="Each format stores its secrets in a different place, which is why a tool that only strips EXIF leaves so much behind."
          />
          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            {FORMATS.map((f) => (
              <div key={f.title} className="card p-7">
                <h3 className="text-lg font-bold">{f.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="wrap section-lg grid gap-12 lg:grid-cols-2 lg:items-start">
        <div>
          <h2 className="t-section">Who cleans a photo before sharing it</h2>
          <p className="t-lead mt-5 text-muted">
            Metadata is rarely a problem in the app you posted to — platforms differ, and some strip parts
            of it. It is a problem in the file itself, on every route where the original travels intact:
            email, cloud links, client handovers, marketplace downloads and portfolio uploads.
          </p>
          <dl className="mt-9 space-y-7">
            {USE_CASES.map(([term, detail]) => (
              <div key={term}>
                <dt className="font-bold text-ink">{term}</dt>
                <dd className="mt-1.5 text-sm leading-6 text-muted">{detail}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="card overflow-hidden">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Comparison of re-saving versus container rewriting for images</caption>
            <thead className="bg-paper">
              <tr>
                <th className="p-4 text-xs font-bold uppercase tracking-wide text-muted" scope="col"><span className="sr-only">Property</span></th>
                <th className="p-4 text-xs font-bold uppercase tracking-wide text-muted" scope="col">Typical tool</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wide text-signal" scope="col">{site.name}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {[
                ["Method", "Open and re-save", "Container rewrite"],
                ["Image quality", "Recompressed", "Untouched"],
                ["Pixels", "Slightly different", "Verified identical"],
                ["Colour profile", "Often dropped", "Kept"],
                ["PNG prompt text", "Sometimes missed", "Removed"],
                ["AI & C2PA data", "Sometimes missed", "Removed"],
                ["Embedded thumbnail", "Often survives", "Removed"],
                ["Batch cleaning", "One file at a time", "20 at once, ZIP download"],
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
            title="The 60-second check before you share a photo"
            description="Five habits that cover almost every way a photo gives away more than the picture."
          />
          <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {CHECKLIST.map((item, i) => (
              <li key={item} className="border-t-2 border-ink pt-5">
                <span className="text-sm font-bold text-signal">Check {i + 1}</span>
                <p className="mt-2 text-sm leading-6 text-muted">{item}</p>
              </li>
            ))}
          </ol>
          <p className="mt-10 text-sm text-muted">
            Need device-specific steps? See how to <Link className="link" href="/guides/remove-exif-iphone">remove EXIF on iPhone</Link>, <Link className="link" href="/guides/remove-exif-android">remove photo metadata on Android</Link>, <Link className="link" href="/guides/remove-exif-windows">remove metadata on Windows</Link>, or <Link className="link" href="/guides/remove-exif-mac">remove metadata on Mac</Link>. You can also <Link className="link" href="/guides/remove-gps-from-photo">remove GPS from a photo</Link> and <Link className="link" href="/guides/remove-c2pa-content-credentials">remove C2PA Content Credentials</Link>.
          </p>
        </div>
      </section>

      <section className="wrap section-lg">
        <SectionHeading
          title="Photo questions, answered"
          description="Including what cleaning cannot do, said plainly."
          action={{ href: "/faq", label: "Read all FAQs" }}
        />
        <div className="mt-10"><FaqList items={toolFaqs} /></div>
      </section>

      <CtaBand
        title="Cleaning video too?"
        text="The video cleaner strips GPS tracks, device names, timestamps and Content Credentials from MP4, MOV, WebM, MKV and AVI — also without re-encoding."
        href="/video-metadata-cleaner"
        cta="Clean a video"
      />
    </>
  );
}

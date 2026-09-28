import { PageIntro } from "@/components/PageIntro";
import { CtaBand } from "@/components/CtaBand";
import { pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = pageMeta({
  title: "About MediaPure | Why We Built a Lossless Metadata Remover",
  description: "MediaPure is built by The Vector. Why we made it, how it grew from an image cleaner into a media privacy platform, and how we keep it free.",
  path: "/about",
  keywords: ["about MediaPure", "Media Pure", "metadata remover company"],
});

export default function About() {
  return (
    <>
      <PageIntro crumb="About us" path="/about" title="We build tools that respect what you share"
        intro="MediaPure is made by The Vector, a software company that builds AI systems and web products for businesses." />
      <section className="wrap section-lg grid gap-12 lg:grid-cols-[1fr_0.9fr] lg:gap-16">
        <div className="prose-doc">
          <h2>Why this exists</h2>
          <p>
            We work with AI image tools every day, for our own products and for clients. While preparing assets, we kept finding the
            same thing: files that looked finished but carried prompts, tool names, timestamps and, in the case of edited phone
            photos, exact GPS coordinates.
          </p>
          <p>
            The tools we tried to clean them fell into two camps. Some missed the newer data entirely, like PNG prompt fields and
            Content Credentials. Others removed it by re-saving the image, which quietly degraded quality on every pass. Neither
            was acceptable for client work, so we built the tool we wanted.
          </p>
          <h2>From images to media</h2>
          <p>
            The tool launched as an image metadata remover, and that is still what most people come for. But the same
            questions kept arriving about video: does a phone clip carry GPS, does a screen recording name my machine,
            what happens to Content Credentials on an AI-generated video? The answers turned out to be worse than for
            images. A video can carry a timed GPS track that logs an entire journey, second by second, and almost no
            tool touches it.
          </p>
          <p>
            So the product became MediaPure: the same engine philosophy, applied to both. The original image cleaner is
            unchanged and lives at the same address it always has; the video cleaner sits beside it with the same
            promise, the same reporting and the same expiry rules.
          </p>
          <h2>What we believe</h2>
          <p><strong>Private by construction.</strong> The safest data is data we never keep. Originals stay in memory and cleaned files expire in minutes.</p>
          <p><strong>Show, don&apos;t hide.</strong> You see every field we find before it&apos;s removed, so you learn what your files carry.</p>
          <p><strong>Never harm the media.</strong> If we can&apos;t prove the pixels or the frames are identical, we don&apos;t hand you the file.</p>
          <p><strong>Be honest about limits.</strong> Removing metadata isn&apos;t a way to disguise where something came from, and we won&apos;t pretend otherwise.</p>
        </div>
        <aside className="h-fit rounded-[var(--radius-card)] border border-line bg-paper p-7 md:p-8">
          <h2 className="t-card">The Vector</h2>
          <p className="mt-3 leading-7 text-ink-2">
            We design and build AI agents, automation and web platforms. This tool is free and will stay free for everyday use.
            If your team needs higher volumes or an integration, we&apos;d like to hear from you.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={site.company.url} target="_blank" rel="noopener" className="btn btn-primary">Visit The Vector</a>
            <a href={`mailto:${site.company.email}`} className="btn btn-ghost">Email us</a>
          </div>
        </aside>
      </section>
      <CtaBand
        title="Try it on something of your own"
        text="Free, no signup, and nothing you upload is kept."
        href="/video-metadata-cleaner"
        cta="Clean a video"
        secondary={{ href: "/image-metadata-cleaner", label: "Clean an image" }}
      />
    </>
  );
}

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CtaBand({
  title = "Clean your next file before you share it",
  text = "Free, no signup, and your pixels and frames stay exactly as they are.",
  href = "/video-metadata-cleaner",
  cta = "Clean a video",
  secondary,
}: {
  title?: string;
  text?: string;
  href?: string;
  cta?: string;
  secondary?: { href: string; label: string };
}) {
  return (
    <section className="wrap section">
      <div className="band-ink relative overflow-hidden rounded-[var(--radius-panel)] bg-ink px-6 py-12 text-white md:px-14 md:py-16">
        <div aria-hidden className="absolute inset-y-0 right-0 hidden w-1/2 opacity-60 md:block"
          style={{ backgroundImage: "linear-gradient(90deg,#0a1433 0%,transparent 60%),radial-gradient(circle at 2px 2px,#12c2f266 2px,transparent 0)", backgroundSize: "auto,26px 26px" }} />
        <div className="relative max-w-xl">
          <h2 className="t-section">{title}</h2>
          <p className="t-lead mt-4 text-white/70">{text}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={href} className="btn btn-lg btn-invert">{cta} <ArrowRight size={17} aria-hidden /></Link>
            {secondary && (
              <Link href={secondary.href} className="btn btn-lg btn-invert-soft">
                {secondary.label}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

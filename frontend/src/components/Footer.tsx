import Link from "next/link";
import { Mail } from "lucide-react";
import { Logo } from "./Logo";
import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-line bg-paper">
      <div className="wrap grid gap-10 py-14 md:grid-cols-2 md:gap-12 lg:grid-cols-[1.5fr_repeat(3,1fr)] lg:gap-10">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-5 text-sm leading-6 text-muted">
            {site.tagline} Remove EXIF, GPS, AI prompts and Content Credentials from images and video.
            Lossless, free, and nothing kept.
          </p>
          <a href={`mailto:${site.company.email}`} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-ink-2 transition-colors hover:text-signal">
            <Mail size={16} className="shrink-0" aria-hidden /> {site.company.email}
          </a>
        </div>
        {site.footer.map((col) => (
          <nav key={col.title} aria-labelledby={`footer-${col.title}`}>
            <h2 id={`footer-${col.title}`} className="text-xs font-bold uppercase tracking-wide text-ink">{col.title}</h2>
            <ul className="mt-4 space-y-3">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-muted transition-colors hover:text-signal">{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="wrap flex flex-col gap-2 py-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
          <p>
            Powered by{" "}
            <a href={site.company.url} target="_blank" rel="noopener" className="font-bold text-ink transition-colors hover:text-signal">The Vector</a>
          </p>
        </div>
      </div>
    </footer>
  );
}

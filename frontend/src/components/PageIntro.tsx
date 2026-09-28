import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { JsonLd } from "./JsonLd";
import { breadcrumbSchema } from "@/lib/seo";

export function PageIntro({ title, intro, crumb, path, eyebrow, children }: {
  title: string; intro: string; crumb: string; path: string; eyebrow?: string; children?: React.ReactNode;
}) {
  return (
    <section className="pixel-field border-b border-line">
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: crumb, path }])} />
      <div className="wrap py-12 md:py-16 lg:py-20">
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1 text-sm text-muted">
          <Link href="/" className="rounded transition-colors hover:text-signal">Home</Link>
          <ChevronRight size={14} className="text-line-strong" aria-hidden />
          <span aria-current="page" className="font-semibold text-ink-2">{crumb}</span>
        </nav>
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h1 className="t-display max-w-3xl text-ink">{title}</h1>
        <p className="t-lead mt-5 max-w-2xl text-muted">{intro}</p>
        {children}
      </div>
    </section>
  );
}

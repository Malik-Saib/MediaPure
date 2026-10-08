import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema, faqSchema, pageMeta } from "@/lib/seo";
import { getGuide, guides } from "@/lib/guides";
type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return guides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: Params) {
  const guide = getGuide((await params).slug);
  if (!guide) return {};
  return pageMeta({
    title: guide.seoTitle,
    description: guide.description,
    path: `/guides/${guide.slug}`,
  });
}

export default async function GuidePage({ params }: Params) {
  const guide = getGuide((await params).slug);
  if (!guide) notFound();
  const path = `/guides/${guide.slug}`;
  const faqItems = guide.faqs.map(({ q, a }) => ({ q, a }));

  return (
    <>
      <JsonLd data={[
        faqSchema(faqItems),
        breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Photo and video privacy guides", path: "/blog" },
          { name: guide.title, path },
        ]),
      ]} />
      <article className="wrap max-w-3xl py-12 md:py-16">
        <nav aria-label="Breadcrumb" className="mb-8 flex gap-2 text-sm text-muted">
          <Link href="/" className="link">Home</Link>
          <span aria-hidden>/</span>
          <Link href="/blog" className="link">Privacy guides</Link>
        </nav>
        <h1 className="t-display">{guide.title}</h1>
        <p className="t-lead mt-5 text-muted">{guide.intro}</p>
        <div className="my-8">
          <Link href="/image-metadata-cleaner" className="btn btn-primary">
            Open the free photo metadata remover
          </Link>
        </div>
        <div className="prose-doc">
          {guide.sections.map((section) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </section>
          ))}
        </div>
        <section className="mt-12 border-t border-line pt-8" aria-labelledby="guide-faq">
          <h2 id="guide-faq" className="t-section">Frequently asked questions</h2>
          <div className="mt-5 divide-y divide-line">
            {faqItems.map(({ q, a }) => (
              <details key={q} className="py-4">
                <summary className="cursor-pointer font-semibold text-ink">{q}</summary>
                <p className="mt-3 leading-7 text-muted">{a}</p>
              </details>
            ))}
          </div>
        </section>
        <div className="mt-10 rounded-2xl border border-line bg-paper p-6">
          <p className="font-bold text-ink">Ready to clean a photo?</p>
          <p className="mt-2 leading-7 text-muted">
            Scan a copy for EXIF, GPS and other embedded fields with our free photo metadata remover.
          </p>
          <Link href="/image-metadata-cleaner" className="btn btn-primary mt-5">Remove metadata from a photo</Link>
          <Link href="/video-metadata-cleaner" className="ml-3 inline-flex items-center font-semibold text-signal underline underline-offset-4">
            Remove metadata from video
          </Link>
        </div>
      </article>
    </>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { Prose } from "@/components/Prose";
import { CtaBand } from "@/components/CtaBand";
import { getPost, posts } from "@/lib/blog";
import { breadcrumbSchema, pageMeta } from "@/lib/seo";
import { absolute, site } from "@/lib/site";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params) {
  const post = getPost((await params).slug);
  if (!post) return {};
  return pageMeta({ title: post.title, description: post.description, path: `/blog/${post.slug}`, type: "article" });
}

export default async function PostPage({ params }: Params) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  const path = `/blog/${post.slug}`;
  const others = posts.filter((p) => p.slug !== post.slug).slice(0, 2);
  return (
    <>
      <JsonLd data={[
        {
          "@context": "https://schema.org", "@type": "Article", headline: post.title, description: post.description,
          datePublished: post.date, dateModified: post.updated ?? post.date, mainEntityOfPage: absolute(path),
          image: absolute("/og.png"), author: { "@type": "Organization", name: site.company.name, url: site.company.url },
          publisher: { "@id": `${site.url}/#organization` },
        },
        breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }, { name: post.title, path }]),
      ]} />
      <article className="wrap max-w-3xl py-12 md:py-16">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-muted">
          <Link href="/" className="transition-colors hover:text-signal">Home</Link>
          <ChevronRight size={14} className="text-line-strong" aria-hidden />
          <Link href="/blog" className="transition-colors hover:text-signal">Blog</Link>
        </nav>
        <p className="mt-8 text-sm text-muted">
          <span className="font-bold text-signal">{post.tag}</span> · <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</time> · {post.readMinutes} min read
        </p>
        <h1 className="t-display mt-3">{post.title}</h1>
        <p className="t-lead mt-5 text-muted">{post.description}</p>
        <hr className="my-10 border-line" />
        <Prose blocks={post.body} />
        <p className="mt-12 border-t border-line pt-6 text-sm text-muted">Written by the team at <a href={site.company.url} className="font-semibold text-ink underline underline-offset-4 transition-colors hover:text-signal" rel="noopener">The Vector</a>.</p>
      </article>
      <aside className="wrap max-w-3xl border-t border-line py-12">
        <h2 className="t-card">Keep reading</h2>
        <ul className="mt-6 grid gap-8 sm:grid-cols-2">
          {others.map((p) => (
            <li key={p.slug}>
              <Link href={`/blog/${p.slug}`} className="text-lg font-bold leading-snug transition-colors hover:text-signal">{p.title}</Link>
              <p className="mt-1.5 text-sm leading-6 text-muted">{p.description}</p>
            </li>
          ))}
        </ul>
      </aside>
      <CtaBand />
    </>
  );
}

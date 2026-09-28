import Link from "next/link";
import { PageIntro } from "@/components/PageIntro";
import { posts } from "@/lib/blog";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Media Privacy Blog: EXIF, Video Metadata & C2PA Guides",
  description: "Practical guides on image and video metadata: what AI files reveal, removing EXIF data, stripping GPS from video, Content Credentials explained and pre-upload privacy checklists.",
  path: "/blog",
  keywords: ["video metadata guide", "EXIF guide", "C2PA", "media privacy blog"],
});

const fmt = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

export default function Blog() {
  return (
    <>
      <PageIntro crumb="Blog" path="/blog" title="Guides to media privacy"
        intro="What's inside your image and video files, why it matters and how to take control of it. Written by the people who built the cleaners." />
      <div className="wrap section max-w-4xl">
        <ul className="divide-y divide-line border-y border-line">
          {posts.map((p) => (
            <li key={p.slug} className="group py-8">
              <article>
                <p className="text-sm text-muted"><span className="font-bold text-signal">{p.tag}</span> · <time dateTime={p.date}>{fmt(p.date)}</time> · {p.readMinutes} min read</p>
                <h2 className="t-sub mt-2"><Link href={`/blog/${p.slug}`} className="transition-colors hover:text-signal">{p.title}</Link></h2>
                <p className="mt-2.5 max-w-2xl leading-7 text-muted">{p.description}</p>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

import Link from "next/link";
import { PageIntro } from "@/components/PageIntro";
import { FaqList } from "@/components/FaqList";
import { JsonLd } from "@/components/JsonLd";
import { faqs } from "@/lib/faqs";
import { faqSchema, pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Photo & Video Metadata Remover FAQ | MediaPure",
  description:
    "Answers about photo metadata removal, EXIF, GPS, C2PA, quality, supported formats and video cleaning from the MediaPure team.",
  path: "/faq",
  keywords: ["video metadata FAQ", "remove video metadata", "EXIF remover FAQ", "MediaPure"],
});

const GROUPS = ["Basics", "Quality", "Video", "Privacy", "AI images"] as const;

export default function FaqPage() {
  return (
    <>
      <JsonLd data={faqSchema(faqs)} />
      <PageIntro crumb="FAQ" path="/faq" title="Photo and video metadata removal FAQ"
        intro="Everything about how the image and video cleaners work, what they remove and what happens to your files." />
      <div className="wrap section max-w-4xl">
        {GROUPS.map((g) => (
          <section key={g} className="mb-14 last:mb-0">
            <h2 className="t-sub mb-4">{g}</h2>
            <FaqList items={faqs.filter((f) => f.group === g)} />
          </section>
        ))}
        <p className="mt-12 text-muted">Still wondering about something? <Link href="/contact" className="link">Ask us directly</Link>.</p>
      </div>
    </>
  );
}

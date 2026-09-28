import { Mail, Globe } from "lucide-react";
import { PageIntro } from "@/components/PageIntro";
import { ContactForm } from "@/components/ContactForm";
import { JsonLd } from "@/components/JsonLd";
import { pageMeta } from "@/lib/seo";
import { site, absolute } from "@/lib/site";

export const metadata = pageMeta({
  title: "Contact Us | MediaPure by The Vector",
  description: "Questions, bug reports, business enquiries or privacy requests. Contact the team behind MediaPure.",
  path: "/contact",
});

export default function Contact() {
  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "ContactPage", url: absolute("/contact"),
        mainEntity: { "@type": "Organization", name: site.name, email: site.company.email, url: site.url,
          parentOrganization: { "@type": "Organization", name: site.company.name, url: site.company.url } } }} />
      <PageIntro crumb="Contact" path="/contact" title="Talk to us"
        intro="Found a bug, need higher limits for your team, or have a privacy request? Send a message and a person will reply." />
      <div className="wrap section grid gap-12 lg:grid-cols-[1.3fr_0.7fr] lg:gap-16">
        <ContactForm />
        <aside className="card card-pad h-fit space-y-7">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wide text-muted">Email</h2>
            <a href={`mailto:${site.company.email}`} className="link mt-2 inline-flex items-center gap-2">
              <Mail size={17} className="shrink-0" aria-hidden /> {site.company.email}
            </a>
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wide text-muted">Company</h2>
            <p className="mt-2 font-semibold text-ink-2">{site.company.name}</p>
            <a href={site.company.url} target="_blank" rel="noopener" className="link mt-1 inline-flex items-center gap-2">
              <Globe size={17} className="shrink-0" aria-hidden /> thevector.systems
            </a>
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wide text-muted">Response time</h2>
            <p className="mt-2 leading-7 text-muted">Within two working days. Privacy requests are handled first.</p>
          </div>
        </aside>
      </div>
    </>
  );
}

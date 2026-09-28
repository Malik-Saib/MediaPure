import { PageIntro } from "./PageIntro";

export function LegalPage({ title, crumb, path, intro, updated, sections }: {
  title: string; crumb: string; path: string; intro: string; updated: string;
  sections: { h: string; p: (string | string[])[] }[];
}) {
  return (
    <>
      <PageIntro crumb={crumb} path={path} title={title} intro={intro}>
        <p className="mt-4 text-sm text-muted">Last updated: {updated}</p>
      </PageIntro>
      <div className="wrap py-14 md:py-20">
        <div className="prose-doc">
          {sections.map((s) => (
            <section key={s.h}>
              <h2>{s.h}</h2>
              {s.p.map((x, i) => Array.isArray(x)
                ? <ul key={i}>{x.map((li) => <li key={li}>{li}</li>)}</ul>
                : <p key={i}>{x}</p>)}
            </section>
          ))}
        </div>
      </div>
    </>
  );
}

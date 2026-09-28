import Link from "next/link";
import type { Block } from "@/lib/blog";

function inline(text: string) {
  const parts: React.ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const href = m[2];
    parts.push(href.startsWith("/") ? <Link key={m.index} href={href}>{m[1]}</Link> : <a key={m.index} href={href} rel="noopener">{m[1]}</a>);
    last = m.index + m[0].length;
  }
  parts.push(text.slice(last));
  return parts;
}

export function Prose({ blocks }: { blocks: Block[] }) {
  return (
    <div className="prose-doc">
      {blocks.map((b, i) => {
        switch (b.t) {
          case "h2": return <h2 key={i}>{b.text}</h2>;
          case "p": return <p key={i}>{inline(b.text)}</p>;
          case "ul": return <ul key={i}>{b.items.map((x, j) => <li key={j}>{inline(x)}</li>)}</ul>;
          case "ol": return <ol key={i}>{b.items.map((x, j) => <li key={j}>{inline(x)}</li>)}</ol>;
          case "note": return <aside key={i} className="my-7 rounded-[var(--radius-card)] border border-signal/20 bg-signal/[0.05] p-5 leading-7 text-ink-2">{inline(b.text)}</aside>;
        }
      })}
    </div>
  );
}

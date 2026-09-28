import { ChevronDown } from "lucide-react";
import type { Faq } from "@/lib/faqs";

export function FaqList({ items }: { items: Faq[] }) {
  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((f) => (
        <details key={f.q} className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 rounded-lg py-5 text-left text-lg font-bold leading-snug text-ink transition-colors hover:text-signal [&::-webkit-details-marker]:hidden">
            <span className="max-w-3xl">{f.q}</span>
            <span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-full bg-paper text-muted transition-[transform,background-color,color] duration-200 group-hover:bg-signal/10 group-hover:text-signal group-open:rotate-180">
              <ChevronDown size={18} />
            </span>
          </summary>
          <p className="max-w-3xl pb-6 leading-7 text-ink-2">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

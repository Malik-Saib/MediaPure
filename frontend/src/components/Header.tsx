"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { Image as ImageIcon, Menu, Video, X } from "lucide-react";
import { Logo } from "./Logo";
import { site } from "@/lib/site";

const TOOL_ICON = { "/image-metadata-cleaner": ImageIcon, "/video-metadata-cleaner": Video } as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const path = usePathname();

  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <header className={`sticky top-0 z-50 border-b transition-colors duration-200 ${scrolled || open ? "border-line bg-white/90 shadow-[0_1px_0_#dce3f0,0_8px_24px_-20px_#0a143333] backdrop-blur-md" : "border-transparent bg-white/0"}`}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-10 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-bold focus:shadow">Skip to content</a>
      <div className="wrap flex h-16 items-center justify-between gap-4 md:h-[4.5rem] lg:gap-6">
        <Logo priority />

        <nav aria-label="Main" className="hidden items-center gap-0.5 lg:flex">
          {site.nav.map((n) => {
            const active = path === n.href;
            return (
              <Link key={n.href} href={n.href} aria-current={active ? "page" : undefined}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${active ? "text-signal" : "text-ink-2 hover:bg-paper hover:text-ink"}`}>
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 sm:gap-5">
          {/* The image and video cleaners are peers: one shared button treatment, and the
              tool you are currently on is the filled one. Neither outranks the other. */}
          {site.tools.map((tool) => {
            const Icon = TOOL_ICON[tool.href as keyof typeof TOOL_ICON];
            const active = path === tool.href;
            return (
              <Link key={tool.href} href={tool.href} aria-current={active ? "page" : undefined}
                className="btn btn-sm btn-tool hidden sm:inline-flex">
                <Icon size={16} aria-hidden /> Clean {tool.short.toLowerCase()}
              </Link>
            );
          })}
          <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="-mr-2 grid size-10 place-items-center rounded-lg text-ink transition-colors hover:bg-paper lg:hidden">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <m.nav id="mobile-nav" aria-label="Mobile" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden border-t border-line bg-white lg:hidden">
            <div className="wrap flex flex-col gap-1 py-4">
              {site.tools.map((tool) => {
                const Icon = TOOL_ICON[tool.href as keyof typeof TOOL_ICON];
                const active = path === tool.href;
                return (
                  <Link key={tool.href} href={tool.href} aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 font-bold transition-colors ${active ? "bg-signal text-white" : "bg-paper text-ink hover:bg-signal/[0.08]"}`}>
                    <Icon size={18} className={active ? "text-white" : "text-signal"} aria-hidden /> {tool.label}
                  </Link>
                );
              })}
              <hr className="my-2 border-line" />
              {site.nav.map((n) => {
                const active = path === n.href;
                return (
                  <Link key={n.href} href={n.href} aria-current={active ? "page" : undefined}
                    className={`rounded-lg px-3 py-2.5 font-semibold transition-colors ${active ? "text-signal" : "text-ink-2 hover:bg-paper hover:text-ink"}`}>
                    {n.label}
                  </Link>
                );
              })}
            </div>
          </m.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

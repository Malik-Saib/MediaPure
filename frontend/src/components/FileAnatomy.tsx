"use client";
import { useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { ShieldCheck } from "lucide-react";

const FIELDS = [
  { g: "GPS", k: "GPSLatitude", v: "33° 35' 52.20\" N", c: "Location" },
  { g: "GPS", k: "GPSLongitude", v: "73° 2' 51.50\" E", c: "Location" },
  { g: "EXIF", k: "Model", v: "iPhone 15 Pro", c: "Device" },
  { g: "EXIF", k: "LensModel", v: "back triple camera 6.765mm f/1.78", c: "Device" },
  { g: "EXIF", k: "DateTimeOriginal", v: "2026:09:01 18:42:07", c: "Time" },
  { g: "XMP", k: "dc:creator", v: "Sara Malik", c: "Creator" },
  { g: "XMP", k: "xmp:CreatorTool", v: "Adobe Photoshop 26.1", c: "Software" },
  { g: "C2PA", k: "Software agent", v: "ChatGPT (gpt-image)", c: "AI" },
  { g: "C2PA", k: "Digital source type", v: "trainedAlgorithmicMedia", c: "AI" },
];
const TONE: Record<string, string> = {
  Location: "bg-alert/10 text-alert-ink", Creator: "bg-alert/10 text-alert-ink", Device: "bg-amber/10 text-amber-ink",
  AI: "bg-amber/10 text-amber-ink", Time: "bg-signal/10 text-signal-deep", Software: "bg-signal/10 text-signal-deep",
};

export function FileAnatomy() {
  const [clean, setClean] = useState(false);
  return (
    <div className="grid overflow-hidden rounded-[var(--radius-panel)] border border-line bg-white shadow-soft md:grid-cols-[0.9fr_1.1fr]">
      <div className="relative flex min-h-72 flex-col justify-between bg-[linear-gradient(160deg,#0b45c7,#12c2f2)] p-6 text-white">
        <svg viewBox="0 0 320 200" className="w-full drop-shadow-xl" role="img" aria-label="Example image: rooftop café at dusk">
          <defs>
            <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1b2b6b" /><stop offset="1" stopColor="#f59e6b" /></linearGradient>
          </defs>
          <rect width="320" height="200" rx="14" fill="url(#sky)" />
          <circle cx="238" cy="118" r="26" fill="#ffd9a0" opacity=".9" />
          <path d="M0 150h40v-40h30v25h26v-55h34v70h24v-30h30v40h40v-60h28v48h68V200H0z" fill="#0a1433" opacity=".85" />
          <rect x="18" y="170" width="284" height="6" rx="3" fill="#ffd9a0" opacity=".5" />
          {[40, 90, 140, 190, 240].map((x) => <circle key={x} cx={x} cy="166" r="3" fill="#ffe8b8" />)}
        </svg>
        <div className="mt-6">
          <p className="font-mono text-xs text-white/75">cafe-rooftop-final.jpg</p>
          <p className="t-card mt-1">What you see is the picture.</p>
          <p className="mt-1 text-white/80">What you share is the whole file.</p>
        </div>
      </div>

      <div className="flex flex-col p-5 md:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-base font-bold text-ink">{clean ? "After cleaning" : "Hidden inside the file"}</p>
          {/* The selected side is filled with the signal blue, so the state reads at a glance. */}
          <div role="radiogroup" aria-label="Show file before or after cleaning"
            className="inline-flex rounded-xl border border-line bg-paper p-1 text-sm font-bold">
            {[["Before", false], ["After", true]].map(([label, val]) => (
              <button key={String(label)} type="button" role="radio" aria-checked={clean === val} onClick={() => setClean(val as boolean)}
                className={`rounded-lg px-4 py-1.5 transition-[background-color,color,box-shadow] duration-200 ${
                  clean === val
                    ? "bg-signal text-white shadow-[0_1px_0_#ffffff33_inset,0_6px_16px_-10px_#1463ff]"
                    : "text-ink-2 hover:bg-white hover:text-ink"
                }`}>
                {label as string}
              </button>
            ))}
          </div>
        </div>

        <div className="relative mt-4 min-h-[22rem] flex-1">
          <ul className="space-y-1.5">
            <AnimatePresence>
              {!clean && FIELDS.map((f, i) => (
                <m.li key={f.k} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0, transition: { delay: i * 0.03 } }}
                  exit={{ opacity: 0, x: 40, scale: 0.6, filter: "blur(4px)", transition: { delay: i * 0.04, duration: 0.28 } }}
                  className="grid grid-cols-[4.75rem_1fr] items-baseline gap-x-3 rounded-lg px-2.5 py-1.5 even:bg-paper/70 sm:grid-cols-[4.75rem_11rem_1fr]">
                  <span className={`w-fit rounded-md px-1.5 py-0.5 text-xs font-bold ${TONE[f.c]}`}>{f.c}</span>
                  <span className="font-mono text-xs text-ink">{f.k}</span>
                  <span className="col-start-2 truncate text-sm text-ink-2 sm:col-start-3">{f.v}</span>
                </m.li>
              ))}
            </AnimatePresence>
          </ul>
          <AnimatePresence>
            {clean && (
              <m.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.5 } }} exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="grid size-14 place-items-center rounded-2xl bg-clean/10 text-clean"><ShieldCheck size={28} aria-hidden /></span>
                <p className="t-section mt-4 text-ink">0 fields</p>
                <p className="mt-2 max-w-xs leading-7 text-muted">Location, device, names, dates and AI data are gone. Every pixel is exactly as it was.</p>
              </m.div>
            )}
          </AnimatePresence>
        </div>
        <p className="mt-4 border-t border-line pt-4 text-sm text-muted">
          {clean ? "Kept: ICC colour profile, so colours render the same." : "Example: an edited phone photo with an AI-generated sky. A selection of what we typically find."}
        </p>
      </div>
    </div>
  );
}

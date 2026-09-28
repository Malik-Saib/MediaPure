"use client";

import { useState } from "react";
import { Image as ImageIcon, Video } from "lucide-react";
import { Cleaner } from "./Cleaner";
import { VideoCleaner } from "./VideoCleaner";

const TABS = [
  { key: "image", label: "Clean images", icon: ImageIcon, hint: "JPG · PNG · WebP" },
  { key: "video", label: "Clean video", icon: Video, hint: "MP4 · MOV · WebM · MKV · AVI" },
] as const;

/**
 * The homepage entry point for both tools.
 *
 * Each cleaner keeps its own state, so switching tabs does not disturb work already in
 * flight; the inactive panel is hidden rather than unmounted.
 */
export function HeroTools() {
  const [active, setActive] = useState<"image" | "video">("image");

  return (
    <div>
      <div role="tablist" aria-label="Choose what to clean"
        className="mb-3 grid grid-cols-2 gap-1.5 rounded-2xl bg-paper p-1.5 sm:gap-2">
        {TABS.map(({ key, label, icon: Icon, hint }) => {
          const on = active === key;
          return (
            <button key={key} type="button" role="tab" id={`tab-${key}`} aria-selected={on}
              aria-controls={`panel-${key}`} onClick={() => setActive(key)}
              className={`flex flex-col items-center gap-1 rounded-xl px-2 py-2.5 transition-[background-color,color,box-shadow] duration-200 sm:px-3 sm:py-3 ${
                on
                  ? "bg-white text-ink shadow-[0_1px_2px_-1px_#0a143312,0_10px_24px_-18px_#0b45c766] ring-1 ring-signal/25"
                  : "text-muted hover:bg-white/60 hover:text-ink"
              }`}>
              <span className="flex items-center gap-1.5 whitespace-nowrap text-sm font-bold sm:gap-2 sm:text-base">
                <Icon size={16} className={`shrink-0 ${on ? "text-signal" : "text-muted"}`} aria-hidden /> {label}
              </span>
              {/* Format lists read as they are written: sentence-cased, 13px, no forced tracking. */}
              <span className={`text-center text-xs font-medium leading-snug ${on ? "text-ink-2" : "text-muted"}`}>{hint}</span>
            </button>
          );
        })}
      </div>

      <div role="tabpanel" id="panel-image" aria-labelledby="tab-image" hidden={active !== "image"}>
        <Cleaner variant="hero" />
      </div>
      <div role="tabpanel" id="panel-video" aria-labelledby="tab-video" hidden={active !== "video"}>
        <VideoCleaner variant="hero" />
      </div>
    </div>
  );
}

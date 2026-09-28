"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import {
  AlertTriangle, Check, ChevronDown, Download, FileArchive, ImagePlus, Loader2, ShieldCheck, Trash2, Upload, X,
} from "lucide-react";
import { ApiError, CleanResult, cleanImage, deleteFile, downloadZip, formatBytes } from "@/lib/api";
import { site } from "@/lib/site";

const MAX_FILES = 20;
const CONCURRENCY = 3;
const ACCEPT = ["image/jpeg", "image/png", "image/webp"];
const EXT_OK = /\.(jpe?g|png|webp)$/i;
const PHASES = ["Scanning", "Analyzing", "Removing", "Verifying", "Complete"] as const;
// Plain-language caption under the progress bar, one per phase.
const PHASE_NOTE = [
  "Reading the file structure…",
  "Checking for hidden information…",
  "Removing metadata…",
  "Verifying your pixels are untouched…",
  "Your clean image is ready",
];

type Status = "queued" | "uploading" | "processing" | "done" | "error";
type Item = {
  id: string;
  file: File;
  preview: string;
  status: Status;
  progress: number;
  phase: number;
  result?: CleanResult;
  error?: string;
  deleted?: boolean;
  doneAt?: number;
};

const CATEGORY_TONE: Record<string, string> = {
  location: "text-alert",
  creator: "text-alert",
  device: "text-amber",
  ai: "text-amber",
  credentials: "text-amber",
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function saveBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function Cleaner({ variant = "full" }: { variant?: "hero" | "full" }) {
  const [items, setItems] = useState<Item[]>([]);
  const [dragging, setDragging] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [zipping, setZipping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const running = useRef(new Set<string>());
  const inputId = useId();

  // Mirrors items so event handlers can read the live list without depending on it.
  const itemsRef = useRef<Item[]>(items);
  itemsRef.current = items;

  const patch = useCallback((id: string, p: Partial<Item>) => {
    setItems((all) => all.map((i) => (i.id === id ? { ...i, ...p } : i)));
  }, []);

  /* Validation happens here rather than inside the setItems updater: an updater may be
     replayed (React StrictMode runs it twice), which would duplicate the rejection
     messages and leak a second object URL per file. */
  const addFiles = useCallback((list: FileList | File[]) => {
    const incoming = Array.from(list);
    if (!incoming.length) return;

    const rejected: string[] = [];
    const accepted: Item[] = [];
    const room = MAX_FILES - itemsRef.current.filter((i) => !i.deleted).length;

    for (const f of incoming) {
      if (!(ACCEPT.includes(f.type) || EXT_OK.test(f.name))) {
        rejected.push(`${f.name} is not a JPG, PNG or WebP image.`);
      } else if (f.size > site.maxFileMb * 1024 * 1024) {
        rejected.push(`${f.name} is larger than ${site.maxFileMb} MB.`);
      } else if (!f.size) {
        rejected.push(`${f.name} is empty.`);
      } else if (accepted.length >= room) {
        rejected.push(`You can clean up to ${MAX_FILES} images at a time.`);
        break;
      } else {
        accepted.push({ id: uid(), file: f, preview: URL.createObjectURL(f), status: "queued", progress: 0, phase: 0 });
      }
    }

    if (accepted.length) setItems((current) => [...current, ...accepted]);
    setNotice(rejected.length ? Array.from(new Set(rejected)).slice(0, 3).join(" ") : null);
  }, []);

  // queue runner
  useEffect(() => {
    const active = items.filter((i) => i.status === "uploading" || i.status === "processing").length;
    const next = items.filter((i) => i.status === "queued" && !running.current.has(i.id)).slice(0, Math.max(0, CONCURRENCY - active));
    for (const item of next) {
      running.current.add(item.id);
      patch(item.id, { status: "uploading", phase: 0 });
      let timer: ReturnType<typeof setInterval> | undefined;
      cleanImage(item.file, (f) => {
        patch(item.id, { progress: f });
        if (f >= 1 && !timer) {
          patch(item.id, { status: "processing", phase: 1 });
          timer = setInterval(() => {
            setItems((all) => all.map((i) => (i.id === item.id && i.status === "processing" && i.phase < 3 ? { ...i, phase: i.phase + 1 } : i)));
          }, 320);
        }
      })
        .then((result) => patch(item.id, { status: "done", phase: 4, result, progress: 1, doneAt: Date.now() }))
        .catch((e: unknown) => patch(item.id, { status: "error", error: e instanceof ApiError ? e.message : "Processing failed. Try again." }))
        .finally(() => {
          if (timer) clearInterval(timer);
          running.current.delete(item.id);
        });
    }
  }, [items, patch]);

  // paste images from clipboard
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const files = Array.from(e.clipboardData?.files ?? []).filter((f) => f.type.startsWith("image/"));
      if (files.length) addFiles(files);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [addFiles]);

  // release object URLs on unmount
  useEffect(() => () => itemsRef.current.forEach((i) => URL.revokeObjectURL(i.preview)), []);

  const visible = items.filter((i) => !i.deleted);
  const done = visible.filter((i) => i.status === "done" && i.result);
  const busy = visible.some((i) => i.status === "queued" || i.status === "uploading" || i.status === "processing");
  const removedTotal = done.reduce((n, i) => n + (i.result!.before.field_count - i.result!.after.field_count), 0);

  const remove = (id: string) => {
    const it = items.find((i) => i.id === id);
    if (it?.result) deleteFile(it.result.token);
    if (it) URL.revokeObjectURL(it.preview);
    patch(id, { deleted: true });
  };

  const clearAll = () => {
    visible.forEach((i) => i.result && deleteFile(i.result.token));
    visible.forEach((i) => URL.revokeObjectURL(i.preview));
    setItems([]);
    setNotice(null);
  };

  const zipAll = async () => {
    setZipping(true);
    try {
      saveBlob(await downloadZip(done.map((i) => i.result!.token)), "cleaned-images.zip");
    } catch (e) {
      setNotice(e instanceof ApiError ? e.message : "Could not build the ZIP. Download files one by one.");
    } finally {
      setZipping(false);
    }
  };

  const compact = visible.length > 0;
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  return (
    <div className="w-full">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false); }}
        onDrop={onDrop}
        className={`relative rounded-[var(--radius-card)] border-2 border-dashed transition-[background-color,border-color,box-shadow] duration-200 ${dragging ? "border-signal bg-signal/[0.05] shadow-[0_0_0_4px_#1463ff14]" : "border-line-strong bg-white hover:border-[#a9bfe6] hover:bg-paper/60"} ${compact ? "p-4" : variant === "hero" ? "p-8 md:p-10" : "p-10 md:p-14"}`}
      >
        <input ref={inputRef} id={inputId} type="file" multiple className="sr-only"
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ""; }} />
        {compact ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted">Drop more images here, or paste with Ctrl+V.</p>
            <label htmlFor={inputId} className="btn btn-sm btn-ghost cursor-pointer"><ImagePlus size={16} aria-hidden /> Add images</label>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <span className={`grid size-16 place-items-center rounded-2xl transition-colors duration-200 ${dragging ? "bg-signal text-white" : "bg-signal/10 text-signal"}`}><Upload size={28} aria-hidden /></span>
            <p className="t-card mt-5 text-ink">Drop images to clean them</p>
            <p className="mt-2 text-muted">or paste from your clipboard</p>
            <label htmlFor={inputId} className="btn btn-lg btn-primary mt-6 cursor-pointer">Choose images</label>
            <p className="mt-6 text-sm text-muted">JPG, PNG or WebP · up to {site.maxFileMb} MB each · {MAX_FILES} at a time</p>
          </div>
        )}
      </div>

      <div aria-live="polite" className="sr-only">
        {busy ? "Cleaning images" : done.length ? `${done.length} images cleaned` : ""}
      </div>

      {notice && (
        <div role="alert" className="mt-4 flex items-start gap-2.5 rounded-xl border border-alert/25 bg-alert/[0.06] px-4 py-3 text-sm font-medium text-alert-ink">
          <AlertTriangle size={18} className="mt-px shrink-0 text-alert" aria-hidden />
          <span className="flex-1">{notice}</span>
          <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss notice"
            className="-m-1 shrink-0 rounded p-1 text-alert/70 transition-colors hover:text-alert-ink"><X size={16} /></button>
        </div>
      )}

      {done.length > 1 && (
        <div className="band-ink mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-card)] bg-ink px-5 py-4 text-white">
          <p className="text-sm">
            <span className="font-bold">{done.length} images cleaned</span>
            <span className="text-white/60"> · {removedTotal} metadata fields removed</span>
          </p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={zipAll} disabled={zipping || busy} className="btn btn-sm btn-invert">
              {zipping ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <FileArchive size={16} aria-hidden />} Download all (ZIP)
            </button>
            <button type="button" onClick={clearAll} className="btn btn-sm btn-invert-quiet">Delete all</button>
          </div>
        </div>
      )}

      <ul className="mt-4 space-y-3">
        <AnimatePresence initial={false}>
          {visible.map((item) => (
            <m.li key={item.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22 }}>
              <ItemCard item={item} onRemove={() => remove(item.id)} onRetry={() => patch(item.id, { status: "queued", error: undefined, progress: 0 })} />
            </m.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}

function ItemCard({ item, onRemove, onRetry }: { item: Item; onRemove: () => void; onRetry: () => void }) {
  const r = item.result;
  const inFlight = item.status !== "done" && item.status !== "error";
  return (
    <article className="card overflow-hidden shadow-soft">
      <div className="flex items-center gap-4 p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.preview} alt="" className="size-14 shrink-0 rounded-xl border border-line object-cover" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-ink" title={item.file.name}>{item.file.name}</p>
          <p className="mt-0.5 text-sm text-muted">
            {formatBytes(item.file.size)}
            {r && ` · ${r.before.width}×${r.before.height} · ${r.format.toUpperCase()}`}
          </p>
        </div>
        {item.status === "done" && (
          <span className="hidden items-center gap-1.5 rounded-full bg-clean/10 px-3 py-1 text-sm font-semibold text-clean sm:inline-flex">
            <ShieldCheck size={15} aria-hidden /> Clean
          </span>
        )}
        <button type="button" onClick={onRemove} aria-label={`Remove ${item.file.name}`}
          className="grid size-9 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-paper hover:text-ink">
          <X size={18} />
        </button>
      </div>

      {inFlight && <Phases item={item} />}

      {item.status === "error" && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-alert/[0.05] px-4 py-3">
          <p className="flex items-center gap-2 text-sm font-medium text-alert-ink"><AlertTriangle size={16} className="shrink-0 text-alert" aria-hidden /> {item.error}</p>
          <button type="button" onClick={onRetry} className="btn btn-sm btn-ghost">Try again</button>
        </div>
      )}

      {r && <ResultPanel result={r} doneAt={item.doneAt ?? Date.now()} onDelete={onRemove} />}
    </article>
  );
}

function Phases({ item }: { item: Item }) {
  const pct = item.status === "queued" ? 0 : item.status === "uploading" ? item.progress * 40 : 40 + item.phase * 18;
  return (
    <div className="border-t border-line px-4 py-4">
      <ol className="flex items-center justify-between gap-1 text-xs font-bold">
        {PHASES.map((p, i) => {
          const state = item.status === "queued" ? "todo" : i < item.phase ? "done" : i === item.phase ? "now" : "todo";
          return (
            <li key={p} className={`flex items-center gap-1.5 ${state === "todo" ? "text-muted/60" : state === "now" ? "text-signal" : "text-ink-2"}`}>
              {state === "done" ? <Check size={14} aria-hidden /> : state === "now" ? <Loader2 size={14} className="animate-spin" aria-hidden /> : <span className="size-1.5 rounded-full bg-current" aria-hidden />}
              <span className={i === item.phase ? "" : "hidden sm:inline"}>{p}</span>
            </li>
          );
        })}
      </ol>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-paper ring-1 ring-line/70 ring-inset" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label="Cleaning progress">
        <m.div className="h-full rounded-full bg-gradient-to-r from-signal to-cyan" animate={{ width: `${pct}%` }} transition={{ ease: "easeOut", duration: 0.3 }} />
      </div>
      <p className="mt-2.5 text-xs font-medium text-muted">
        {item.status === "queued"
          ? "Waiting in queue"
          : item.status === "uploading"
            ? `Analysing your image · uploading securely ${Math.round(item.progress * 100)}%`
            : PHASE_NOTE[item.phase] ?? `${PHASES[item.phase]}…`}
      </p>
    </div>
  );
}

function useCountdown(doneAt: number, seconds: number) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    const t = setInterval(() => setLeft(Math.max(0, seconds - Math.floor((Date.now() - doneAt) / 1000))), 1000);
    return () => clearInterval(t);
  }, [doneAt, seconds]);
  return left;
}

function ScoreRing({ value, tone }: { value: number; tone: "bad" | "good" }) {
  const c = 2 * Math.PI * 16;
  return (
    <svg viewBox="0 0 40 40" className="size-11 -rotate-90" aria-hidden>
      <circle cx="20" cy="20" r="16" fill="none" stroke="#e7ecf5" strokeWidth="4" />
      <circle cx="20" cy="20" r="16" fill="none" strokeLinecap="round" strokeWidth="4"
        stroke={tone === "good" ? "var(--color-clean)" : value < 50 ? "var(--color-alert)" : "var(--color-amber)"}
        strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} />
    </svg>
  );
}

function ResultPanel({ result: r, doneAt, onDelete }: { result: CleanResult; doneAt: number; onDelete: () => void }) {
  const [showAll, setShowAll] = useState(false);
  const left = useCountdown(doneAt, r.expires_in);
  const found = r.before.field_count;
  const expired = left <= 0;

  return (
    <div className="border-t border-line">
      <div className="grid gap-px bg-line md:grid-cols-[1.1fr_1fr]">
        <section className="bg-white p-5" aria-label="Image analysis">
          <h3 className="text-base font-bold text-ink">{found ? "Image analysis complete" : "No hidden metadata found"}</h3>
          {found ? (
            <>
              <p className="mt-1 text-sm text-muted">Found and removed:</p>
              <ul className="mt-3 space-y-2">
                {r.before.categories.map((c) => (
                  <li key={c.key} className="flex items-center gap-2.5 text-sm">
                    <span className={`grid size-5 place-items-center rounded-full bg-current/10 ${CATEGORY_TONE[c.key] ?? "text-signal"}`}>
                      <Check size={12} strokeWidth={3} aria-hidden />
                    </span>
                    <span className="text-ink-2">{c.label}</span>
                    <span className="ml-auto font-mono text-xs text-muted">{c.count}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="mt-2 text-sm leading-6 text-muted">This file was already clean. You can still download it; it&apos;s byte-for-byte safe to share.</p>
          )}
        </section>

        <section className="grid grid-cols-2 gap-px bg-line" aria-label="Before and after">
          <Stat label="Metadata fields" before={String(found)} after={String(r.after.field_count)} good={r.after.field_count === 0} />
          <div className="bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-muted">Privacy score</p>
            <div className="mt-2 flex items-center gap-2">
              <ScoreRing value={r.before.privacy_score} tone="bad" />
              <span className="text-muted" aria-hidden>→</span>
              <ScoreRing value={r.after.privacy_score} tone="good" />
            </div>
            <p className="mt-1.5 text-sm"><span className="text-muted">{r.before.privacy_score}%</span> <span className="sr-only">to</span> <b className="text-clean">{r.after.privacy_score}%</b></p>
          </div>
          <Stat label="File size" before={formatBytes(r.original_size)} after={formatBytes(r.cleaned_size)} good />
          <div className="bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-muted">Image quality</p>
            <p className="mt-2 flex items-center gap-1.5 font-bold text-clean"><ShieldCheck size={18} className="shrink-0" aria-hidden /> {r.pixels_identical ? "Pixel-identical" : "Changed"}</p>
            <p className="mt-1 text-sm text-muted">{r.before.width}×{r.before.height}, no re-encoding</p>
          </div>
        </section>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-line p-4">
        {expired ? (
          <p className="text-sm text-muted">This download expired and the file was deleted. Add the image again to get a new link.</p>
        ) : (
          <>
            <a href={r.download_url} download={r.file_name} className="btn btn-primary"><Download size={17} aria-hidden /> Download clean image</a>
            <button type="button" onClick={onDelete} className="btn btn-ghost"><Trash2 size={16} aria-hidden /> Delete now</button>
            <span className="ml-auto font-mono text-xs text-muted">Auto-deletes in {Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}</span>
          </>
        )}
      </div>

      {found > 0 && (
        <div className="border-t border-line">
          <button type="button" onClick={() => setShowAll((v) => !v)} aria-expanded={showAll}
            className="flex w-full items-center justify-between px-4 py-3.5 text-sm font-bold text-ink-2 transition-colors hover:bg-paper hover:text-ink">
            {showAll ? "Hide" : "Show"} all {found} fields that were removed
            <ChevronDown size={16} className={`transition-transform ${showAll ? "rotate-180" : ""}`} aria-hidden />
          </button>
          <AnimatePresence initial={false}>
            {showAll && (
              <m.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                <div className="max-h-80 overflow-auto border-t border-line">
                  <table className="w-full text-left text-sm">
                    <thead className="sticky top-0 bg-paper text-xs uppercase tracking-wide text-muted">
                      <tr><th className="px-4 py-2.5 font-bold">Block</th><th className="px-4 py-2.5 font-bold">Field</th><th className="px-4 py-2.5 font-bold">Value</th></tr>
                    </thead>
                    <tbody>
                      {r.before.fields.map((f, i) => (
                        <tr key={i} className="border-t border-line/70 align-top even:bg-paper/50">
                          <td className="whitespace-nowrap px-4 py-2.5 text-muted">{f.group}</td>
                          <td className="px-4 py-2.5 font-mono text-xs text-ink">{f.name}</td>
                          <td className="max-w-[18rem] break-words px-4 py-2.5 text-ink-2">{f.value || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </m.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {r.after.preserved.length > 0 && (
        <p className="border-t border-line bg-paper px-4 py-3 text-xs leading-5 text-muted">
          Kept so your image displays correctly: {r.after.preserved.join(" and ").replace("Orientation", "orientation flag")}. Neither contains personal information.
        </p>
      )}
    </div>
  );
}

function Stat({ label, before, after, good }: { label: string; before: string; after: string; good?: boolean }) {
  return (
    <div className="bg-white p-5">
      <p className="text-xs font-bold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-2 text-sm text-muted line-through decoration-muted/40">{before}</p>
      <p className={`t-sub ${good ? "text-clean" : "text-ink"}`}>{after}</p>
    </div>
  );
}

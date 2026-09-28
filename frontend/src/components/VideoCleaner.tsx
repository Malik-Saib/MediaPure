"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import {
  AlertTriangle, Check, ChevronDown, Clock, Download, FileVideo, Gauge, Loader2, MonitorPlay,
  ShieldCheck, Trash2, Upload, Volume2, X,
} from "lucide-react";
import { ApiError, formatBytes } from "@/lib/api";
import {
  deleteVideoJob, formatBitrate, formatDuration, uploadVideo, videoStatus, waitForVideoJob,
  type VideoJob, type VideoStatus,
} from "@/lib/videoApi";
import { site } from "@/lib/site";

const ACCEPT_EXT = /\.(mp4|m4v|mov|webm|mkv|avi)$/i;
const ACCEPT_ATTR = ".mp4,.m4v,.mov,.webm,.mkv,.avi,video/mp4,video/quicktime,video/x-m4v,video/webm,video/x-matroska,video/x-msvideo";

/** The five things a person actually waits through, in order. */
const STEPS = ["Upload", "Analyze", "Clean", "Verify", "Complete"] as const;

const STEP_NOTE: Record<string, string> = {
  uploading: "Uploading securely…",
  queued: "Waiting for a free worker…",
  analyzing: "Analyzing video and checking metadata…",
  cleaning: "Removing hidden information…",
  verifying: "Preparing clean file and checking every frame…",
  done: "Your clean video is ready",
};

const CATEGORY_TONE: Record<string, string> = {
  location: "text-alert",
  creator: "text-alert",
  device: "text-amber",
  ai: "text-amber",
  credentials: "text-amber",
};

type Local = { duration: number; width: number; height: number; poster: string | null };
type Stage = "idle" | "uploading" | "working" | "done" | "error";

/** Which of the five steps is lit, given where we are. */
function stepIndex(stage: Stage, job: VideoJob | null): number {
  if (stage === "uploading") return 0;
  switch (job?.state) {
    case "queued":
      return 0;
    case "analyzing":
      return 1;
    case "cleaning":
      return 2;
    case "verifying":
      return 3;
    case "done":
      return 4;
    default:
      return stage === "done" ? 4 : 1;
  }
}

/**
 * Reads duration and dimensions straight from the file and grabs a poster frame, so the
 * page can describe the video before a single byte has been uploaded. Everything here
 * happens in the browser; failures are silent because a preview is a nicety, not the job.
 */
async function readLocally(file: File, objectUrl: string): Promise<Local> {
  const video = document.createElement("video");
  video.preload = "metadata";
  video.muted = true;
  video.playsInline = true;
  video.src = objectUrl;

  const meta = await new Promise<Local>((resolve) => {
    const done = (l: Local) => resolve(l);
    const timer = setTimeout(() => done({ duration: 0, width: 0, height: 0, poster: null }), 8000);
    video.onloadedmetadata = () => {
      clearTimeout(timer);
      done({
        duration: Number.isFinite(video.duration) ? video.duration : 0,
        width: video.videoWidth,
        height: video.videoHeight,
        poster: null,
      });
    };
    video.onerror = () => {
      clearTimeout(timer);
      done({ duration: 0, width: 0, height: 0, poster: null });
    };
  });

  if (!meta.width) return meta;
  try {
    const poster = await new Promise<string | null>((resolve) => {
      const timer = setTimeout(() => resolve(null), 8000);
      video.onseeked = () => {
        clearTimeout(timer);
        try {
          const scale = Math.min(1, 480 / Math.max(meta.width, meta.height));
          const canvas = document.createElement("canvas");
          canvas.width = Math.round(meta.width * scale);
          canvas.height = Math.round(meta.height * scale);
          const ctx = canvas.getContext("2d");
          if (!ctx) return resolve(null);
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", 0.7));
        } catch {
          resolve(null);
        }
      };
      video.currentTime = Math.min(1, (meta.duration || 1) / 3);
    });
    return { ...meta, poster };
  } catch {
    return meta;
  }
}

export function VideoCleaner({ variant = "full" }: { variant?: "hero" | "full" }) {
  const [file, setFile] = useState<File | null>(null);
  const [local, setLocal] = useState<Local | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [uploadPct, setUploadPct] = useState(0);
  const [job, setJob] = useState<VideoJob | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [status, setStatus] = useState<VideoStatus | null>(null);
  const [dragging, setDragging] = useState(false);

  const inputId = useId();
  const abort = useRef<AbortController | null>(null);
  const urlRef = useRef<string | null>(null);
  urlRef.current = objectUrl;

  useEffect(() => {
    videoStatus().then(setStatus).catch(() => setStatus(null));
  }, []);

  useEffect(() => () => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    abort.current?.abort();
  }, []);

  const maxMb = status?.max_file_mb ?? site.maxVideoMb;

  const reset = useCallback((keepNotice = false) => {
    abort.current?.abort();
    abort.current = null;
    if (job?.job_id) deleteVideoJob(job.job_id);
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    setObjectUrl(null);
    setFile(null);
    setLocal(null);
    setJob(null);
    setStage("idle");
    setUploadPct(0);
    if (!keepNotice) setNotice(null);
  }, [job, objectUrl]);

  const start = useCallback(async (picked: File) => {
    if (!(picked.type.startsWith("video/") || ACCEPT_EXT.test(picked.name))) {
      setNotice(`${picked.name} is not a supported video. Use MP4, MOV, WebM, MKV or AVI.`);
      return;
    }
    if (picked.size > maxMb * 1024 * 1024) {
      setNotice(`${picked.name} is larger than ${maxMb} MB.`);
      return;
    }
    if (!picked.size) {
      setNotice(`${picked.name} is empty.`);
      return;
    }

    if (objectUrl) URL.revokeObjectURL(objectUrl);
    const url = URL.createObjectURL(picked);
    const controller = new AbortController();
    abort.current = controller;

    setNotice(null);
    setFile(picked);
    setObjectUrl(url);
    setLocal(null);
    setJob(null);
    setUploadPct(0);
    setStage("uploading");

    readLocally(picked, url).then((l) => !controller.signal.aborted && setLocal(l));

    try {
      const created = await uploadVideo(picked, setUploadPct, controller.signal);
      if (controller.signal.aborted) return;
      setJob(created);
      setStage("working");
      const finished = await waitForVideoJob(created.job_id, setJob, controller.signal);
      if (controller.signal.aborted) return;
      if (finished.state === "done") {
        setStage("done");
      } else {
        setStage("error");
        setNotice(finished.error ?? "Cleaning did not finish. Try again.");
      }
    } catch (e) {
      if (controller.signal.aborted || (e instanceof ApiError && e.status === -1)) return;
      setStage("error");
      setNotice(e instanceof ApiError ? e.message : "Processing failed. Try again.");
    }
  }, [maxMb, objectUrl]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const picked = e.dataTransfer.files?.[0];
    if (picked) start(picked);
  };

  const busy = stage === "uploading" || stage === "working";
  const idle = stage === "idle" || !file;

  if (status && !status.available) {
    return (
      <div className="card card-pad text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-amber/10 text-amber-ink">
          <AlertTriangle size={26} aria-hidden />
        </span>
        <h2 className="t-card mt-5">Video cleaning is briefly unavailable</h2>
        <p className="mx-auto mt-2.5 max-w-md leading-7 text-muted">
          The video engine on this server isn&apos;t responding. Image cleaning is unaffected — you can
          still <a className="link" href="/image-metadata-cleaner">clean an image</a> right now.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {idle ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false); }}
          onDrop={onDrop}
          className={`rounded-[var(--radius-card)] border-2 border-dashed transition-[background-color,border-color,box-shadow] duration-200 ${dragging ? "border-signal bg-signal/[0.05] shadow-[0_0_0_4px_#1463ff14]" : "border-line-strong bg-white hover:border-[#a9bfe6] hover:bg-paper/60"} ${variant === "hero" ? "p-8 md:p-10" : "p-10 md:p-14"}`}
        >
          <input id={inputId} type="file" className="sr-only" accept={ACCEPT_ATTR}
            onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) start(f); }} />
          <div className="flex flex-col items-center text-center">
            <span className={`grid size-16 place-items-center rounded-2xl transition-colors duration-200 ${dragging ? "bg-signal text-white" : "bg-signal/10 text-signal"}`}><Upload size={28} aria-hidden /></span>
            <p className="t-card mt-5 text-ink">Drop a video to clean it</p>
            <p className="mt-2 text-muted">One video at a time, so it gets the whole machine</p>
            <label htmlFor={inputId} className="btn btn-lg btn-primary mt-6 cursor-pointer">Choose a video</label>
            <p className="mt-6 text-sm text-muted">MP4, MOV, WebM, MKV or AVI · up to {maxMb} MB</p>
            <p className="mt-1.5 text-sm text-muted">No re-encoding, so quality is untouched</p>
          </div>
        </div>
      ) : (
        <article className="card overflow-hidden shadow-soft">
          <FileHeader file={file!} local={local} job={job} onRemove={() => reset()} busy={busy} />
          {busy && <Steps stage={stage} job={job} uploadPct={uploadPct} />}
          {stage === "done" && job && <Result job={job} onDelete={() => reset()} />}
          {stage === "error" && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-alert/[0.05] px-4 py-3">
              <p className="flex items-center gap-2 text-sm font-medium text-alert-ink">
                <AlertTriangle size={16} className="shrink-0 text-alert" aria-hidden /> {notice ?? "Cleaning failed."}
              </p>
              <button type="button" onClick={() => file && start(file)} className="btn btn-sm btn-ghost">Try again</button>
            </div>
          )}
        </article>
      )}

      <div aria-live="polite" className="sr-only">
        {stage === "done" ? "Your clean video is ready to download"
          : busy ? STEP_NOTE[job?.state ?? "uploading"] ?? "Working" : ""}
      </div>

      {notice && stage !== "error" && (
        <div role="alert" className="mt-4 flex items-start gap-2.5 rounded-xl border border-alert/25 bg-alert/[0.06] px-4 py-3 text-sm font-medium text-alert-ink">
          <AlertTriangle size={18} className="mt-px shrink-0 text-alert" aria-hidden />
          <span className="flex-1">{notice}</span>
          <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss notice"
            className="-m-1 shrink-0 rounded p-1 text-alert/70 transition-colors hover:text-alert-ink"><X size={16} /></button>
        </div>
      )}

      {!idle && stage === "done" && (
        <div className="mt-4 text-center">
          <button type="button" onClick={() => reset()} className="btn btn-sm btn-quiet text-signal hover:text-signal-deep">
            Clean another video
          </button>
        </div>
      )}
    </div>
  );
}

function FileHeader({ file, local, job, onRemove, busy }: {
  file: File; local: Local | null; job: VideoJob | null; onRemove: () => void; busy: boolean;
}) {
  const tech = job?.technical;
  const width = tech?.width || local?.width || 0;
  const height = tech?.height || local?.height || 0;
  const duration = tech?.duration || local?.duration || 0;
  const format = job?.label ?? (file.name.split(".").pop() ?? "").toUpperCase();

  return (
    <div className="flex items-center gap-4 p-4">
      <div className="relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl border border-line bg-paper">
        {local?.poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={local.poster} alt="" className="size-full object-cover" />
        ) : (
          <FileVideo size={22} className="text-muted" aria-hidden />
        )}
        {duration > 0 && (
          <span className="absolute bottom-1 right-1 rounded bg-ink/85 px-1.5 py-px font-mono text-xs font-semibold text-white">
            {formatDuration(duration)}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-ink" title={file.name}>{file.name}</p>
        <p className="mt-0.5 text-sm text-muted">
          {formatBytes(file.size)}
          {width > 0 && ` · ${width}×${height}`}
          {format && ` · ${format}`}
          {tech?.fps ? ` · ${Math.round(tech.fps)} fps` : ""}
        </p>
      </div>
      {job?.state === "done" && (
        <span className="hidden items-center gap-1.5 rounded-full bg-clean/10 px-3 py-1 text-sm font-semibold text-clean sm:inline-flex">
          <ShieldCheck size={15} aria-hidden /> Clean
        </span>
      )}
      <button type="button" onClick={onRemove} aria-label={busy ? "Cancel and remove this video" : `Remove ${file.name}`}
        className="grid size-9 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-paper hover:text-ink">
        <X size={18} />
      </button>
    </div>
  );
}

function Steps({ stage, job, uploadPct }: { stage: Stage; job: VideoJob | null; uploadPct: number }) {
  const current = stepIndex(stage, job);
  const key = stage === "uploading" ? "uploading" : job?.state ?? "queued";
  // Upload owns the first fifth of the bar; the server phases share the rest.
  const pct = stage === "uploading" ? uploadPct * 20 : 20 + Math.max(0, current) * 20;

  return (
    <div className="border-t border-line px-4 py-4">
      <ol className="flex items-center justify-between gap-1 text-xs font-bold">
        {STEPS.map((label, i) => {
          const state = i < current ? "done" : i === current ? "now" : "todo";
          return (
            <li key={label} className={`flex items-center gap-1.5 ${state === "todo" ? "text-muted/60" : state === "now" ? "text-signal" : "text-ink-2"}`}>
              {state === "done" ? <Check size={14} aria-hidden />
                : state === "now" ? <Loader2 size={14} className="animate-spin" aria-hidden />
                  : <span className="size-1.5 rounded-full bg-current" aria-hidden />}
              <span className={i === current ? "" : "hidden sm:inline"}>{label}</span>
            </li>
          );
        })}
      </ol>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-paper ring-1 ring-line/70 ring-inset" role="progressbar"
        aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label="Cleaning progress">
        <m.div className="h-full rounded-full bg-gradient-to-r from-signal to-cyan"
          animate={{ width: `${pct}%` }} transition={{ ease: "easeOut", duration: 0.4 }} />
      </div>
      <p className="mt-2.5 text-xs font-medium text-muted">
        {stage === "uploading"
          ? `${STEP_NOTE.uploading} ${Math.round(uploadPct * 100)}%`
          : STEP_NOTE[key] ?? "Working…"}
      </p>
    </div>
  );
}

function useCountdown(from: number, seconds: number) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    const tick = () => setLeft(Math.max(0, seconds - Math.floor((Date.now() - from) / 1000)));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [from, seconds]);
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

function Result({ job, onDelete }: { job: VideoJob; onDelete: () => void }) {
  const [showAll, setShowAll] = useState(false);
  const [doneAt] = useState(() => Date.now());
  const left = useCountdown(doneAt, job.expires_in ?? 600);
  const expired = left <= 0;
  const before = job.before!;
  const after = job.after!;
  const tech = job.technical!;
  const found = before.field_count;

  return (
    <div className="border-t border-line">
      <div className="flex items-center gap-2.5 border-b border-line bg-clean/[0.07] px-5 py-3.5">
        <ShieldCheck size={18} className="shrink-0 text-clean" aria-hidden />
        <p className="text-base font-bold text-ink">Your clean video is ready</p>
        <span className="ml-auto hidden font-mono text-xs text-muted sm:inline">{job.duration_ms} ms</span>
      </div>

      <div className="grid gap-px bg-line md:grid-cols-[1.1fr_1fr]">
        <section className="bg-white p-5" aria-label="Video analysis">
          <h3 className="text-base font-bold text-ink">{found ? "Video analysis complete" : "No hidden metadata found"}</h3>
          {found ? (
            <>
              <p className="mt-1 text-sm text-muted">Found and removed:</p>
              <ul className="mt-3 space-y-2">
                {before.categories.map((c) => (
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
            <p className="mt-2 text-sm leading-6 text-muted">
              This file carried no readable metadata. You can still download it; it&apos;s safe to share as it is.
            </p>
          )}
          {before.blocks.length > 0 && (
            <p className="mt-4 text-xs leading-5 text-muted">Blocks read: {before.blocks.join(", ")}.</p>
          )}
        </section>

        <section className="grid grid-cols-2 gap-px bg-line" aria-label="Before and after">
          <Stat label="Metadata fields" before={String(found)} after={String(after.field_count)} good={after.field_count === 0} />
          <div className="bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-muted">Privacy score</p>
            <div className="mt-2 flex items-center gap-2">
              <ScoreRing value={before.privacy_score} tone="bad" />
              <span className="text-muted" aria-hidden>→</span>
              <ScoreRing value={after.privacy_score} tone="good" />
            </div>
            <p className="mt-1.5 text-sm">
              <span className="text-muted">{before.privacy_score}%</span>{" "}
              <span className="sr-only">to</span>
              <b className="text-clean">{after.privacy_score}%</b>
            </p>
          </div>
          <Stat label="File size" before={formatBytes(job.original_size ?? 0)} after={formatBytes(job.cleaned_size ?? 0)} good />
          <div className="bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-muted">Video quality</p>
            <p className="mt-2 flex items-center gap-1.5 font-bold text-clean">
              <ShieldCheck size={18} className="shrink-0" aria-hidden /> {job.re_encoded ? "Re-encoded" : "Frame-identical"}
            </p>
            <p className="mt-1 text-sm text-muted">{tech.width}×{tech.height}, no re-encoding</p>
          </div>
        </section>
      </div>

      <dl className="grid grid-cols-2 gap-px border-t border-line bg-line sm:grid-cols-4">
        <Spec icon={MonitorPlay} label="Resolution" value={`${tech.width}×${tech.height}`}
          note={tech.video_codec.toUpperCase()} />
        <Spec icon={Clock} label="Duration" value={formatDuration(tech.duration)}
          note={tech.frames ? `${tech.frames.toLocaleString()} frames` : `${Math.round(tech.fps)} fps`} />
        <Spec icon={Gauge} label="Bitrate" value={formatBitrate(tech.bit_rate || tech.video_bit_rate)}
          note={`${Math.round(tech.fps)} fps`} />
        <Spec icon={Volume2} label="Audio" value={tech.has_audio ? tech.audio_codec.toUpperCase() : "None"}
          note={tech.has_audio ? `${tech.audio_channels}ch · ${Math.round(tech.audio_sample_rate / 1000)} kHz` : "Silent video"} />
      </dl>

      <div className="flex flex-wrap items-center gap-2 border-t border-line p-4">
        {expired ? (
          <p className="text-sm text-muted">This download expired and the file was deleted. Add the video again to get a new link.</p>
        ) : (
          <>
            <a href={job.download_url} download={job.file_name} className="btn btn-primary">
              <Download size={17} aria-hidden /> Download clean video
            </a>
            <button type="button" onClick={onDelete} className="btn btn-ghost"><Trash2 size={16} aria-hidden /> Delete now</button>
            <span className="ml-auto font-mono text-xs text-muted">
              Auto-deletes in {Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}
            </span>
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
              <m.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                transition={{ duration: 0.2 }} className="overflow-hidden">
                <div className="max-h-80 overflow-auto border-t border-line">
                  <table className="w-full text-left text-sm">
                    <thead className="sticky top-0 bg-paper text-xs uppercase tracking-wide text-muted">
                      <tr>
                        <th className="px-4 py-2.5 font-bold">Where</th>
                        <th className="px-4 py-2.5 font-bold">Field</th>
                        <th className="px-4 py-2.5 font-bold">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {before.fields.map((f, i) => (
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

      <p className="border-t border-line bg-paper px-4 py-3 text-xs leading-5 text-muted">
        Method: {job.method}. The compressed video and audio were copied across without being decoded, then
        checksummed against your original to confirm every frame survived intact
        {job.rotation_kept ? `, and the ${job.rotation_kept}° rotation flag was kept so the clip plays the right way up` : ""}.
      </p>
    </div>
  );
}

function Spec({ icon: Icon, label, value, note }: {
  icon: typeof Clock; label: string; value: string; note: string;
}) {
  return (
    <div className="bg-white p-4">
      <dt className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted">
        <Icon size={14} className="shrink-0" aria-hidden /> {label}
      </dt>
      <dd>
        <p className="mt-1 font-bold text-ink">{value}</p>
        <p className="text-xs text-muted">{note}</p>
      </dd>
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

import { ApiError, type Report } from "./api";

export type VideoTechnical = {
  duration: number;
  bit_rate: number;
  width: number;
  height: number;
  fps: number;
  video_codec: string;
  video_profile: string;
  pix_fmt: string;
  video_bit_rate: number;
  frames: number;
  rotation: number;
  has_audio: boolean;
  audio_codec: string;
  audio_channels: number;
  audio_sample_rate: number;
  audio_bit_rate: number;
  stream_count: number;
  subtitle_streams: number;
};

/** The pipeline states the API reports, in the order they happen. */
export type VideoPhase = "queued" | "analyzing" | "cleaning" | "verifying" | "done" | "error" | "cancelled";

export type VideoJob = {
  job_id: string;
  kind: "video";
  state: VideoPhase;
  phase: VideoPhase;
  progress: number;
  file_name: string;
  file_size: number;
  elapsed_ms: number;
  poll_after_ms: number;
  error?: string;
  /* present once state === "done" */
  token?: string;
  download_url?: string;
  expires_in?: number;
  container?: string;
  label?: string;
  mime?: string;
  method?: string;
  deep_scrub?: boolean;
  scrub_stats?: Record<string, number>;
  original_size?: number;
  cleaned_size?: number;
  streams_identical?: boolean;
  re_encoded?: boolean;
  rotation_kept?: number | null;
  duration_ms?: number;
  technical?: VideoTechnical;
  technical_after?: VideoTechnical;
  before?: Report;
  after?: Report;
};

export type VideoStatus = {
  available: boolean;
  max_file_mb: number;
  max_seconds: number;
  formats: { key: string; label: string; ext: string; mime: string }[];
  accepting: boolean;
};

const UNREACHABLE =
  "The cleaning service isn't responding. It may be offline or still starting up — try again in a moment.";

function messageFor(status: number, body: unknown): string {
  const detail =
    typeof body === "object" && body !== null && typeof (body as { detail?: unknown }).detail === "string"
      ? (body as { detail: string }).detail
      : null;
  if (detail) return detail;
  if (status === 413) return "This video is too large.";
  if (status === 429) return "Too many requests. Wait a minute and try again.";
  if (status === 0) return "Connection lost. Check your internet and try again.";
  if (status >= 500 || status === 404) return UNREACHABLE;
  return "Something went wrong while processing this video. Try again.";
}

export async function videoStatus(): Promise<VideoStatus> {
  const res = await fetch("/api/v1/video/status");
  if (!res.ok) throw new ApiError(messageFor(res.status, null), res.status);
  return res.json();
}

/**
 * Upload a video and get back a job to poll. The body is the raw file — no multipart,
 * no base64 — so a 500 MB upload streams straight through without being copied.
 */
export function uploadVideo(
  file: File,
  onProgress: (fraction: number) => void,
  signal?: AbortSignal,
): Promise<VideoJob> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/v1/video/jobs");
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    xhr.setRequestHeader("X-File-Name", encodeURIComponent(file.name));
    xhr.responseType = "json";
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300 && xhr.response && typeof xhr.response === "object") {
        return resolve(xhr.response as VideoJob);
      }
      // Note: xhr.responseText must not be read here — it throws when responseType is "json".
      console.error(`[video] ${file.name} (${file.type || "unknown type"}, ${file.size} bytes) -> HTTP ${xhr.status}`,
        xhr.response ?? "(no JSON body)");
      reject(new ApiError(messageFor(xhr.status, xhr.response), xhr.status));
    };
    xhr.onerror = () => reject(new ApiError("Connection lost. Check your internet and try again.", 0));
    signal?.addEventListener("abort", () => {
      xhr.abort();
      reject(new ApiError("Cancelled", -1));
    });
    xhr.send(file);
  });
}

export async function readVideoJob(jobId: string): Promise<VideoJob> {
  const res = await fetch(`/api/v1/video/jobs/${jobId}`);
  if (!res.ok) {
    let body: unknown = null;
    try {
      body = await res.json();
    } catch {
      /* not json: handled by messageFor */
    }
    throw new ApiError(messageFor(res.status, body), res.status);
  }
  return res.json();
}

export async function deleteVideoJob(jobId: string) {
  await fetch(`/api/v1/video/jobs/${jobId}`, { method: "DELETE" }).catch(() => undefined);
}

/**
 * Poll until the job reaches a terminal state.
 *
 * The API suggests its own interval; this backs off gently on top of it so a long clip
 * does not generate hundreds of requests, and it stops the moment the caller aborts.
 */
export async function waitForVideoJob(
  jobId: string,
  onUpdate: (job: VideoJob) => void,
  signal?: AbortSignal,
): Promise<VideoJob> {
  let wait = 600;
  for (;;) {
    if (signal?.aborted) throw new ApiError("Cancelled", -1);
    const job = await readVideoJob(jobId);
    onUpdate(job);
    if (job.state === "done" || job.state === "error" || job.state === "cancelled") return job;
    await new Promise((r) => setTimeout(r, Math.max(job.poll_after_ms || 0, wait)));
    wait = Math.min(wait * 1.25, 3000);
  }
}

export const formatDuration = (seconds: number) => {
  if (!seconds || !Number.isFinite(seconds)) return "—";
  const s = Math.round(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const rest = s % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h ? `${h}:${pad(m)}:${pad(rest)}` : `${m}:${pad(rest)}`;
};

export const formatBitrate = (bits: number) => {
  if (!bits) return "—";
  if (bits < 1_000_000) return `${Math.round(bits / 1000)} kbps`;
  return `${(bits / 1_000_000).toFixed(1)} Mbps`;
};

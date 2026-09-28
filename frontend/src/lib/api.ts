export type Category = { key: string; label: string; count: number };
export type MetaField = { group: string; name: string; value: string; category: string };
export type Report = {
  format: string;
  width: number;
  height: number;
  mode: string;
  frames: number;
  field_count: number;
  privacy_score: number;
  categories: Category[];
  fields: MetaField[];
  preserved: string[];
  blocks: string[];
};
export type CleanResult = {
  token: string;
  file_name: string;
  download_url: string;
  expires_in: number;
  format: string;
  mime: string;
  original_size: number;
  cleaned_size: number;
  pixels_identical: boolean;
  orientation_kept: number | null;
  duration_ms: number;
  before: Report;
  after: Report;
};

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/* The API describes every real failure in a JSON `detail`. A 5xx (or a 404 on an API
   route) carrying no JSON body therefore did not come from the API at all — it came from
   the proxy in front of it, which means the API is unreachable. That is a different
   problem from an image we could not process, so it gets its own message: reporting
   "Processing failed" for an API that is simply not running sends people looking for a
   bug in the cleaning pipeline. */
const UNREACHABLE =
  "The cleaning service isn't responding. It may be offline or still starting up — try again in a moment.";

function messageFor(status: number, body: unknown): string {
  const detail =
    typeof body === "object" && body !== null && typeof (body as { detail?: unknown }).detail === "string"
      ? (body as { detail: string }).detail
      : null;
  if (detail) return detail;
  if (status === 413) return "This file is too large.";
  if (status === 429) return "Too many requests. Wait a minute and try again.";
  if (status === 0) return "Connection lost. Check your internet and try again.";
  if (status >= 500 || status === 404) return UNREACHABLE;
  return "Something went wrong while processing this image. Try again.";
}

async function detail(res: Response): Promise<string> {
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    /* not json: handled by messageFor */
  }
  return messageFor(res.status, body);
}

/** Upload with progress via XHR (fetch has no upload progress). Body is the raw file: no multipart, no disk spooling. */
export function cleanImage(file: File, onProgress: (fraction: number) => void, signal?: AbortSignal): Promise<CleanResult> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/v1/clean");
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    xhr.setRequestHeader("X-File-Name", encodeURIComponent(file.name));
    xhr.responseType = "json";
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    xhr.onload = () => {
      // A 2xx with no parsable JSON body is not a usable result either.
      if (xhr.status >= 200 && xhr.status < 300 && xhr.response && typeof xhr.response === "object") {
        return resolve(xhr.response as CleanResult);
      }
      const msg = messageFor(xhr.status, xhr.response);
      // Note: xhr.responseText must not be read here — it throws when responseType is "json".
      console.error(`[clean] ${file.name} (${file.type || "unknown type"}, ${file.size} bytes) -> HTTP ${xhr.status}`,
        xhr.response ?? "(no JSON body)");
      reject(new ApiError(msg, xhr.status));
    };
    xhr.onerror = () => reject(new ApiError("Connection lost. Check your internet and try again.", 0));
    signal?.addEventListener("abort", () => {
      xhr.abort();
      reject(new ApiError("Cancelled", -1));
    });
    xhr.send(file);
  });
}

export async function deleteFile(token: string) {
  await fetch(`/api/v1/files/${token}`, { method: "DELETE" }).catch(() => undefined);
}

export async function downloadZip(tokens: string[]): Promise<Blob> {
  const res = await fetch("/api/v1/files/zip", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tokens }),
  });
  if (!res.ok) throw new ApiError(await detail(res), res.status);
  return res.blob();
}

export async function sendContact(body: Record<string, string>) {
  const res = await fetch("/api/v1/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new ApiError(await detail(res), res.status);
}

export async function adminFetch<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api/v1/admin${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(init?.headers ?? {}) },
  });
  if (!res.ok) throw new ApiError(await detail(res), res.status);
  return res.status === 204 ? (undefined as T) : res.json();
}

export const formatBytes = (n: number) => {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(n < 10240 ? 1 : 0)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
};

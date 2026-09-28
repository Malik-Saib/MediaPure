"use client";
import { useCallback, useEffect, useState } from "react";
import { Activity, CheckCheck, Database, HardDrive, Inbox, Loader2, LogOut, MailOpen, RefreshCw, Trash2, Users } from "lucide-react";
import { ApiError, adminFetch, formatBytes } from "@/lib/api";

type Overview = {
  totals: { jobs: number; cleaned: number; scanned: number; failed: number; unique_visitors: number; bytes_processed: number;
    fields_removed: number; avg_ms: number; with_location: number; with_ai_data: number; unread_messages: number };
  window: { days: number; jobs: number; visitors: number };
  daily: { date: string; jobs: number; visitors: number }[];
  formats: { format: string; count: number }[];
  media: { media: string; count: number; fields_removed: number; bytes: number }[];
  recent_errors: { at: string; status: string; error: string }[];
  storage: { files: number; bytes: number; ttl_seconds: number; staged_uploads?: number; staged_bytes?: number };
  engine: {
    exiftool: boolean;
    max_file_mb: number;
    video: boolean;
    ffmpeg: string;
    max_video_mb: number;
    video_queue: { tracked: number; pending: number; states: Record<string, number> };
  };
};
type Msg = { id: number; created_at: string; name: string; email: string; topic: string; message: string; is_read: boolean };

const KEY = "aimr-admin-token";

export function AdminApp() {
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => setToken(sessionStorage.getItem(KEY)), []);
  const signOut = () => { sessionStorage.removeItem(KEY); setToken(null); };
  return (
    <div className="min-h-[70vh] bg-paper">
      {token ? <Dashboard token={token} onExpired={signOut} /> : <Login onToken={(t) => { sessionStorage.setItem(KEY, t); setToken(t); }} />}
    </div>
  );
}

function Login({ onToken }: { onToken: (t: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const body = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const res = await fetch("/api/v1/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.detail ?? "Sign-in failed.");
      onToken(j.token);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="wrap flex justify-center py-20">
      <form onSubmit={submit} className="card w-full max-w-sm p-7 shadow-soft md:p-8">
        <h1 className="t-sub">Admin sign in</h1>
        <label className="mt-6 block text-sm font-bold text-ink-2">Username<input name="username" required autoComplete="username" className="field" /></label>
        <label className="mt-4 block text-sm font-bold text-ink-2">Password<input name="password" type="password" required autoComplete="current-password" className="field" /></label>
        {error && <p role="alert" className="mt-4 text-sm font-medium text-alert-ink">{error}</p>}
        <button className="btn btn-lg btn-primary mt-6 w-full" disabled={busy}>{busy && <Loader2 size={16} className="animate-spin" />} Sign in</button>
      </form>
    </div>
  );
}

function Dashboard({ token, onExpired }: { token: string; onExpired: () => void }) {
  const [data, setData] = useState<Overview | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [days, setDays] = useState(14);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [o, m] = await Promise.all([
        adminFetch<Overview>(`/overview?days=${days}`, token),
        adminFetch<Msg[]>("/messages", token),
      ]);
      setData(o);
      setMsgs(m);
      setError(null);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) return onExpired();
      setError(e instanceof Error ? e.message : "Could not load data.");
    } finally {
      setLoading(false);
    }
  }, [days, token, onExpired]);

  useEffect(() => { load(); }, [load]);

  const markRead = async (m: Msg) => {
    await adminFetch(`/messages/${m.id}`, token, { method: "PATCH", body: JSON.stringify({ is_read: !m.is_read }) });
    setMsgs((all) => all.map((x) => (x.id === m.id ? { ...x, is_read: !x.is_read } : x)));
  };
  const remove = async (m: Msg) => {
    if (!confirm(`Delete the message from ${m.name}?`)) return;
    await adminFetch(`/messages/${m.id}`, token, { method: "DELETE" });
    setMsgs((all) => all.filter((x) => x.id !== m.id));
  };

  const t = data?.totals;
  const max = Math.max(1, ...(data?.daily.map((d) => d.jobs) ?? [1]));
  const successRate = t && t.jobs ? Math.round(((t.jobs - t.failed) / t.jobs) * 100) : 100;

  return (
    <div className="wrap py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="t-section">Dashboard</h1>
        <div className="flex items-center gap-2">
          <select value={days} onChange={(e) => setDays(Number(e.target.value))} aria-label="Date range"
            className="h-9 rounded-[0.625rem] border border-line bg-white px-3 text-sm font-semibold text-ink-2">
            <option value={7}>Last 7 days</option><option value={14}>Last 14 days</option><option value={30}>Last 30 days</option><option value={90}>Last 90 days</option>
          </select>
          <button type="button" onClick={load} className="btn btn-sm btn-ghost" aria-label="Refresh">{loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}</button>
          <button type="button" onClick={onExpired} className="btn btn-sm btn-ghost"><LogOut size={16} /> Sign out</button>
        </div>
      </div>
      {error && <p role="alert" className="mt-4 rounded-xl border border-alert/25 bg-alert/[0.06] px-4 py-3 text-sm font-medium text-alert-ink">{error}</p>}

      {t && data && (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Kpi icon={Users} label="Unique visitors (all time)" value={t.unique_visitors.toLocaleString()} sub={`${data.window.visitors} in last ${days} days`} />
            <Kpi icon={Activity} label="Images cleaned" value={t.cleaned.toLocaleString()} sub={`${t.scanned} scans · ${successRate}% success`} />
            <Kpi icon={Database} label="Data processed" value={formatBytes(t.bytes_processed)} sub={`${t.fields_removed.toLocaleString()} fields removed`} />
            <Kpi icon={HardDrive} label="Temporary storage" value={formatBytes(data.storage.bytes)} sub={`${data.storage.files} files · expire after ${data.storage.ttl_seconds / 60} min`} />
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[2fr_1fr]">
            <section className="rounded-[var(--radius-card)] border border-line bg-white p-6">
              <h2 className="font-bold">Processing per day</h2>
              {data.daily.length === 0 ? <p className="mt-6 text-sm text-muted">No activity in this period yet.</p> : (
                <div className="mt-6 flex h-48 items-end gap-1.5" role="img" aria-label="Jobs per day chart">
                  {data.daily.map((d) => (
                    <div key={d.date} className="group relative flex flex-1 flex-col items-center justify-end">
                      <div className="w-full rounded-t-md bg-signal/80 transition-colors group-hover:bg-signal" style={{ height: `${(d.jobs / max) * 100}%`, minHeight: 3 }} />
                      <span className="pointer-events-none absolute -top-7 hidden whitespace-nowrap rounded bg-ink px-2 py-0.5 text-xs text-white group-hover:block">{d.date}: {d.jobs} jobs, {d.visitors} visitors</span>
                    </div>
                  ))}
                </div>
              )}
              <p className="mt-3 text-xs text-muted">Average processing time: {t.avg_ms} ms · {t.with_location} files had location data · {t.with_ai_data} had AI data or Content Credentials</p>
            </section>
            <section className="rounded-[var(--radius-card)] border border-line bg-white p-6">
              <h2 className="font-bold">Formats</h2>
              <ul className="mt-4 space-y-3">
                {data.formats.map((f) => {
                  const total = data.formats.reduce((n, x) => n + x.count, 0) || 1;
                  return (
                    <li key={f.format}>
                      <div className="flex justify-between text-sm"><span className="font-semibold uppercase">{f.format}</span><span className="text-muted">{f.count}</span></div>
                      <div className="mt-1 h-1.5 rounded-full bg-paper"><div className="h-full rounded-full bg-cyan" style={{ width: `${(f.count / total) * 100}%` }} /></div>
                    </li>
                  );
                })}
                {data.formats.length === 0 && <li className="text-sm text-muted">No files processed yet.</li>}
              </ul>
              <h2 className="mt-8 font-bold">Images vs video</h2>
              <ul className="mt-4 space-y-3">
                {(data.media ?? []).map((m) => {
                  const total = (data.media ?? []).reduce((n, x) => n + x.count, 0) || 1;
                  return (
                    <li key={m.media}>
                      <div className="flex justify-between text-sm">
                        <span className="font-semibold capitalize">{m.media}</span>
                        <span className="text-muted">{m.count} · {formatBytes(m.bytes)} · {m.fields_removed} fields</span>
                      </div>
                      <div className="mt-1 h-1.5 rounded-full bg-paper">
                        <div className={`h-full rounded-full ${m.media === "video" ? "bg-signal" : "bg-clean"}`}
                          style={{ width: `${(m.count / total) * 100}%` }} />
                      </div>
                    </li>
                  );
                })}
                {(data.media ?? []).length === 0 && <li className="text-sm text-muted">Nothing cleaned yet.</li>}
              </ul>

              <h2 className="mt-8 font-bold">Engine</h2>
              <p className="mt-2 text-sm text-muted">
                ExifTool: {data.engine.exiftool ? "installed" : "not installed (native reader only)"} · Max image {data.engine.max_file_mb} MB
              </p>
              <p className="mt-1 text-sm text-muted">
                Video: {data.engine.video
                  ? <>enabled · max {data.engine.max_video_mb} MB · {data.engine.video_queue.pending} in flight, {data.engine.video_queue.tracked} tracked</>
                  : <span className="font-semibold text-amber-ink">unavailable — FFmpeg not found (images unaffected)</span>}
              </p>
              {data.engine.ffmpeg && <p className="mt-1 break-words font-mono text-xs text-muted">{data.engine.ffmpeg}</p>}
              {data.recent_errors.length > 0 && (
                <>
                  <h2 className="mt-8 font-bold">Recent rejections</h2>
                  <ul className="mt-2 space-y-1.5 text-xs text-muted">
                    {data.recent_errors.map((e, i) => <li key={i}>{new Date(e.at).toLocaleString()} · {e.error || e.status}</li>)}
                  </ul>
                </>
              )}
            </section>
          </div>

          <section className="card mt-4">
            <div className="flex items-center justify-between border-b border-line p-6">
              <h2 className="flex items-center gap-2 font-bold"><Inbox size={18} /> Contact submissions</h2>
              <span className="text-sm text-muted">{t.unread_messages} unread</span>
            </div>
            {msgs.length === 0 ? <p className="p-6 text-sm text-muted">No messages yet.</p> : (
              <ul className="divide-y divide-line">
                {msgs.map((m) => (
                  <li key={m.id} className={`p-6 ${m.is_read ? "" : "bg-signal/[0.03]"}`}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{!m.is_read && <span className="mr-2 inline-block size-2 rounded-full bg-signal" aria-label="Unread" />}{m.name} <a className="link font-normal" href={`mailto:${m.email}`}>{m.email}</a></p>
                        <p className="text-xs text-muted">{m.topic} · {new Date(m.created_at).toLocaleString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => markRead(m)} className="btn btn-xs btn-ghost">{m.is_read ? <MailOpen size={14} /> : <CheckCheck size={14} />} {m.is_read ? "Mark unread" : "Mark read"}</button>
                        <button type="button" onClick={() => remove(m)} className="btn btn-xs btn-ghost text-alert-ink" aria-label="Delete message"><Trash2 size={14} /></button>
                      </div>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-ink-2">{m.message}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function Kpi({ icon: Icon, label, value, sub }: { icon: typeof Users; label: string; value: string; sub: string }) {
  return (
    <div className="card p-5">
      <p className="flex items-center gap-2 text-sm text-muted"><Icon size={16} className="shrink-0" aria-hidden /> {label}</p>
      <p className="t-section mt-2">{value}</p>
      <p className="mt-1 text-xs text-muted">{sub}</p>
    </div>
  );
}

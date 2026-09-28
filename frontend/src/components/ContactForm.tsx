"use client";
import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { sendContact } from "@/lib/api";

const TOPICS = ["General", "Support", "Business & API", "Privacy request", "Press", "Bug report"];

/** Formspree delivers the message to the address configured in the Formspree account.
 *  A form endpoint is public by design — it ships in the page either way — so there is
 *  no secret here. */
const FORMSPREE_ENDPOINT = "https://formspree.io/f/xjykjbga";

const GENERIC_ERROR = "Your message wasn't sent. Check your connection and try again.";

/** Formspree answers a rejected submission with `{ errors: [{ message }] }`. */
async function formspreeError(res: Response): Promise<string> {
  try {
    const body = await res.json();
    const messages = Array.isArray(body?.errors)
      ? body.errors.map((e: { message?: string }) => e.message).filter(Boolean)
      : [];
    if (messages.length) return messages.join(" ");
  } catch {
    // Not JSON; fall through to the generic message.
  }
  return GENERIC_ERROR;
}

export function ContactForm() {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fields = new FormData(e.currentTarget);
    const data = Object.fromEntries(fields) as Record<string, string>;
    setState("sending");

    // Keep archiving to our own API, which is what fills the admin inbox. Delivery is
    // Formspree's job now, so a failure here must not change what the visitor sees.
    void sendContact(data).catch(() => {});

    // `website` is our honeypot; Formspree spots its own under the name `_gotcha`.
    fields.delete("website");
    fields.set("_gotcha", data.website ?? "");
    fields.set("_subject", `MediaPure contact: ${data.topic || "General"} from ${data.name || "a visitor"}`);

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        body: fields,
        headers: { Accept: "application/json" },
      });
      if (!res.ok) {
        setError(await formspreeError(res));
        setState("idle");
        return;
      }
      setState("sent");
    } catch {
      setError(GENERIC_ERROR);
      setState("idle");
    }
  }

  if (state === "sent") {
    return (
      <div className="rounded-[var(--radius-card)] border border-clean/30 bg-clean/[0.06] p-7 md:p-8" role="status">
        <span className="grid size-12 place-items-center rounded-2xl bg-clean/10 text-clean"><CheckCircle2 size={26} aria-hidden /></span>
        <h2 className="t-card mt-4">Message sent</h2>
        <p className="mt-2 leading-7 text-ink-2">Thanks for writing. We reply within two working days, usually sooner.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate={false}>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-bold text-ink-2">Your name
          <input name="name" required minLength={2} maxLength={120} autoComplete="name" className="field" />
        </label>
        <label className="block text-sm font-bold text-ink-2">Email
          <input name="email" type="email" required maxLength={200} autoComplete="email" className="field" />
        </label>
      </div>
      <label className="block text-sm font-bold text-ink-2">Topic
        <select name="topic" className="field" defaultValue="General">
          {TOPICS.map((t) => <option key={t}>{t}</option>)}
        </select>
      </label>
      <label className="block text-sm font-bold text-ink-2">Message
        <textarea name="message" required minLength={10} maxLength={5000} rows={6} className="field" />
      </label>
      <div aria-hidden className="absolute -left-[9999px] h-0 overflow-hidden">
        <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>
      {error && <p role="alert" className="rounded-xl border border-alert/25 bg-alert/[0.06] px-4 py-3 text-sm font-medium text-alert-ink">{error}</p>}
      <button className="btn btn-lg btn-primary" disabled={state === "sending"}>
        {state === "sending" && <Loader2 size={17} className="animate-spin" aria-hidden />} Send message
      </button>
      <p className="text-xs text-muted">We use your details only to reply. Please don&apos;t attach or paste sensitive personal data.</p>
    </form>
  );
}

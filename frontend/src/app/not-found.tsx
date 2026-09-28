import Link from "next/link";

export default function NotFound() {
  return (
    <section className="pixel-field">
      <div className="wrap flex min-h-[60vh] flex-col items-start justify-center py-20">
        <p className="font-mono text-sm font-bold text-signal">404</p>
        <h1 className="t-display mt-4">This page doesn&apos;t exist</h1>
        <p className="t-lead mt-5 max-w-lg text-muted">The link may be old or mistyped. The cleaner is one click away.</p>
        <div className="mt-8 flex gap-3">
          <Link href="/image-metadata-cleaner" className="btn btn-primary">Clean an image</Link>
          <Link href="/" className="btn btn-ghost">Go to homepage</Link>
        </div>
      </div>
    </section>
  );
}

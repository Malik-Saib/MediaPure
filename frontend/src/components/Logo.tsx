import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";

/**
 * The MediaPure lockup. `tone="reversed"` swaps in the light-on-dark artwork used on the
 * ink-coloured sections, which keeps the wordmark legible instead of relying on opacity.
 */
export function Logo({
  className = "",
  priority = false,
  tone = "default",
}: {
  className?: string;
  priority?: boolean;
  tone?: "default" | "reversed";
}) {
  const reversed = tone === "reversed";
  return (
    <Link href="/" aria-label={`${site.name} home`} className={`inline-flex shrink-0 items-center ${className}`}>
      <Image
        src={reversed ? "/brand/mediapure-lockup-dark-192.webp" : "/brand/mediapure-lockup-192.webp"}
        alt={site.name}
        width={reversed ? 934 : 778}
        height={192}
        priority={priority}
        className="h-8 w-auto md:h-9"
        sizes="220px"
      />
    </Link>
  );
}

/** Square mark on its own, for tiles and compact spots where the wordmark would not fit. */
export function LogoMark({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <Image src="/brand/mediapure-icon-256.webp" alt="" aria-hidden width={size} height={size}
      className={className} sizes={`${size}px`} />
  );
}

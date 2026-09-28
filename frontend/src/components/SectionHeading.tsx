import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * The one section-header pattern used across the site: title (with an optional
 * eyebrow and description) on the left, a "view all" link on the right.
 *
 * On narrow screens the action drops below the text instead of squeezing the
 * heading, which keeps long titles readable on a phone.
 */
export function SectionHeading({
  title,
  eyebrow,
  description,
  action,
  as: Tag = "h2",
  align = "row",
  className = "",
}: {
  title: string;
  eyebrow?: string;
  description?: string;
  action?: { href: string; label: string };
  as?: "h2" | "h3";
  /** `row` puts the action beside the title on desktop; `stack` keeps it below. */
  align?: "row" | "stack";
  className?: string;
}) {
  const heading = (
    <div className="max-w-2xl">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <Tag className={`t-section text-ink ${eyebrow ? "mt-3" : ""}`}>{title}</Tag>
      {description && <p className="t-lead mt-4 text-muted">{description}</p>}
    </div>
  );

  if (!action) return <div className={className}>{heading}</div>;

  return (
    <div
      className={`flex flex-col gap-5 ${align === "row" ? "md:flex-row md:items-end md:justify-between md:gap-10" : ""} ${className}`}
    >
      {heading}
      <Link href={action.href} className="link-more shrink-0 md:pb-1.5">
        {action.label}
        <ArrowRight size={16} aria-hidden />
      </Link>
    </div>
  );
}

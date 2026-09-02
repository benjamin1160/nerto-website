import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

export function cx(...parts: Array<string | false | null | undefined | 0>) {
  return parts.filter((p): p is string => typeof p === "string" && p.length > 0).join(" ");
}

/* ------------------------------------------------------------------ *
 * Buttons
 * ------------------------------------------------------------------ */
/* `rounded-button` is a skin token, not a fixed shape — Hearthline makes it
   a full pill, the Direct skin squares it off to 0.75rem. See `lib/skin.ts`. */
const base =
  "group/btn relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-button text-[0.9rem] font-medium tracking-tight transition-all duration-300 disabled:pointer-events-none disabled:opacity-45";

export const buttonStyles = {
  primary: cx(
    base,
    /* The gradient is layered over the flat fill rather than replacing it, so
       a skin that names no gradient (`none`) keeps exactly the button it had. */
    "bg-[var(--btn-bg)] [background-image:var(--btn-gradient)] px-6 py-3 text-[var(--btn-fg)] hover:bg-[var(--btn-hover-bg)] hover:text-[var(--btn-hover-fg)] hover:[background-image:var(--btn-gradient-hover)] hover:shadow-[var(--button-shadow)] active:scale-[0.98]",
  ),
  outline: cx(
    base,
    "border border-line-strong px-6 py-3 text-ink hover:border-ink hover:bg-ink hover:text-paper active:scale-[0.98]",
  ),
  ghost: cx(base, "px-4 py-2 text-ink-soft hover:text-ember"),
  small: cx(
    base,
    "border border-line-strong px-4 py-2 text-[0.8rem] text-ink-soft hover:border-ink hover:text-ink",
  ),
};

export function ButtonLink({
  variant = "primary",
  className,
  children,
  ...props
}: ComponentProps<typeof Link> & { variant?: keyof typeof buttonStyles }) {
  return (
    <Link className={cx(buttonStyles[variant], className)} {...props}>
      {children}
    </Link>
  );
}

/* ------------------------------------------------------------------ *
 * Editorial furniture
 * ------------------------------------------------------------------ */
export function Eyebrow({
  index,
  children,
  className,
}: {
  index?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={cx("eyebrow flex items-center gap-3", className)}>
      {index && <span className="text-ember">{index}</span>}
      <span className="h-px w-6 bg-line-strong" aria-hidden />
      {children}
    </p>
  );
}

export function SectionHeading({
  index,
  eyebrow,
  title,
  lede,
  align = "left",
  action,
}: {
  index?: string;
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
  align?: "left" | "center";
  action?: ReactNode;
}) {
  return (
    <div
      className={cx(
        "flex flex-col gap-6",
        align === "center" && "items-center text-center",
        !!action && "md:flex-row md:items-end md:justify-between",
      )}
    >
      <div className={cx("max-w-2xl", align === "center" && "mx-auto")}>
        <Eyebrow index={index} className={align === "center" ? "justify-center" : undefined}>
          {eyebrow}
        </Eyebrow>
        <h2 className="mt-5 font-display text-headline text-balance text-ink">{title}</h2>
        {lede && <p className="mt-5 text-lg leading-relaxed text-muted text-pretty">{lede}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "ember" | "moss" | "muted";
  className?: string;
}) {
  const tones = {
    neutral: "border-line-strong bg-surface text-ink-soft",
    ember: "border-transparent bg-ember text-on-ember",
    moss: "border-transparent bg-moss text-paper dark:text-ink",
    muted: "border-line bg-surface-2 text-muted",
  };
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[0.65rem] uppercase tracking-[0.16em]",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Stat({
  value,
  label,
  sub,
}: {
  value: ReactNode;
  label: string;
  sub?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-display text-4xl leading-none tracking-tight text-ink sm:text-5xl">
        {value}
      </span>
      <span className="eyebrow">{label}</span>
      {sub && <span className="text-sm leading-snug text-muted">{sub}</span>}
    </div>
  );
}

export function SpecRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line py-3 last:border-b-0">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="text-right font-mono text-sm text-ink">{value}</dd>
    </div>
  );
}

export function Rule({ className }: { className?: string }) {
  return <div className={cx("hairline w-full", className)} aria-hidden />;
}

/* Section wrapper — consistent rhythm everywhere. */
export function Section({
  children,
  className,
  id,
  bleed = false,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  bleed?: boolean;
}) {
  return (
    <section id={id} className={cx("py-20 sm:py-28 lg:py-36", className)}>
      <div className={cx(!bleed && "mx-auto w-full max-w-[88rem] px-5 sm:px-8 lg:px-12")}>
        {children}
      </div>
    </section>
  );
}

export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("mx-auto w-full max-w-[80rem] px-4 sm:px-6 lg:px-8", className)}>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Icons — hand-rolled so the template ships no icon dependency.
 * ------------------------------------------------------------------ */
type IconProps = { className?: string };

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const Icon = {
  House: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.8V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.8" />
    </svg>
  ),
  Info: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </svg>
  ),
  Mail: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </svg>
  ),
  Send: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
      <path d="M21 3 10.5 13.5" />
      <path d="M21 3 14.5 21l-4-8-8-4z" />
    </svg>
  ),
  Star: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor" stroke="none">
      <path d="m12 3 2.6 5.6 6 .8-4.4 4.2 1.1 6.1L12 16.8 6.7 19.7l1.1-6.1L3.4 9.4l6-.8z" />
    </svg>
  ),
  External: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
      <path d="M14 4h6v6M20 4l-8.5 8.5" />
      <path d="M19 14v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </svg>
  ),
  Dollar: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
      <path d="M12 3v18" />
      <path d="M16.5 7.5A3.5 3.5 0 0 0 13 5h-2a3 3 0 0 0 0 6h2a3 3 0 0 1 0 6h-2a3.5 3.5 0 0 1-3.5-2.5" />
    </svg>
  ),
  Chat: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
      <path d="M4 5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-5 4z" />
    </svg>
  ),
  Arrow: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  ),
  Bed: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
      <path d="M3 18v-9M3 13h18v5M21 18v-4a3 3 0 0 0-3-3h-6v2" />
      <circle cx="7.5" cy="10.5" r="1.8" />
    </svg>
  ),
  Bath: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
      <path d="M3 12h18v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3ZM6 12V6a2 2 0 0 1 4 0" />
      <path d="M6.5 19.5 5.5 21M17.5 19.5l1 1.5" />
    </svg>
  ),
  Ruler: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
      <path d="M3 15.5 15.5 3 21 8.5 8.5 21 3 15.5Z" />
      <path d="M7 11.5 9 13.5M10 8.5 12 10.5M13 5.5 15 7.5" />
    </svg>
  ),
  Heart: ({ className, filled }: IconProps & { filled?: boolean }) => (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
      {...stroke}
      fill={filled ? "currentColor" : "none"}
    >
      <path d="M12 20.2s-7.5-4.4-7.5-9.4A4.3 4.3 0 0 1 12 8.2a4.3 4.3 0 0 1 7.5 2.6c0 5-7.5 9.4-7.5 9.4Z" />
    </svg>
  ),
  Close: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  ),
  Chevron: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
      <path d="m9 6 6 6-6 6" />
    </svg>
  ),
  Check: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
      <path d="m4 12.5 5 5L20 6.5" />
    </svg>
  ),
  Phone: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
      <path d="M6.5 3.5h3l1.5 4-2 1.4a12.5 12.5 0 0 0 6.1 6.1l1.4-2 4 1.5v3a2 2 0 0 1-2.2 2A17.5 17.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2Z" />
    </svg>
  ),
  Calendar: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M3.5 10h17M8 3.5v3M16 3.5v3" />
    </svg>
  ),
  Tag: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
      <path d="M3.5 11.2V4.5a1 1 0 0 1 1-1h6.7a1 1 0 0 1 .7.3l8.3 8.3a1 1 0 0 1 0 1.4l-6.7 6.7a1 1 0 0 1-1.4 0L3.8 11.9a1 1 0 0 1-.3-.7Z" />
      <circle cx="8" cy="8" r="1.3" />
    </svg>
  ),
  Clock: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  ),
  Pin: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
      <path d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.6" />
    </svg>
  ),
  Sun: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8" />
    </svg>
  ),
  Moon: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
      <path d="M20 14.2A8.2 8.2 0 0 1 9.8 4a8.4 8.4 0 1 0 10.2 10.2Z" />
    </svg>
  ),
  Menu: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
      <path d="M3.5 7h17M3.5 12h17M3.5 17h17" />
    </svg>
  ),
  Grid: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1" />
    </svg>
  ),
  Rows: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
      <rect x="3.5" y="4.5" width="17" height="6" rx="1" />
      <rect x="3.5" y="13.5" width="17" height="6" rx="1" />
    </svg>
  ),
  Sliders: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
      <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
      <circle cx="15" cy="7" r="2.2" />
      <circle cx="9" cy="17" r="2.2" />
    </svg>
  ),
  Leaf: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
      <path d="M4 20c0-8 5-14 16-15 0 10-5 15-11 15a5 5 0 0 1-5 0Z" />
      <path d="M9 16c1.5-3.5 4-6 8-8" />
    </svg>
  ),
  Shield: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
      <path d="M12 3l7.5 3v5.5c0 4.8-3.2 8.3-7.5 9.5-4.3-1.2-7.5-4.7-7.5-9.5V6L12 3Z" />
      <path d="m8.8 12 2.2 2.2 4.2-4.4" />
    </svg>
  ),
  Wrench: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
      <path d="M15.5 3.5a5 5 0 0 0-5.8 6.4L3.6 16a2 2 0 0 0 2.8 2.8l6.1-6.1a5 5 0 0 0 6.4-5.8l-2.9 2.9-2.6-.7-.7-2.6 2.8-3Z" />
    </svg>
  ),
  Truck: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
      <path d="M2.5 6.5h11v9h-11zM13.5 10h4l3 3v2.5h-7z" />
      <circle cx="7" cy="18" r="1.8" />
      <circle cx="17" cy="18" r="1.8" />
    </svg>
  ),
  Bolt: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
      <path d="M13 2.5 4.5 13.5H11l-1 8 8.5-11H12l1-8Z" />
    </svg>
  ),
  Plan: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden {...stroke}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="1" />
      <path d="M3.5 10h7v10.5M10.5 10h10M14 10v-6.5" />
    </svg>
  ),
  Quote: ({ className }: IconProps) => (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor" stroke="none">
      <path d="M9.6 5.5C6.3 7 4.5 9.8 4.5 13.3c0 3 1.8 5.2 4.3 5.2 2.1 0 3.7-1.5 3.7-3.6 0-2-1.4-3.4-3.3-3.4-.4 0-.8 0-1 .2.4-1.7 1.7-3.2 3.6-4.2l-2.2-2Zm9.3 0C15.6 7 13.8 9.8 13.8 13.3c0 3 1.8 5.2 4.3 5.2 2.1 0 3.7-1.5 3.7-3.6 0-2-1.4-3.4-3.3-3.4-.4 0-.8 0-1 .2.4-1.7 1.7-3.2 3.6-4.2l-2.2-2Z" />
    </svg>
  ),
};

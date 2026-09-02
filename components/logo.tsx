import { site } from "@/lib/site";
import { cx } from "./ui";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cx("inline-flex items-center gap-2.5", className)}>
      <svg viewBox="0 0 34 28" className="h-6 w-auto shrink-0" aria-hidden>
        <path
          d="M2 14 17 3l15 11"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M7 16h20v9H7z" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M2 25.5h30" stroke="var(--ember)" strokeWidth="2.6" strokeLinecap="round" />
        <rect x="14.5" y="19" width="5" height="6" fill="currentColor" opacity="0.85" />
      </svg>
      <span className="font-display text-[1.35rem] leading-none tracking-tight">
        {site.short}
      </span>
    </span>
  );
}

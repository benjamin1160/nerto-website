"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cx } from "./ui";

const DISMISSED_KEY = "nerto:event-nudge:dismissed";

/* How long the house takes to fly in, and to fly back out on dismiss. The
   matching durations are on `.event-nudge-arrive` and `.event-nudge-leave`
   in `app/globals.css`. */
const LEAVE_MS = 460;

function FlyingHome() {
  return (
    <span className="event-home-float relative block h-16 w-[5.5rem]" aria-hidden>
      <svg viewBox="0 0 126 86" className="absolute inset-0 overflow-visible drop-shadow-lg">
        <path
          className="event-wing event-wing-left"
          d="M30 43C17 33 9 36 8 46c8-4 13 0 20 7"
          fill="var(--paper)"
          stroke="var(--ink)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          className="event-wing event-wing-right"
          d="M108 40c10-9 16-7 17 1-6-2-10 1-16 7"
          fill="var(--paper)"
          stroke="var(--ink)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path d="M36 26 62 8l45 18v48H36Z" fill="var(--surface)" stroke="var(--ink)" strokeWidth="3" strokeLinejoin="round" />
        <path d="m29 29 32-22 51 20" fill="none" stroke="var(--ember)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M36 34h71" stroke="var(--line-strong)" strokeWidth="2" />
        <rect x="46" y="42" width="18" height="16" rx="2" fill="var(--sky)" />
        <path d="M55 42v16M46 50h18" stroke="var(--paper)" strokeWidth="1.5" />
        <rect x="77" y="38" width="20" height="36" rx="2" fill="var(--moss)" />
        <circle cx="92" cy="56" r="1.8" fill="var(--accent-soft)" />
        <circle cx="53" cy="73" r="5" fill="var(--ink)" />
        <circle cx="93" cy="73" r="5" fill="var(--ink)" />
        <g className="event-eyes">
          <circle cx="66" cy="30" r="2.2" fill="var(--ink)" />
          <circle cx="75" cy="30" r="2.2" fill="var(--ink)" />
        </g>
        <path d="M68 36c2 2 5 2 7 0" fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </span>
  );
}

/**
 * The event helper — a Clippy-style winged house that flies in from the top
 * corner, lands on the left edge and says its piece in a bubble over its head.
 *
 * Phones only. It lands well above the bottom of the screen on purpose: the
 * bottom-right corner belongs to the chat bubble, and GHL's chat widget opens
 * a "Have a question?" prompt that runs most of the screen's width just above
 * it. The bubble here is kept narrow and high so the two never stack.
 */
export function EventNudge() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<"hidden" | "here" | "leaving">("hidden");
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    let wasDismissed = false;
    try {
      wasDismissed = sessionStorage.getItem(DISMISSED_KEY) === "true";
    } catch {}
    queueMicrotask(() => setDismissed(wasDismissed));
    if (wasDismissed || pathname.startsWith("/events")) return;

    const reveal = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (window.scrollY > 360 || (scrollable > 0 && window.scrollY / scrollable > 0.16)) {
        setPhase("here");
        window.removeEventListener("scroll", reveal);
      }
    };

    reveal();
    window.addEventListener("scroll", reveal, { passive: true });
    return () => window.removeEventListener("scroll", reveal);
  }, [pathname]);

  if (dismissed || pathname.startsWith("/events")) return null;

  const dismiss = () => {
    try {
      sessionStorage.setItem(DISMISSED_KEY, "true");
    } catch {}
    setPhase("leaving");
    window.setTimeout(() => setDismissed(true), LEAVE_MS);
  };

  return (
    <aside
      aria-label="Upcoming event"
      className={cx(
        "fixed left-3 z-40 bottom-[calc(12rem+env(safe-area-inset-bottom))] md:hidden",
        phase === "hidden" && "pointer-events-none invisible",
        phase === "here" && "event-nudge-arrive",
        phase === "leaving" && "event-nudge-leave pointer-events-none",
      )}
    >
      <div className="event-speech-bubble relative mb-3 ml-6 w-[min(14.5rem,calc(100vw-7rem))] rounded-2xl border-2 border-ink/80 bg-paper p-3 pr-8 shadow-2xl">
        <button
          type="button"
          onClick={dismiss}
          className="absolute right-1 top-1 grid size-7 place-items-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-ink"
          aria-label="Dismiss event notice"
        >
          <span aria-hidden>×</span>
        </button>

        <Link href="/events" className="group block">
          <span className="block text-[0.65rem] font-bold uppercase tracking-[0.15em] text-ember">
            Psst—fun is moving in!
          </span>
          <span className="mt-1 block text-sm font-semibold leading-snug text-ink">
            Trunk or Treat lands here October 17.
          </span>
          <span className="mt-1 block text-xs font-medium text-muted transition-colors group-hover:text-ember">
            See the event →
          </span>
        </Link>
      </div>

      <FlyingHome />
    </aside>
  );
}

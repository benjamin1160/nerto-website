"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cx } from "./ui";

const DISMISSED_KEY = "nerto:event-nudge:dismissed";

/* How long the ghost takes to fly in, and to fly back out on dismiss. The
   matching durations are on `.event-nudge-arrive` and `.event-nudge-leave`
   in `app/globals.css`. */
const LEAVE_MS = 460;

/* Fixed colours rather than tokens: a ghost is white in the dark theme too,
   and `--ink` turns light there, which would draw a white ghost in white. */
const GHOST = "#ffffff";
const LINE = "#17140f";
const PUMPKIN = "#f28c28";

function FlyingGhost() {
  return (
    <span className="event-home-float relative block size-20" aria-hidden>
      <svg viewBox="0 0 100 100" className="absolute inset-0 overflow-visible drop-shadow-lg">
        {/* The arm that waves, behind the body. */}
        <path
          className="event-wing event-wing-left"
          d="M27 46C16 40 9 33 8 26c6 2 13 7 21 12"
          fill={GHOST}
          stroke={LINE}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          className="event-ghost-body"
          d="M22 88V44C22 22 34 8 50 8s28 14 28 36v44l-7-6-7 7-7-7-7 7-7-7-7 7-7-7Z"
          fill={GHOST}
          stroke={LINE}
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <g className="event-eyes">
          <ellipse cx="41" cy="38" rx="4" ry="5.5" fill={LINE} />
          <ellipse cx="58" cy="38" rx="4" ry="5.5" fill={LINE} />
        </g>
        <ellipse cx="49.5" cy="52" rx="4" ry="5" fill={LINE} />
        <circle cx="34" cy="48" r="3.5" fill="#f9a8b8" opacity="0.7" />
        <circle cx="65" cy="48" r="3.5" fill="#f9a8b8" opacity="0.7" />
        {/* The other arm, holding a trick-or-treat pumpkin. */}
        <g className="event-wing event-wing-right">
          <path d="M83 60c3 3 5 7 5 10" fill="none" stroke={LINE} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M77 58c5 0 8 2 10 5" fill="none" stroke={LINE} strokeWidth="3" strokeLinecap="round" />
          <path d="M80 66c-6 0-9 5-9 10 0 6 6 10 13 10s13-4 13-10c0-5-3-10-9-10-1 0-3 1-4 1s-3-1-4-1Z" fill={PUMPKIN} stroke={LINE} strokeWidth="2.5" />
          <path d="M84 67v18" stroke={LINE} strokeWidth="1.5" opacity="0.5" />
          <path d="m78 73 3 2 3-2 3 2 3-2" fill="none" stroke={LINE} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M71 70c4-6 22-6 26 0" fill="none" stroke={LINE} strokeWidth="2" strokeLinecap="round" />
        </g>
      </svg>
    </span>
  );
}

/**
 * The event helper — a Clippy-style ghost, pumpkin pail in hand, that swoops in
 * from the top corner, lands on the left edge and says its piece in a bubble
 * over its head.
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
            Boo! Fun is moving in!
          </span>
          <span className="mt-1 block text-sm font-semibold leading-snug text-ink">
            Trunk or Treat lands here October 17.
          </span>
          <span className="mt-1 block text-xs font-medium text-muted transition-colors group-hover:text-ember">
            See the event →
          </span>
        </Link>
      </div>

      <FlyingGhost />
    </aside>
  );
}

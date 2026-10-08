"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cx } from "./ui";

const DISMISSED_KEY = "nerto:event-nudge:dismissed";

function FlyingHome() {
  return (
    <span className="event-home-float relative block h-20 w-28 shrink-0" aria-hidden>
      <span className="event-speed-line absolute left-0 top-8 h-0.5 w-8 rounded-full bg-ember/45" />
      <span className="event-speed-line absolute left-2 top-12 h-0.5 w-5 rounded-full bg-ember/30 [animation-delay:120ms]" />
      <svg viewBox="0 0 126 86" className="absolute inset-0 drop-shadow-lg">
        <path d="M36 26 62 8l45 18v48H36Z" fill="var(--surface)" stroke="var(--ink)" strokeWidth="3" strokeLinejoin="round" />
        <path d="m29 29 32-22 51 20" fill="none" stroke="var(--ember)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M36 34h71" stroke="var(--line-strong)" strokeWidth="2" />
        <rect x="46" y="42" width="18" height="16" rx="2" fill="var(--sky)" />
        <path d="M55 42v16M46 50h18" stroke="var(--paper)" strokeWidth="1.5" />
        <rect x="77" y="38" width="20" height="36" rx="2" fill="var(--moss)" />
        <circle cx="92" cy="56" r="1.8" fill="var(--accent-soft)" />
        <circle cx="53" cy="73" r="5" fill="var(--ink)" />
        <circle cx="93" cy="73" r="5" fill="var(--ink)" />
        <path d="M30 43C17 33 9 36 8 46c8-4 13 0 20 7M108 40c10-9 16-7 17 1-6-2-10 1-16 7" fill="var(--paper)" stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="66" cy="30" r="2.2" fill="var(--ink)" />
        <circle cx="75" cy="30" r="2.2" fill="var(--ink)" />
        <path d="M68 36c2 2 5 2 7 0" fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </span>
  );
}

export function EventNudge() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const wasDismissed = sessionStorage.getItem(DISMISSED_KEY) === "true";
    queueMicrotask(() => setDismissed(wasDismissed));
    if (wasDismissed || pathname.startsWith("/events")) return;

    const reveal = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (window.scrollY > 360 || (scrollable > 0 && window.scrollY / scrollable > 0.16)) {
        setVisible(true);
        window.removeEventListener("scroll", reveal);
      }
    };

    reveal();
    window.addEventListener("scroll", reveal, { passive: true });
    return () => window.removeEventListener("scroll", reveal);
  }, [pathname]);

  if (dismissed || pathname.startsWith("/events")) return null;

  const dismiss = () => {
    sessionStorage.setItem(DISMISSED_KEY, "true");
    setVisible(false);
    window.setTimeout(() => setDismissed(true), 300);
  };

  return (
    <aside
      aria-label="Upcoming event"
      className={cx(
        "fixed bottom-20 left-2 z-40 w-[min(23rem,calc(100vw-1rem))] md:hidden",
        visible ? "event-nudge-arrive" : "pointer-events-none translate-x-[-120%] opacity-0",
      )}
    >
      <div className="relative flex items-end">
        <FlyingHome />

        <div className="event-speech-bubble relative -ml-3 flex-1 rounded-2xl border-2 border-ink/80 bg-paper p-3 pb-3 pr-9 shadow-2xl">
          <button
            type="button"
            onClick={dismiss}
            className="absolute right-1.5 top-1.5 grid size-7 place-items-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-ink"
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
      </div>
    </aside>
  );
}

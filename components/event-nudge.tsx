"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cx } from "./ui";

const DISMISSED_KEY = "nerto:event-nudge:dismissed";

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
    window.setTimeout(() => setDismissed(true), 250);
  };

  return (
    <aside
      aria-label="Upcoming event"
      className={cx(
        "fixed bottom-20 left-3 z-40 w-[min(21rem,calc(100vw-1.5rem))] transition-all duration-300 md:hidden",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
      )}
    >
      <div className="relative rounded-2xl border border-line-strong bg-paper p-3 pr-10 shadow-2xl">
        <button
          type="button"
          onClick={dismiss}
          className="absolute right-2 top-2 grid size-7 place-items-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-ink"
          aria-label="Dismiss event notice"
        >
          <span aria-hidden>×</span>
        </button>

        <Link href="/events" className="group flex items-center gap-3">
          <span
            className="grid size-11 shrink-0 rotate-[-8deg] place-items-center rounded-xl bg-[image:var(--gradient)] text-2xl text-white shadow-md transition-transform group-hover:rotate-0"
            aria-hidden
          >
            📎
          </span>
          <span className="min-w-0">
            <span className="block text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-ember">
              A quick heads-up
            </span>
            <span className="mt-0.5 block text-sm font-semibold leading-snug text-ink">
              Trunk or Treat is October 17
            </span>
            <span className="mt-0.5 block text-xs text-muted">Tap for details →</span>
          </span>
        </Link>
      </div>
    </aside>
  );
}


"use client";

import { useCallback, useSyncExternalStore, type ReactNode } from "react";
import { cx, Icon } from "./ui";

const KEY = "hearthline:saved";
const EMPTY: string[] = [];

/**
 * A tiny external store rather than state-in-an-effect: `useSyncExternalStore`
 * hydrates from the server snapshot (empty) and then swaps in localStorage on
 * the client without a mismatch, and keeps every heart on the page in sync —
 * including across browser tabs.
 */
let snapshot: string[] = EMPTY;
let hydrated = false;
const listeners = new Set<() => void>();

function read(): string[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : EMPTY;
  } catch {
    /* Private mode or blocked storage — saved homes just won't persist. */
    return EMPTY;
  }
}

function ensureHydrated() {
  if (hydrated) return;
  hydrated = true;
  snapshot = read();
}

function emit() {
  for (const l of listeners) l();
}

function onStorage(e: StorageEvent) {
  if (e.key !== null && e.key !== KEY) return;
  snapshot = read();
  emit();
}

function subscribe(onChange: () => void) {
  ensureHydrated();
  if (listeners.size === 0) window.addEventListener("storage", onStorage);
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

function write(next: string[]) {
  snapshot = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* no-op */
  }
  emit();
}

function getSnapshot() {
  ensureHydrated();
  return snapshot;
}

function getServerSnapshot() {
  return EMPTY;
}

/** Resolves to false during SSR and hydration, true once mounted. */
function subscribeNever() {
  return () => {};
}

export type SavedHomes = {
  saved: string[];
  /** False until the client has read localStorage — render skeletons until then. */
  ready: boolean;
  toggle: (slug: string) => void;
  has: (slug: string) => boolean;
  clear: () => void;
};

export function useSavedHomes(): SavedHomes {
  const saved = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const ready = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );

  const toggle = useCallback((slug: string) => {
    const current = getSnapshot();
    write(current.includes(slug) ? current.filter((s) => s !== slug) : [slug, ...current]);
  }, []);

  const has = useCallback((slug: string) => getSnapshot().includes(slug), []);
  const clear = useCallback(() => write([]), []);

  return { saved, ready, toggle, has, clear };
}

/**
 * Kept for API symmetry — the store is module-level, so no context is needed,
 * but wrapping the app makes the dependency explicit and leaves a seam if you
 * later swap localStorage for an account-backed shortlist.
 */
export function SavedHomesProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function SaveButton({
  slug,
  name,
  className,
  variant = "float",
}: {
  slug: string;
  name: string;
  className?: string;
  variant?: "float" | "inline";
}) {
  const { has, toggle, ready } = useSavedHomes();
  const active = ready && has(slug);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(slug);
      }}
      aria-pressed={active}
      aria-label={active ? `Remove ${name} from saved homes` : `Save ${name}`}
      className={cx(
        "group/save inline-flex items-center justify-center transition-all duration-300",
        variant === "float"
          ? "size-10 rounded-full border border-white/25 bg-black/35 text-white backdrop-blur-md hover:border-white/70 hover:bg-black/55 active:scale-90"
          : "gap-2 rounded-full border border-line-strong px-5 py-3 text-sm text-ink hover:border-ink",
        className,
      )}
    >
      <Icon.Heart
        className={cx(
          "size-[1.15rem] transition-transform duration-300 group-hover/save:scale-110",
          active && "text-ember",
        )}
        filled={active}
      />
      {variant === "inline" && <span>{active ? "Saved" : "Save this home"}</span>}
    </button>
  );
}

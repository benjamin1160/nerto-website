"use client";

import { Icon } from "./ui";

/**
 * Stateless by design: the inline boot script in app/layout.tsx owns the
 * `dark` class, and CSS decides which icon shows. Nothing to hydrate, so
 * there is no flash and no mismatch.
 *
 * The site defaults to light whatever the reader's system is set to, so this
 * is the only way into dark, and the choice is remembered from here on.
 */
export function ThemeToggle({ className }: { className?: string }) {
  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      window.localStorage.setItem("nerto:theme", next ? "dark" : "light");
    } catch {
      /* no-op */
    }
  }

  return (
    <button type="button" onClick={toggle} className={className} aria-label="Toggle colour theme">
      <Icon.Sun className="hidden size-[1.1rem] dark:block" />
      <Icon.Moon className="size-[1.1rem] dark:hidden" />
    </button>
  );
}

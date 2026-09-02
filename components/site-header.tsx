"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CallBar } from "./call-bar";
import { Logo } from "./logo";
import { useSavedHomes } from "./saved-homes";
import { ThemeToggle } from "./theme-toggle";
import { cx, Icon } from "./ui";
import { drawerNav, primaryNav } from "@/lib/navigation";
import { callBar } from "@/lib/page-config";
import { site } from "@/lib/site";

/**
 * The header: a phone strip, then a white bar that sticks to the top of the
 * viewport as the page scrolls under it.
 *
 * Sticky rather than fixed, and opaque rather than transparent-over-the-hero.
 * That is the whole difference between a header that behaves like furniture
 * and one that behaves like a magazine cover, and it is the pattern every
 * conversion-shaped site in this market uses: the phone number and the quote
 * button are never more than a flick away, and nothing below has to leave a
 * hole for the bar to sit in.
 *
 * Because it is in flow, no page needs top padding to clear it. `--chrome-h`
 * survives for the two things that still have to know its height: sticky
 * rails that park beneath it, and `scroll-margin` on anchored sections.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { saved, ready } = useSavedHomes();

  /* Close the drawer on navigation by adjusting state during render, which
     avoids the cascading re-render an effect would cause. */
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    if (open) setOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const iconButton =
    "inline-flex size-10 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-surface-2 hover:text-ink";

  return (
    <>
      <a
        href="#main"
        className="sr-only rounded-lg bg-ink px-4 py-2 text-paper focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60]"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-50">
        {callBar && <CallBar />}

        <div className="border-b border-line bg-paper">
          <div className="mx-auto flex min-h-[var(--header-h)] w-full max-w-[80rem] items-center gap-4 px-4 py-2 sm:px-6 lg:px-8">
            <Link
              href="/"
              className="shrink-0 transition-opacity hover:opacity-80"
              aria-label={`${site.name} — home`}
            >
              <Logo className="text-ink" />
            </Link>

            <nav className="ml-auto hidden items-center gap-1 lg:flex" aria-label="Primary">
              {primaryNav.map((item) => {
                const active =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Glyph = item.icon ? Icon[item.icon] : undefined;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cx(
                      "flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 xl:px-4",
                      active
                        ? "bg-ember-wash text-ember"
                        : "text-ink hover:bg-surface-2",
                    )}
                  >
                    {Glyph && <Glyph className="size-4 shrink-0" />}
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="ml-auto flex items-center gap-2 lg:ml-2">
              <Link
                href="/saved"
                className={cx(iconButton, "relative")}
                aria-label={`Saved homes${ready && saved.length ? ` (${saved.length})` : ""}`}
              >
                <Icon.Heart className="size-[1.1rem]" filled={ready && saved.length > 0} />
                {ready && saved.length > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 grid size-[1.15rem] place-items-center rounded-full bg-ember text-[0.6rem] font-bold text-on-ember">
                    {saved.length}
                  </span>
                )}
              </Link>

              <ThemeToggle className={iconButton} />

              {/* Outlined rather than filled: the gradient buttons on the page
                  are the calls to action, and a third one up here would flatten
                  the hierarchy the hero depends on. */}
              <a
                href={site.phoneHref}
                className="hidden items-center gap-2 whitespace-nowrap rounded-lg border-2 border-ink px-4 py-2.5 text-sm font-semibold text-ink transition-colors duration-200 hover:bg-ink hover:text-paper sm:inline-flex"
                aria-label={`Call ${site.name} on ${site.phone}`}
              >
                <Icon.Phone className="size-4 shrink-0" />
                {site.phone}
              </a>

              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className={cx(iconButton, "lg:hidden")}
                aria-expanded={open}
                aria-controls="mobile-nav"
                aria-label={open ? "Close menu" : "Open menu"}
              >
                {open ? <Icon.Close className="size-5" /> : <Icon.Menu className="size-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div
        id="mobile-nav"
        className={cx(
          "fixed inset-0 z-40 bg-paper transition-[opacity,visibility] duration-300 lg:hidden",
          open ? "visible opacity-100" : "invisible opacity-0",
        )}
        aria-hidden={!open}
      >
        <nav
          className="flex h-full flex-col overflow-y-auto px-5 pb-10 pt-[calc(var(--chrome-h)+1.5rem)]"
          aria-label="Mobile"
        >
          {drawerNav.map((item) => {
            const Glyph = item.icon ? Icon[item.icon] : undefined;
            return (
              <Link
                key={item.href}
                href={item.href}
                tabIndex={open ? 0 : -1}
                className="flex items-center gap-3 border-b border-line py-4 text-lg font-medium text-ink"
              >
                {Glyph ? (
                  <Glyph className="size-5 shrink-0 text-ember" />
                ) : (
                  <span className="size-5 shrink-0" />
                )}
                {item.label}
              </Link>
            );
          })}
          <a
            href={site.phoneHref}
            tabIndex={open ? 0 : -1}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-[image:var(--gradient)] px-6 py-4 text-base font-semibold text-white shadow-[var(--button-shadow)]"
          >
            <Icon.Phone className="size-5" />
            Call {site.phone}
          </a>
        </nav>
      </div>
    </>
  );
}

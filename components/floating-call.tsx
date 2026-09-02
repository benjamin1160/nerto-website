"use client";

import { usePathname } from "next/navigation";
import { Icon } from "./ui";
import { site } from "@/lib/site";

/* Routes that own the whole screen. Both are forms a visitor is part-way
   through; a button floating over one is in the way rather than useful. */
const HIDDEN_ON = ["/new-home", "/prequalify"];

/**
 * The call button that follows a visitor down every page.
 *
 * It is the one persistent piece of chrome on the site, which is exactly why
 * it has a switch: `floatingCall` in `lib/page-config.ts`. A circle rather
 * than a labelled pill: the number is already spelled out three times above
 * it, so this only has to be tappable, not explanatory.
 *
 * It is always visible, including over the hero: the header is sticky rather
 * than fixed here, so once a visitor has scrolled past the top of the page
 * this is the only phone number on screen. It sits at the same z-index as the
 * mobile drawer's backdrop and below the header, so an open menu covers it.
 */
export function FloatingCall() {
  const pathname = usePathname();
  if (HIDDEN_ON.some((r) => pathname === r || pathname.startsWith(`${r}/`))) return null;

  return (
    <a
      href={site.phoneHref}
      className="group fixed bottom-6 right-6 z-40 flex size-14 items-center justify-center rounded-full bg-[image:var(--gradient)] text-white shadow-2xl transition-transform duration-300 hover:scale-110"
      aria-label={`Call ${site.name} on ${site.phone}`}
    >
      <Icon.Phone className="size-6 shrink-0" />
    </a>
  );
}

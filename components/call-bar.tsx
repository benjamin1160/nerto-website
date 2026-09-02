import { Icon } from "./ui";
import { site } from "@/lib/site";

/**
 * The phone strip above the header.
 *
 * A dealership's most valuable page event is a tapped phone number, and the
 * conversion-shaped sites in this market all put one in the first line of the
 * document rather than behind a scroll. So this is the top of the sticky
 * chrome, it wears the brand gradient, and it says the number and what it is
 * for and nothing else.
 *
 * Its height is published as `--callbar-h` on `:root` — emitted by
 * `app/layout.tsx`, because a custom property set on the bar itself would
 * only inherit downward and the pages offsetting against it are its
 * siblings. Everything that has to park under the chrome reads `--chrome-h`,
 * which is `--header-h` plus that, so turning the bar off in
 * `lib/page-config.ts` collapses the offset with it.
 */

/** Kept in one place: `py-2` on a 20px line must add up to this. */
export const CALL_BAR_HEIGHT = "2.25rem";

export function CallBar() {
  return (
    <div className="bg-[image:var(--gradient)] py-2 text-center text-sm font-medium text-white">
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4">
        <a
          href={site.phoneHref}
          className="flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
        >
          <Icon.Phone className="size-4 shrink-0" />
          <span>Call now: {site.phone}</span>
          <span className="hidden sm:inline">— we&apos;re here to help</span>
        </a>
      </div>
    </div>
  );
}

import Image from "next/image";
import { site } from "@/lib/site";
import logo from "@/public/logo.png";
import { cx } from "./ui";

/**
 * NERTO's own mark — the three grey houses, "N.E.R.T.O." in blue with the
 * orange house icons, "MOBILES • MODULARS" beneath — as the business uses it
 * on its existing site. `public/logo.png` is that artwork with the white
 * plate knocked out, so it sits on the header ground; in the dark theme the
 * black wordmark would vanish, so it gets its plate back.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cx(
        "inline-flex items-center dark:rounded-lg dark:bg-white dark:px-2 dark:py-1",
        className,
      )}
    >
      <Image
        src={logo}
        alt={`${site.name} — Mobiles · Modulars`}
        priority
        sizes="260px"
        className="h-14 w-auto sm:h-16"
      />
    </span>
  );
}

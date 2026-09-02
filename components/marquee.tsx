import { cx } from "./ui";

/**
 * Infinite ticker. The track is duplicated and translated -50%, so the loop
 * is seamless regardless of content width.
 */
export function Marquee({
  items,
  className,
}: {
  items: string[];
  className?: string;
}) {
  const track = (
    <ul className="flex shrink-0 items-center" aria-hidden>
      {items.map((item, i) => (
        <li key={i} className="flex items-center">
          <span className="whitespace-nowrap px-7 font-mono text-[0.72rem] uppercase tracking-[0.22em]">
            {item}
          </span>
          <span className="size-1 rounded-full bg-current opacity-40" />
        </li>
      ))}
    </ul>
  );

  return (
    <div className={cx("relative flex overflow-hidden", className)}>
      <div className="animate-marquee flex min-w-full shrink-0 items-center motion-reduce:animate-none">
        {track}
        {track}
      </div>
      <span className="sr-only">{items.join(". ")}</span>
    </div>
  );
}

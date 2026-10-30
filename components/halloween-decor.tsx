import { activeSeason } from "@/lib/skin";

/*
 * Halloween dressing for the seasonal skin: cobwebs hanging off the header
 * with a spider on a thread, bats crossing the sky now and then, and a row of
 * jack-o'-lanterns above the footer.
 *
 * Everything here is decoration — `aria-hidden`, `pointer-events: none` — and
 * wears the `season-halloween` class, which `app/globals.css` hides unless the
 * boot script has put `.halloween` on <html>. So it disappears on the same
 * clock as the colours, and a build after the season stops shipping it.
 */
const on = () => activeSeason()?.id === "halloween";

/* A corner web: spokes fanning out from the top-left corner, joined by
   threads that sag toward the hub. Mirrored with CSS for the right corner. */
function Web({ className }: { className?: string }) {
  const spokes = [0, 15, 30, 45, 60, 75, 90].map((deg) => (deg * Math.PI) / 180);
  const rings = [22, 44, 66, 88, 110];
  const at = (r: number, a: number) => [r * Math.cos(a), r * Math.sin(a)] as const;
  const threads = rings.flatMap((r) =>
    spokes.slice(1).map((a, i) => {
      const [x1, y1] = at(r, spokes[i]);
      const [x2, y2] = at(r, a);
      const [cx, cy] = at(r * 0.82, (spokes[i] + a) / 2);
      return `M${x1.toFixed(1)} ${y1.toFixed(1)}Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
    }),
  );
  return (
    <svg viewBox="0 0 118 118" className={className} fill="none" stroke="currentColor" strokeLinecap="round">
      {spokes.map((a) => {
        const [x, y] = at(118, a);
        return <path key={a} d={`M0 0L${x.toFixed(1)} ${y.toFixed(1)}`} strokeWidth="1.1" />;
      })}
      <path d={threads.join("")} strokeWidth="0.9" />
    </svg>
  );
}

function Spider() {
  return (
    <span className="hw-spider absolute right-[4.5rem] top-0 block w-7 sm:right-[7.5rem]">
      <span className="hw-thread mx-auto block w-px bg-current opacity-60" />
      <svg viewBox="0 0 24 22" className="-mt-px block w-7">
        <g stroke="#17140f" strokeWidth="1.4" strokeLinecap="round" fill="none">
          <path d="M9 9 3 4M9 11 1 10M9 13 2 17M10 14 5 21M15 9l6-5M15 11l8-1M15 13l7 4M14 14l5 7" />
        </g>
        <ellipse cx="12" cy="9" rx="3.4" ry="3" fill="#17140f" />
        <ellipse cx="12" cy="14.5" rx="4.6" ry="5" fill="#17140f" />
        <circle cx="10.8" cy="8.4" r="0.9" fill="#f97316" />
        <circle cx="13.2" cy="8.4" r="0.9" fill="#f97316" />
      </svg>
    </span>
  );
}

/** Cobwebs and a spider hanging under the header bar. */
export function HalloweenHeaderDecor() {
  if (!on()) return null;
  return (
    <span aria-hidden className="season-halloween pointer-events-none absolute inset-x-0 top-full h-0 text-ink">
      <Web className="absolute left-0 top-0 w-28 opacity-50 sm:w-44" />
      <Web className="absolute right-0 top-0 w-28 -scale-x-100 opacity-50 sm:w-44" />
      <Spider />
    </span>
  );
}

function Bat({ className, width }: { className?: string; width: string }) {
  return (
    <svg viewBox="0 0 64 28" className={className} style={{ width }} fill="#17140f">
      <path
        className="hw-bat-wings"
        d="M32 9c-2-4-3-5-3-7 1 2 2 3 3 3s2-1 3-3c0 2-1 3-3 7Zm-3 2C24 4 14 1 0 6c6 1 9 4 9 8 4-3 8-2 10 2 2-3 6-4 10-2Zm6 0c5-7 15-10 29-5-6 1-9 4-9 8-4-3-8-2-10 2-2-3-6-4-10-2Z"
      />
      <ellipse cx="32" cy="12" rx="3.5" ry="5" />
      <circle cx="30.8" cy="10.5" r="0.8" fill="#f97316" />
      <circle cx="33.2" cy="10.5" r="0.8" fill="#f97316" />
    </svg>
  );
}

/* Each bat's lane: height, size, and when and how fast it crosses. Inline
   styles because the `.hw-bat` shorthand would reset a utility's delay. */
const BATS = [
  { top: "1.5rem", width: "3.25rem", delay: "1s", duration: "11s" },
  { top: "4rem", width: "2.25rem", delay: "1.8s", duration: "13s" },
  { top: "7rem", width: "2.75rem", delay: "6s", duration: "15s" },
  { top: "2.5rem", width: "2rem", delay: "8.5s", duration: "12s" },
  { top: "9rem", width: "3rem", delay: "12s", duration: "17s" },
];

/** Bats that cross the top of the screen every so often. */
export function HalloweenSky() {
  if (!on()) return null;
  return (
    <div aria-hidden className="season-halloween pointer-events-none fixed inset-x-0 top-24 z-30 h-56 overflow-hidden">
      {BATS.map((bat) => (
        <span
          key={bat.delay}
          className="hw-bat absolute left-0 block"
          style={{ top: bat.top, animationDelay: bat.delay, animationDuration: bat.duration }}
        >
          <Bat className="drop-shadow-[0_0_6px_rgba(249,115,22,0.6)]" width={bat.width} />
        </span>
      ))}
    </div>
  );
}

function Pumpkin({ size, delay }: { size: string; delay: string }) {
  return (
    <svg viewBox="0 0 80 70" className={`hw-pumpkin ${size}`} style={{ animationDelay: delay }}>
      <path d="M40 14c0-6 2-10 7-12" stroke="#3f6212" strokeWidth="5" strokeLinecap="round" fill="none" />
      <ellipse cx="22" cy="40" rx="18" ry="26" fill="#c2410c" />
      <ellipse cx="58" cy="40" rx="18" ry="26" fill="#c2410c" />
      <ellipse cx="40" cy="40" rx="20" ry="28" fill="#ea580c" />
      <path d="M40 13v54M28 15c-6 10-6 40 0 51M52 15c6 10 6 40 0 51" stroke="#9a3412" strokeWidth="1.5" fill="none" opacity="0.6" />
      <g className="hw-glow" fill="#fde047">
        <path d="m22 32 9-8 4 10Z" />
        <path d="m58 32-9-8-4 10Z" />
        <path d="m40 36-4 7h8Z" />
        <path d="M18 48c6 9 38 9 44 0-3 1-6 1-8 0l-3 5-4-4-4 5-4-5-4 4-3-5c-3 1-8 1-14 0Z" />
      </g>
    </svg>
  );
}

/** A row of jack-o'-lanterns on a dark hill, between the page and the footer. */
export function HalloweenPumpkins() {
  if (!on()) return null;
  return (
    <div aria-hidden className="season-halloween pointer-events-none relative h-24 overflow-hidden sm:h-28">
      <svg viewBox="0 0 400 40" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-10 w-full" fill="#1b1838">
        <path d="M0 40V24c40-14 90-18 140-8s110 12 160-2 80-10 100-4v30Z" />
      </svg>
      <div className="absolute inset-x-0 bottom-2 mx-auto flex max-w-[80rem] items-end justify-between px-6 sm:px-16">
        <Pumpkin size="w-12 sm:w-16" delay="0s" />
        <Pumpkin size="w-16 sm:w-20" delay="0.7s" />
        <Pumpkin size="hidden w-14 sm:block" delay="1.3s" />
        <Pumpkin size="w-10 sm:w-14" delay="0.4s" />
        <Pumpkin size="hidden w-16 sm:block sm:w-24" delay="1s" />
      </div>
    </div>
  );
}

/**
 * Turns a hero photograph to dusk: a violet sky, a pumpkin glow at the
 * horizon and a full moon. Goes inside the hero's background layer, after
 * its scrim.
 */
export function HalloweenNight() {
  if (!on()) return null;
  return (
    <span aria-hidden className="season-halloween pointer-events-none absolute inset-0">
      <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(76,29,149,0.5)_0%,rgba(14,16,40,0.15)_55%,rgba(234,88,12,0.35)_100%)]" />
      <span className="hw-moon absolute right-[10%] top-[2%] block size-12 rounded-full md:left-[46%] md:right-auto md:top-[7%] md:size-20" />
    </span>
  );
}

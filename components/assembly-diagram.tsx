import { cx } from "./ui";

/**
 * Cutaway section through a set home, roof to footing.
 * Numbered markers key to <assemblyLegend> so the labels stay selectable,
 * translatable and readable at phone widths.
 */

export const assemblyLegend = [
  {
    n: "01",
    title: "30-year architectural shingle",
    body: "Over ice-and-water shield at the eaves and a full synthetic underlayment. Ridge vent, no roof jacks on the street face.",
  },
  {
    n: "02",
    title: "R-33 blown ceiling, vented attic",
    body: "Engineered roof trusses at 16\" on centre with a raised heel, so the insulation keeps its full depth all the way to the wall plate.",
  },
  {
    n: "03",
    title: "2×6 walls at 16\" on centre",
    body: "R-21 batt in the cavity, structural sheathing outside it, house-wrap over that. The same assembly a good site-builder charges an upgrade for.",
  },
  {
    n: "04",
    title: "Low-E argon glazing",
    body: "Double-pane, warm-edge spacers, installed and flashed on a jig instead of a ladder.",
  },
  {
    n: "05",
    title: "Engineered floor trusses",
    body: "Open-web, so plumbing and duct runs pass through the depth rather than notching a joist. This is why the floors don't squeak.",
  },
  {
    n: "06",
    title: "R-33 floor + sealed belly wrap",
    body: "A continuous membrane under the whole floor system. Rodent barrier, moisture barrier, and the reason the floor isn't cold in February.",
  },
  {
    n: "07",
    title: "Welded steel chassis",
    body: "Two 12-inch I-beams the full length of each section, with outriggers. It is a permanent part of the structure — not a delivery trailer that gets taken away.",
  },
  {
    n: "08",
    title: "Piers, footings and anchors",
    body: "Poured footings below frost depth, engineered pier stacks, and ground anchors torqued to spec. On a runner foundation the home titles as real property.",
  },
  {
    n: "09",
    title: "Roughly 30 inches of clear service space",
    body: "Every supply line, drain, duct and junction is reachable on your back with a flashlight. Ask anyone who has cut a hole in a slab what that is worth.",
  },
] as const;

export function AssemblyDiagram({ className }: { className?: string }) {
  const marker = (x: number, y: number, n: string) => (
    <g key={n}>
      <circle cx={x} cy={y} r="15" fill="var(--ember)" />
      <text
        x={x}
        y={y + 4.5}
        textAnchor="middle"
        fontSize="12.5"
        fontWeight="700"
        fill="var(--on-ember)"
        fontFamily="var(--font-mono), monospace"
      >
        {n}
      </text>
    </g>
  );

  const leader = (x1: number, y1: number, x2: number, y2: number) => (
    <path
      d={`M${x1} ${y1} L${x2} ${y2}`}
      stroke="currentColor"
      strokeOpacity="0.35"
      strokeWidth="1.4"
      strokeDasharray="4 4"
      fill="none"
    />
  );

  return (
    <svg
      viewBox="0 0 1000 760"
      className={cx(className)}
      role="img"
      aria-label="Cutaway section through a manufactured home, from roof shingles down to the pier footings, showing nine construction layers."
      fontFamily="var(--font-sans), sans-serif"
    >
      <title>Section through a set home</title>
      <defs>
        <pattern id="asm-batt" width="16" height="16" patternUnits="userSpaceOnUse">
          <rect width="16" height="16" fill="var(--surface-2)" />
          <path d="M0 8 q4 -8 8 0 t8 0" fill="none" stroke="var(--ember)" strokeOpacity="0.35" strokeWidth="2" />
        </pattern>
        <pattern id="asm-earth" width="18" height="18" patternUnits="userSpaceOnUse">
          <rect width="18" height="18" fill="var(--surface-2)" />
          <path d="M0 18 L18 0" stroke="currentColor" strokeOpacity="0.16" strokeWidth="1.5" />
        </pattern>
        <linearGradient id="asm-air" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--ember)" stopOpacity="0.14" />
          <stop offset="100%" stopColor="var(--ember)" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Ground + earth hatch */}
      <rect x="0" y="640" width="1000" height="120" fill="url(#asm-earth)" />
      <line x1="0" y1="640" x2="1000" y2="640" stroke="currentColor" strokeOpacity="0.5" strokeWidth="2" />

      {/* -------- Roof -------- */}
      <polygon points="220,300 500,150 780,300" fill="var(--surface-2)" stroke="currentColor" strokeOpacity="0.5" strokeWidth="2" />
      <polygon points="212,296 500,142 788,296 788,282 500,128 212,282" fill="currentColor" opacity="0.75" />
      {/* Trusses */}
      <g stroke="currentColor" strokeOpacity="0.28" strokeWidth="1.6">
        <path d="M260 300 L500 172 L740 300" fill="none" />
        <path d="M300 300 L500 194 L700 300" fill="none" />
        <path d="M340 300 L500 216 L660 300" fill="none" />
        <path d="M380 300 L500 238 L620 300" fill="none" />
      </g>
      {/* Ceiling insulation */}
      <path d="M244 300 L500 168 L756 300 Z" fill="url(#asm-batt)" opacity="0.55" />
      <rect x="222" y="300" width="556" height="12" fill="currentColor" opacity="0.5" />

      {/* -------- Walls -------- */}
      {[
        { x: 222, label: "left" },
        { x: 742, label: "right" },
      ].map((wall) => (
        <g key={wall.label}>
          <rect x={wall.x} y="312" width="36" height="190" fill="url(#asm-batt)" stroke="currentColor" strokeOpacity="0.45" strokeWidth="2" />
          <g stroke="currentColor" strokeOpacity="0.45" strokeWidth="2.4">
            <line x1={wall.x + 4} y1="312" x2={wall.x + 4} y2="502" />
            <line x1={wall.x + 32} y1="312" x2={wall.x + 32} y2="502" />
          </g>
        </g>
      ))}
      {/* Interior volume */}
      <rect x="258" y="312" width="484" height="190" fill="var(--surface)" />
      {/* Window in the right wall */}
      <rect x="738" y="352" width="44" height="90" fill="var(--sky)" opacity="0.35" stroke="currentColor" strokeOpacity="0.5" strokeWidth="2" />
      <line x1="738" y1="397" x2="782" y2="397" stroke="currentColor" strokeOpacity="0.4" strokeWidth="2" />
      {/* Marriage line */}
      <line x1="500" y1="312" x2="500" y2="502" stroke="currentColor" strokeOpacity="0.16" strokeWidth="2" strokeDasharray="7 6" />
      <text x="500" y="340" textAnchor="middle" fontSize="11" fill="currentColor" opacity="0.4" fontFamily="var(--font-mono), monospace">
        marriage line
      </text>

      {/* -------- Floor system -------- */}
      <rect x="222" y="502" width="556" height="14" fill="currentColor" opacity="0.55" />
      <rect x="222" y="516" width="556" height="52" fill="url(#asm-batt)" stroke="currentColor" strokeOpacity="0.45" strokeWidth="2" />
      {/* Open-web truss chords */}
      <g stroke="currentColor" strokeOpacity="0.3" strokeWidth="1.6">
        {Array.from({ length: 13 }, (_, i) => (
          <path key={i} d={`M${240 + i * 42} 516 L${262 + i * 42} 568 L${282 + i * 42} 516`} fill="none" />
        ))}
      </g>
      <rect x="216" y="568" width="568" height="9" fill="var(--moss)" opacity="0.75" />

      {/* -------- Chassis -------- */}
      {[330, 610].map((x) => (
        <g key={x}>
          <rect x={x} y="577" width="60" height="9" fill="currentColor" opacity="0.85" />
          <rect x={x + 24} y="586" width="12" height="34" fill="currentColor" opacity="0.85" />
          <rect x={x} y="620" width="60" height="9" fill="currentColor" opacity="0.85" />
        </g>
      ))}
      <line x1="222" y1="581" x2="778" y2="581" stroke="currentColor" strokeOpacity="0.4" strokeWidth="2" />

      {/* Crawl space */}
      <rect x="222" y="629" width="556" height="11" fill="url(#asm-air)" />
      <g stroke="var(--ember)" strokeWidth="1.6">
        <line x1="180" y1="577" x2="180" y2="640" />
        <line x1="172" y1="577" x2="188" y2="577" />
        <line x1="172" y1="640" x2="188" y2="640" />
      </g>

      {/* -------- Piers, footings, anchors -------- */}
      {[262, 396, 604, 738].map((x) => (
        <g key={x}>
          <rect x={x - 26} y="586" width="52" height="54" fill="var(--surface-2)" stroke="currentColor" strokeOpacity="0.45" strokeWidth="2" />
          <line x1={x - 26} y1="604" x2={x + 26} y2="604" stroke="currentColor" strokeOpacity="0.28" strokeWidth="1.6" />
          <line x1={x - 26} y1="622" x2={x + 26} y2="622" stroke="currentColor" strokeOpacity="0.28" strokeWidth="1.6" />
          <rect x={x - 44} y="640" width="88" height="34" fill="var(--surface)" stroke="currentColor" strokeOpacity="0.5" strokeWidth="2" />
        </g>
      ))}
      {/* Anchor straps */}
      <g stroke="var(--ember)" strokeWidth="2.6" fill="none">
        <path d="M240 581 L200 674" />
        <path d="M760 581 L800 674" />
        <path d="M192 674 h16 M792 674 h16" />
      </g>

      {/* Skirting */}
      <rect x="204" y="584" width="14" height="56" fill="currentColor" opacity="0.28" />
      <rect x="782" y="584" width="14" height="56" fill="currentColor" opacity="0.28" />

      {/* Leader lines */}
      {leader(500, 152, 500, 96)}
      {leader(400, 232, 176, 232)}
      {leader(240, 400, 116, 400)}
      {leader(760, 396, 890, 396)}
      {leader(500, 542, 890, 542)}
      {leader(500, 572, 120, 572)}
      {leader(670, 581, 890, 610)}
      {leader(738, 660, 890, 690)}
      {leader(300, 634, 120, 690)}

      {/* Numbered markers */}
      {marker(500, 80, "01")}
      {marker(160, 232, "02")}
      {marker(100, 400, "03")}
      {marker(906, 396, "04")}
      {marker(906, 542, "05")}
      {marker(104, 572, "06")}
      {marker(906, 616, "07")}
      {marker(906, 696, "08")}
      {marker(104, 696, "09")}
    </svg>
  );
}

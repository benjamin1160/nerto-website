"use client";

import { useMemo, useState } from "react";
import { buttonStyles, cx } from "./ui";
import {
  AREAS,
  BY_PRICE,
  OUTSIDE_FILL,
  OVER_BUDGET_FILL,
  PAYMENT_CEILING,
  PAYMENT_FLOOR,
  PRICE_TIERS,
  UNSERVED_FILL,
  tierFill,
  type Area,
} from "@/lib/land/areas";
import { COUNTY_SHAPES } from "@/lib/land/county-shapes.generated";
import { HQ, SERVICE_RADIUS_MI, VIEW, project, starPath, toPath } from "@/lib/land/geo";
import { HIGHWAYS } from "@/lib/land/map-shapes";
import { money, shortMoney } from "@/lib/format";

const ROADS = HIGHWAYS.map((h) => ({
  ...h,
  d: toPath(h.path),
  at: project(h.labelAt[0], h.labelAt[1]),
}));

const PLACED = AREAS.map((a) => ({ ...a, ...project(a.lat, a.lon) }));

/** County outlines split by whether we price them, so they can be layered. */
const SERVED = COUNTY_SHAPES.flatMap((c) => {
  const area = c.slug ? PLACED.find((a) => a.slug === c.slug) : undefined;
  return area ? [{ ...c, area }] : [];
});
const CONTEXT = COUNTY_SHAPES.filter((c) => !c.slug);

const WATER = "var(--land-water)";
const STROKE = "var(--land-stroke)";

/** Where a marker's two label lines sit, relative to its star. */
function labelLayout(side: Area["labelSide"]) {
  switch (side) {
    case "e":
      return { anchor: "start" as const, px: 5.5, py: -0.2, nx: 5.5, ny: 4.2 };
    case "w":
      return { anchor: "end" as const, px: -5.5, py: -0.2, nx: -5.5, ny: 4.2 };
    case "n":
      return { anchor: "middle" as const, px: 0, py: -8.6, nx: 0, ny: -4.2 };
    case "s":
      return { anchor: "middle" as const, px: 0, py: 8, nx: 0, ny: 12.4 };
  }
}

/**
 * The map is the page. Counties are shaded by starting payment, every marker
 * sits at its real coordinates, and the budget slider dims whatever a visitor
 * has told us they cannot carry.
 */
export function LandMap() {
  const [selected, setSelected] = useState(BY_PRICE[0].slug);
  const [hovered, setHovered] = useState<string | null>(null);
  const [budget, setBudget] = useState(PAYMENT_CEILING);

  const active = useMemo(
    () => PLACED.find((a) => a.slug === selected) ?? PLACED[0],
    [selected],
  );
  const affordable = PLACED.filter((a) => a.startingPayment <= budget);
  const filtering = budget < PAYMENT_CEILING;
  const activeShape = SERVED.find((c) => c.slug === selected);
  const hoveredShape = SERVED.find((c) => c.slug === hovered);

  return (
    <div className="flex flex-col gap-4">
      {/* Budget filter */}
      <div className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4 sm:flex-row sm:items-center sm:gap-6 sm:p-5">
        <label htmlFor="budget-filter" className="shrink-0 text-[0.95rem] text-ink">
          What can you pay a month?
        </label>
        <input
          id="budget-filter"
          type="range"
          min={PAYMENT_FLOOR - 75}
          max={PAYMENT_CEILING}
          step={25}
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          className="land-slider h-2 w-full grow cursor-pointer appearance-none rounded-full bg-surface-2"
          aria-describedby="budget-readout"
        />
        <p id="budget-readout" className="shrink-0 text-sm text-muted" aria-live="polite">
          <span className="font-mono text-[0.95rem] tabular-nums text-ink">
            {filtering ? `${money(budget)}/mo` : "Everything"}
          </span>
          <span className="ml-2">
            {affordable.length} of {PLACED.length} counties
          </span>
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_21rem]">
        {/* ── The map ── */}
        <figure
          className="relative -mx-5 overflow-hidden border-y border-line sm:mx-0 sm:rounded-card sm:border"
          style={{ backgroundColor: WATER }}
        >
          <svg
            viewBox={VIEW.viewBox}
            className="block w-full"
            role="img"
            aria-label={`Map of ${PLACED.length} counties within ${SERVICE_RADIUS_MI} miles of ${HQ.city}, shaded and labelled by starting monthly payment.`}
          >
            <defs>
              <pattern
                id="land-grid"
                width="10"
                height="10"
                patternUnits="userSpaceOnUse"
                x={VIEW.minX}
                y={VIEW.minY}
              >
                <path
                  d="M10 0 L0 0 0 10"
                  fill="none"
                  className="stroke-ink"
                  strokeOpacity="0.06"
                  strokeWidth="0.35"
                />
              </pattern>
              <filter id="land-star-glow" x="-200%" y="-200%" width="500%" height="500%">
                <feGaussianBlur stdDeviation="2.4" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Water, then land drawn as real counties on top of it */}
            <rect
              x={VIEW.minX}
              y={VIEW.minY}
              width={VIEW.width}
              height={VIEW.height}
              style={{ fill: WATER }}
            />

            {/* Counties we do not deliver to: context, not offers */}
            <g style={{ stroke: WATER }} strokeWidth="0.35">
              {CONTEXT.map((c) => (
                <path
                  key={`${c.state}-${c.name}`}
                  d={c.d}
                  style={{ fill: c.state === "GA" ? OUTSIDE_FILL : UNSERVED_FILL }}
                />
              ))}
            </g>

            {/* Counties we price, shaded by starting payment */}
            <g style={{ stroke: STROKE }} strokeWidth="0.35">
              {SERVED.map((c) => {
                const dim = c.area.startingPayment > budget;
                const isHot = c.slug === selected || c.slug === hovered;
                return (
                  <path
                    key={c.slug}
                    d={c.d}
                    style={{
                      fill: dim ? OVER_BUDGET_FILL : tierFill(c.area.startingPayment),
                    }}
                    className="cursor-pointer outline-none"
                    fillOpacity={dim ? 0.9 : isHot ? 1 : 0.92}
                    tabIndex={0}
                    role="button"
                    aria-pressed={c.slug === selected}
                    aria-label={`${c.area.county} County, ${c.area.miles} miles, from ${money(
                      c.area.startingPayment,
                    )} a month`}
                    onClick={() => setSelected(c.slug!)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelected(c.slug!);
                      }
                    }}
                    onMouseEnter={() => setHovered(c.slug)}
                    onMouseLeave={() => setHovered(null)}
                    onFocus={() => setHovered(c.slug)}
                    onBlur={() => setHovered(null)}
                  />
                );
              })}
            </g>

            {/* Everything below is decoration — never swallow a click */}
            <g pointerEvents="none">
              <rect
                x={VIEW.minX}
                y={VIEW.minY}
                width={VIEW.width}
                height={VIEW.height}
                fill="url(#land-grid)"
              />

              {/* Selected and hovered outlines, re-stroked above every fill */}
              {activeShape && (
                <path
                  d={activeShape.d}
                  fill="none"
                  className="stroke-ember"
                  strokeWidth="1.3"
                  strokeLinejoin="round"
                />
              )}
              {hoveredShape && hovered !== selected && (
                <path
                  d={hoveredShape.d}
                  fill="none"
                  className="stroke-ink"
                  strokeOpacity="0.55"
                  strokeWidth="0.9"
                  strokeLinejoin="round"
                />
              )}

              <text
                x={project(30.95, -83.15).x}
                y={project(30.95, -83.15).y}
                className="fill-muted font-sans"
                fontSize="4.4"
                letterSpacing="1.2"
              >
                GEORGIA
              </text>

              {/* Interstates */}
              <g fill="none" className="stroke-ink" strokeOpacity="0.18" strokeWidth="0.9">
                {ROADS.map((r) => (
                  <path key={r.id} d={r.d} />
                ))}
              </g>
              {ROADS.map((r) => (
                <g key={`${r.id}-label`}>
                  <rect
                    x={r.at.x - 3.4}
                    y={r.at.y - 2.6}
                    width="6.8"
                    height="5.2"
                    rx="1.4"
                    style={{ fill: "var(--surface)" }}
                    className="stroke-ink"
                    strokeOpacity="0.25"
                    strokeWidth="0.4"
                  />
                  <text
                    x={r.at.x}
                    y={r.at.y + 1.3}
                    textAnchor="middle"
                    fontSize="3.6"
                    className="fill-muted font-sans"
                  >
                    {r.label}
                  </text>
                </g>
              ))}

              {/* Distance rings */}
              {[25, 50, 75].map((r) => (
                <circle
                  key={r}
                  r={r}
                  fill="none"
                  className="stroke-ink"
                  strokeOpacity="0.16"
                  strokeWidth="0.5"
                  strokeDasharray="2 3"
                />
              ))}
              <circle
                r={SERVICE_RADIUS_MI}
                fill="none"
                className="stroke-ember"
                strokeOpacity="0.7"
                strokeWidth="1.1"
                strokeDasharray="6 3.5"
              />
              <text
                x={-0.78 * 50}
                y={0.63 * 50}
                textAnchor="middle"
                fontSize="3.8"
                letterSpacing="0.8"
                className="fill-muted font-sans"
              >
                50 MILES
              </text>
              <text
                x={-0.72 * (SERVICE_RADIUS_MI + 18)}
                y={0.69 * (SERVICE_RADIUS_MI + 18)}
                textAnchor="middle"
                fontSize="4.6"
                letterSpacing="0.8"
                className="fill-ember font-sans font-bold"
              >
                {SERVICE_RADIUS_MI} MILES
              </text>
              <text
                x={-0.72 * (SERVICE_RADIUS_MI + 18)}
                y={0.69 * (SERVICE_RADIUS_MI + 18) + 5.6}
                textAnchor="middle"
                fontSize="3.4"
                letterSpacing="0.5"
                className="fill-ember/70 font-sans"
              >
                WE DELIVER TO HERE
              </text>

              {/* The lot */}
              <circle r="7" className="fill-gold" fillOpacity="0.16" />
              <circle r="2.6" className="fill-gold" />
              <circle
                r="4.6"
                fill="none"
                className="stroke-gold"
                strokeOpacity="0.7"
                strokeWidth="0.6"
              />

              {/* Stars and price labels, above every fill */}
              {PLACED.map((a) => {
                const dim = a.startingPayment > budget;
                const isActive = a.slug === selected;
                const isHot = isActive || a.slug === hovered;
                const L = labelLayout(a.labelSide);
                return (
                  <g
                    key={a.slug}
                    transform={`translate(${a.x.toFixed(2)} ${a.y.toFixed(2)})`}
                    className={dim ? "opacity-40" : "opacity-100"}
                  >
                    {isActive && (
                      <circle
                        r="8.5"
                        fill="none"
                        className="animate-ping-slow origin-center stroke-ember"
                        strokeOpacity="0.55"
                        strokeWidth="0.8"
                      />
                    )}
                    <path
                      d={starPath(0, 0, isHot ? 4.4 : 3.4)}
                      className={cx("transition-all", dim ? "fill-muted" : "fill-ember")}
                      style={{ stroke: STROKE }}
                      strokeWidth="0.5"
                      filter={isHot ? "url(#land-star-glow)" : undefined}
                    />
                    {/* Haloed so labels stay legible over any county shade */}
                    <g
                      transform={`translate(${a.dx ?? 0} ${a.dy ?? 0})`}
                      style={{ stroke: "var(--surface)" }}
                      strokeWidth="0.9"
                      strokeOpacity="0.9"
                      strokeLinejoin="round"
                      paintOrder="stroke"
                      className={isActive ? "" : "hidden sm:block"}
                    >
                      <text
                        x={L.px}
                        y={L.py}
                        textAnchor={L.anchor}
                        style={{ fill: "var(--land-price)" }}
                        className="font-sans text-[6.6px] font-bold tabular-nums sm:text-[4.6px]"
                      >
                        {money(a.startingPayment)}
                        <tspan className="fill-muted text-[4px] sm:text-[2.9px]">/mo</tspan>
                      </text>
                      <text
                        x={L.nx}
                        y={L.ny}
                        textAnchor={L.anchor}
                        letterSpacing="0.3"
                        className={cx(
                          "text-[4.4px] sm:text-[3.1px]",
                          isHot ? "fill-ink" : "fill-ink/70",
                        )}
                      >
                        {a.county.toUpperCase()}
                      </text>
                    </g>
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Legend: the sequential scale as one bar, then the marks */}
          <figcaption className="border-t border-line bg-surface px-4 py-3">
            <p className="eyebrow">Shaded by starting payment</p>
            <ul className="mt-2 flex flex-wrap gap-x-0.5 gap-y-2">
              {PRICE_TIERS.map((t) => (
                <li key={t.label} className="min-w-[5.5rem] flex-1">
                  <span
                    aria-hidden
                    className="block h-2.5 rounded-sm"
                    style={{ backgroundColor: t.fill }}
                  />
                  <span className="mt-1 block text-[0.7rem] leading-tight text-muted">
                    {t.label}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-2.5 text-xs text-muted">
              <span className="inline-flex items-center gap-2">
                <svg viewBox="-6 -6 12 12" className="size-3.5">
                  <path d={starPath(0, 0, 5.5)} className="fill-ember" />
                </svg>
                County seat
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-gold" />
                Our lot in {HQ.city}
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-0 w-5 border-t-2 border-dashed border-ember/70" />
                {SERVICE_RADIUS_MI}-mile delivery radius
              </span>
              <span className="inline-flex items-center gap-2">
                <span
                  aria-hidden
                  className="h-3 w-5 rounded-sm ring-1 ring-inset ring-line-strong"
                  style={{ backgroundColor: UNSERVED_FILL }}
                />
                Not served
              </span>
            </div>
          </figcaption>
        </figure>

        {/* ── Detail card ── */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-card border border-line bg-surface p-5">
            <p className="eyebrow">
              {active.miles === 0 ? "Right here" : `${active.miles} miles out`}
            </p>
            <h3 className="mt-2 font-display text-3xl tracking-tight text-ink">
              {active.county} County
            </h3>
            <p className="mt-1 text-sm text-muted">
              {[active.seat, ...active.towns].slice(0, 4).join(" · ")}
            </p>

            <div className="mt-5 rounded-2xl border border-line bg-surface-2 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-muted">
                {active.lotTypical} + doublewide, one loan
              </p>
              <p className="mt-1 font-display text-4xl leading-none tracking-tight text-ink">
                {money(active.startingPayment)}
                <span className="font-sans text-base font-normal text-muted">/mo</span>
              </p>
              <p className="mt-1 text-xs text-muted">estimated starting payment</p>
            </div>

            <dl className="mt-4 text-sm">
              <div className="flex items-baseline justify-between gap-3 border-b border-line py-2.5">
                <dt className="text-muted">Typical lot price</dt>
                <dd className="font-mono text-ink">
                  {shortMoney(active.land.low)} – {shortMoney(active.land.high)}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-3 border-b border-line py-2.5">
                <dt className="text-muted">Parcel size</dt>
                <dd className="font-mono text-ink">{active.lotTypical}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-3 py-2.5">
                <dt className="text-muted">From our lot</dt>
                <dd className="font-mono text-ink">{active.miles} miles</dd>
              </div>
            </dl>

            <p className="mt-3 text-sm leading-relaxed text-muted">{active.note}</p>

            <a
              href="#pre-approval"
              className={cx(buttonStyles.primary, "mt-5 w-full text-center")}
            >
              Get pre-approved for {active.county}
            </a>
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-3">
            {[
              ["Counties served", String(PLACED.length)],
              ["Cheapest way in", `${money(BY_PRICE[0].startingPayment)}/mo`],
              ["Lots from", shortMoney(Math.min(...PLACED.map((a) => a.land.low)))],
              ["Loans needed", "1"],
            ].map(([k, v]) => (
              <div key={k} className="rounded-2xl border border-line bg-surface p-3">
                <dt className="eyebrow">{k}</dt>
                <dd className="mt-1 font-display text-xl tracking-tight text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>

      {/* ── Full price list ── */}
      <div>
        <h3 className="eyebrow mb-3">Every county, cheapest way in first</h3>
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {BY_PRICE.map((a) => {
            const dim = a.startingPayment > budget;
            const isActive = a.slug === selected;
            return (
              <li key={a.slug}>
                <button
                  type="button"
                  onClick={() => setSelected(a.slug)}
                  onMouseEnter={() => setHovered(a.slug)}
                  onMouseLeave={() => setHovered(null)}
                  aria-pressed={isActive}
                  className={cx(
                    "flex w-full items-stretch gap-2.5 rounded-2xl border p-3 text-left transition-colors",
                    isActive
                      ? "border-ember bg-surface"
                      : "border-line bg-surface hover:border-line-strong",
                    dim && "opacity-40",
                  )}
                >
                  <span
                    aria-hidden
                    className="w-1 shrink-0 rounded-full"
                    style={{ backgroundColor: tierFill(a.startingPayment) }}
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-sm text-ink">{a.county}</span>
                    <span className="block font-display text-lg tracking-tight text-ink">
                      {money(a.startingPayment)}
                      <span className="font-sans text-[0.6em] font-normal text-muted">/mo</span>
                    </span>
                    <span className="block text-xs text-muted">{a.miles} mi</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

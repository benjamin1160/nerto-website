"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { SizeCategories } from "./size-categories";
import { ListingCard, ListingRow } from "./listing-card";
import { buttonStyles, cx, Icon } from "./ui";
import { money } from "@/lib/format";
import {
  constructionLabels,
  constructionOrder,
  hasPrices,
  priceBounds,
  sectionLabels,
  sectionsOrder,
  sizeCategoryOf,
  styleLabels,
  styleOrder,
  type Listing,
  type SizeCategory,
} from "@/lib/homes";

const ALL_SORTS = [
  { id: "featured", label: "Featured first" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
  { id: "sqft-desc", label: "Largest first" },
  { id: "newest", label: "Newest listings" },
] as const;

type SortId = (typeof ALL_SORTS)[number]["id"];

/* Sorting and filtering by price only make sense once something is priced. */
const SORTS = ALL_SORTS.filter((s) => hasPrices || !s.id.startsWith("price"));

const SIZES: SizeCategory[] = ["tiny", "single", "double", "triple", "modular"];

const STEP = 2500;
const FLOOR = hasPrices ? Math.floor(priceBounds.min / STEP) * STEP : 0;
const CEIL = hasPrices ? Math.ceil(priceBounds.max / STEP) * STEP : 0;

type Filters = {
  q: string;
  /** The primary facet: tiny / single / double / triple. Null is "any". */
  size: SizeCategory | null;
  /** How it is built — manufactured or modular. A `construction` value. */
  types: string[];
  series: string[];
  sections: string[];
  styles: string[];
  beds: number;
  baths: number;
  min: number;
  max: number;
  availableOnly: boolean;
  sort: SortId;
};

const EMPTY: Filters = {
  q: "",
  size: null,
  types: [],
  series: [],
  sections: [],
  styles: [],
  beds: 0,
  baths: 0,
  min: FLOOR,
  max: CEIL,
  availableOnly: false,
  sort: "featured",
};

function fromParams(params: URLSearchParams): Filters {
  const list = (k: string) => (params.get(k) ? params.get(k)!.split(",").filter(Boolean) : []);
  const int = (k: string, fallback: number) => {
    const raw = params.get(k);
    const v = Number(raw);
    return raw !== null && Number.isFinite(v) ? v : fallback;
  };
  const sort = params.get("sort") as SortId | null;
  return {
    q: params.get("q") ?? "",
    size: SIZES.includes(params.get("size") as SizeCategory)
      ? (params.get("size") as SizeCategory)
      : null,
    types: list("type"),
    series: list("series"),
    sections: list("sections"),
    styles: list("style"),
    beds: int("beds", 0),
    baths: int("baths", 0),
    min: Math.min(Math.max(int("min", FLOOR), FLOOR), CEIL),
    max: Math.min(Math.max(int("max", CEIL), FLOOR), CEIL),
    availableOnly: params.get("available") === "1",
    sort: SORTS.some((s) => s.id === sort) ? (sort as SortId) : "featured",
  };
}

function toParams(f: Filters): string {
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  if (f.size) p.set("size", f.size);
  if (f.types.length) p.set("type", f.types.join(","));
  if (f.series.length) p.set("series", f.series.join(","));
  if (f.sections.length) p.set("sections", f.sections.join(","));
  if (f.styles.length) p.set("style", f.styles.join(","));
  if (f.beds) p.set("beds", String(f.beds));
  if (f.baths) p.set("baths", String(f.baths));
  if (f.min !== FLOOR) p.set("min", String(f.min));
  if (f.max !== CEIL) p.set("max", String(f.max));
  if (f.availableOnly) p.set("available", "1");
  if (f.sort !== "featured") p.set("sort", f.sort);
  return p.toString();
}

function activeCount(f: Filters) {
  return (
    (f.q ? 1 : 0) +
    (f.size ? 1 : 0) +
    f.types.length +
    f.series.length +
    f.sections.length +
    f.styles.length +
    (f.beds ? 1 : 0) +
    (f.baths ? 1 : 0) +
    (f.min !== FLOOR || f.max !== CEIL ? 1 : 0) +
    (f.availableOnly ? 1 : 0)
  );
}

/** The multi-select facets, each of which can be lifted out when counting. */
type FacetId = "types" | "series" | "sections" | "styles";

/**
 * Whether a home survives the filters.
 *
 * `except` lifts one facet out. That is what makes the count on each pill
 * mean "how many homes you would get if you pressed this" rather than "how
 * many there are in the whole catalogue" — a facet is counted against every
 * other filter but not against itself, so pressing a second value inside one
 * group widens the result the way the numbers say it will.
 */
function matches(l: Listing, f: Filters, except?: FacetId): boolean {
  if (f.availableOnly && l.status !== "available") return false;
  if (f.size && sizeCategoryOf(l) !== f.size) return false;
  if (except !== "types" && f.types.length && !(l.construction && f.types.includes(l.construction)))
    return false;
  if (except !== "series" && f.series.length && !(l.series && f.series.includes(l.series)))
    return false;
  if (except !== "sections" && f.sections.length && !(l.sections && f.sections.includes(l.sections)))
    return false;
  if (except !== "styles" && f.styles.length && !(l.style && f.styles.includes(l.style)))
    return false;
  if (l.beds < f.beds) return false;
  if (l.baths < f.baths) return false;
  /* A home with no published price is not excluded by the price range — it
     has no price to fall outside it. */
  if (l.price !== undefined && (l.price < f.min || l.price > f.max)) return false;
  const q = f.q.trim().toLowerCase();
  if (q) {
    const hay = [l.name, l.series, l.model, l.tagline, l.style && styleLabels[l.style]]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

type Facet = { value: string; label: string };

/**
 * The options in one group, in the given order, minus the values no home in
 * the catalogue carries.
 *
 * A pill nothing can match is worse than no pill: it reads as a working
 * filter, and pressing it empties the page. This lot has no triple-section
 * plans and only two of the six architectural styles, so five of the nine
 * pills at the foot of the rail did nothing but that.
 */
function facetsPresent<T extends string>(
  from: Listing[],
  pick: (l: Listing) => T | undefined,
  order: readonly T[],
  label: (v: T) => string,
): Facet[] {
  const present = new Set(from.map(pick).filter(Boolean) as T[]);
  return order.filter((v) => present.has(v)).map((v) => ({ value: v, label: label(v) }));
}

function FilterGroup({
  title,
  hint,
  children,
}: {
  title: string;
  /** One short line under the title, where the group needs a caveat. */
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-line py-6 first:border-t-0 first:pt-0">
      <h3 className="eyebrow">{title}</h3>
      {hint && <p className="mt-1.5 text-[0.76rem] leading-snug text-muted">{hint}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Pill({
  active,
  count,
  onClick,
  children,
}: {
  active: boolean;
  /** How many homes this pill would leave. Omitted where it means nothing. */
  count?: number;
  onClick: () => void;
  children: React.ReactNode;
}) {
  /* Nothing to select. It stays on the page — losing a pill as you filter is
     disorienting — but it says zero and cannot be pressed. */
  const dead = count === 0 && !active;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={dead}
      aria-pressed={active}
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[0.8rem] transition-all duration-200",
        active
          ? "border-ink bg-ink text-paper"
          : dead
            ? "cursor-not-allowed border-line text-muted opacity-55"
            : "border-line-strong text-ink-soft hover:border-ink hover:text-ink",
      )}
    >
      {children}
      {count !== undefined && (
        <span
          className={cx("font-mono text-[0.68rem]", active ? "text-paper/70" : "text-muted")}
        >
          {count}
        </span>
      )}
    </button>
  );
}

export function ListingsBrowser({ listings }: { listings: Listing[] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<Filters>(() =>
    fromParams(new URLSearchParams(searchParams.toString())),
  );
  const [view, setView] = useState<"grid" | "list">("grid");
  const [drawerOpen, setDrawerOpen] = useState(false);

  /* Keep the address bar shareable. The native History API is used rather
     than router.replace so filtering never triggers an RSC round trip — and
     never competes with a real <Link> navigation the reader just started. */
  useEffect(() => {
    const qs = toParams(filters);
    const next = qs ? `${pathname}?${qs}` : pathname;
    if (window.location.pathname + window.location.search !== next) {
      window.history.replaceState(null, "", next);
    }
  }, [filters, pathname]);

  const set = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    setFilters((f) => ({ ...f, [key]: value }));

  const toggleIn = (key: FacetId, value: string) =>
    setFilters((f) => ({
      ...f,
      [key]: f[key].includes(value) ? f[key].filter((v) => v !== value) : [...f[key], value],
    }));

  /* The options each group offers, taken from the catalogue rather than from
     the type — see `facetsPresent`. */
  const facets = useMemo(
    () => ({
      types: facetsPresent(
        listings,
        (l) => l.construction,
        constructionOrder,
        (v) => constructionLabels[v],
      ),
      series: facetsPresent(
        listings,
        (l) => l.series,
        [...new Set(listings.map((l) => l.series).filter(Boolean) as string[])].sort(),
        (v) => v,
      ),
      sections: facetsPresent(
        listings,
        (l) => l.sections,
        sectionsOrder,
        (v) => sectionLabels[v].replace("-section", ""),
      ),
      styles: facetsPresent(listings, (l) => l.style, styleOrder, (v) => styleLabels[v]),
    }),
    [listings],
  );

  /* Two of these groups filter on a field not every plan carries — the
     modulars publish no section count, and only some plans are filed by
     style. Say so under the title rather than letting the numbers look
     broken. */
  const [sectionsHint, stylesHint] = useMemo(() => {
    const outside = (missing: number, what: string) =>
      missing === 0
        ? undefined
        : `${missing} plan${missing === 1 ? "" : "s"} in the catalogue ${
            missing === 1 ? "has" : "have"
          } no ${what} and ${missing === 1 ? "sits" : "sit"} outside this filter.`;
    return [
      outside(listings.filter((l) => !l.sections).length, "published section count"),
      outside(listings.filter((l) => !l.style).length, "style on file"),
    ];
  }, [listings]);

  /* How many homes sit behind each pill, given everything else selected. */
  const counts = useMemo(() => {
    const tally = (facet: FacetId, pick: (l: Listing) => string | undefined) => {
      const out = new Map<string, number>();
      for (const l of listings) {
        const value = pick(l);
        if (!value || !matches(l, filters, facet)) continue;
        out.set(value, (out.get(value) ?? 0) + 1);
      }
      return out;
    };
    return {
      types: tally("types", (l) => l.construction),
      series: tally("series", (l) => l.series),
      sections: tally("sections", (l) => l.sections),
      styles: tally("styles", (l) => l.style),
    };
  }, [listings, filters]);

  const results = useMemo(() => {
    const order = listings.filter((l) => matches(l, filters));
    /* Unknowns sort last in every order rather than sorting as zero, which
       would float unpriced homes to the top of "price: low to high". */
    const byPrice = (dir: 1 | -1) => (a: Listing, b: Listing) => {
      if (a.price === undefined) return b.price === undefined ? 0 : 1;
      if (b.price === undefined) return -1;
      return (a.price - b.price) * dir;
    };
    const age = (l: Listing) => l.daysListed ?? Number.MAX_SAFE_INTEGER;
    switch (filters.sort) {
      case "price-asc":
        order.sort(byPrice(1));
        break;
      case "price-desc":
        order.sort(byPrice(-1));
        break;
      case "sqft-desc":
        order.sort((a, b) => b.sqft - a.sqft);
        break;
      case "newest":
        order.sort((a, b) => age(a) - age(b));
        break;
      default:
        order.sort(
          (a, b) => Number(!!b.featured) - Number(!!a.featured) || age(a) - age(b),
        );
    }
    return order;
  }, [listings, filters]);

  const count = activeCount(filters);

  /* An empty catalogue is not an over-tight filter, so it does not get the
     filter rail and a "reset filters" button that cannot help. Every hook
     above this line runs either way. */
  if (listings.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line-strong px-8 py-24 text-center">
        <p className="font-display text-3xl tracking-tight text-ink">
          Nothing listed online yet.
        </p>
        <p className="mx-auto mt-4 max-w-md text-muted">
          We are not publishing inventory on this site at the moment. Tell us the size, the
          budget and where the home is going, and we will tell you what we can put on it.
        </p>
        <Link href="/contact" className={cx(buttonStyles.primary, "mt-8")}>
          Tell us what you&apos;re after
        </Link>
      </div>
    );
  }

  const panel = (
    <div>
      <FilterGroup title="Search">
        <input
          type="search"
          value={filters.q}
          onChange={(e) => set("q", e.target.value)}
          placeholder="Name, model, style…"
          aria-label="Search homes"
          className="w-full rounded-full border border-line-strong bg-paper px-4 py-2.5 text-sm text-ink placeholder:text-muted focus:border-ink focus:outline-none"
        />
      </FilterGroup>

      {hasPrices && (
      <FilterGroup title="Price">
        <div className="flex items-baseline justify-between font-mono text-[0.78rem] text-ink">
          <span>{money(filters.min)}</span>
          <span className="text-muted">to</span>
          <span>{money(filters.max)}</span>
        </div>
        <label className="mt-4 block">
          <span className="sr-only">Minimum price</span>
          <input
            type="range"
            min={FLOOR}
            max={CEIL}
            step={STEP}
            value={filters.min}
            onChange={(e) => set("min", Math.min(Number(e.target.value), filters.max))}
            className="w-full accent-[var(--ember)]"
          />
        </label>
        <label className="mt-1 block">
          <span className="sr-only">Maximum price</span>
          <input
            type="range"
            min={FLOOR}
            max={CEIL}
            step={STEP}
            value={filters.max}
            onChange={(e) => set("max", Math.max(Number(e.target.value), filters.min))}
            className="w-full accent-[var(--ember)]"
          />
        </label>
      </FilterGroup>
      )}

      {facets.types.length > 1 && (
        <FilterGroup
          title="Home type"
          hint="How it is built and inspected — not how wide it is. Modulars are built to the same state code as a site-built house."
        >
          <div className="flex flex-wrap gap-2">
            {facets.types.map((t) => (
              <Pill
                key={t.value}
                active={filters.types.includes(t.value)}
                count={counts.types.get(t.value) ?? 0}
                onClick={() => toggleIn("types", t.value)}
              >
                {t.label}
              </Pill>
            ))}
          </div>
        </FilterGroup>
      )}

      <FilterGroup title="Bedrooms">
        <div className="flex flex-wrap gap-2">
          {[0, 2, 3, 4].map((n) => (
            <Pill key={n} active={filters.beds === n} onClick={() => set("beds", n)}>
              {n === 0 ? "Any" : `${n}+`}
            </Pill>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Bathrooms">
        <div className="flex flex-wrap gap-2">
          {[0, 2, 3].map((n) => (
            <Pill key={n} active={filters.baths === n} onClick={() => set("baths", n)}>
              {n === 0 ? "Any" : `${n}+`}
            </Pill>
          ))}
        </div>
      </FilterGroup>

      {facets.series.length > 1 && (
        <FilterGroup title="Series">
          <div className="flex flex-wrap gap-2">
            {facets.series.map((f) => (
              <Pill
                key={f.value}
                active={filters.series.includes(f.value)}
                count={counts.series.get(f.value) ?? 0}
                onClick={() => toggleIn("series", f.value)}
              >
                {f.label}
              </Pill>
            ))}
          </div>
        </FilterGroup>
      )}

      {facets.sections.length > 1 && (
        <FilterGroup title="Sections" hint={sectionsHint}>
          <div className="flex flex-wrap gap-2">
            {facets.sections.map((f) => (
              <Pill
                key={f.value}
                active={filters.sections.includes(f.value)}
                count={counts.sections.get(f.value) ?? 0}
                onClick={() => toggleIn("sections", f.value)}
              >
                {f.label}
              </Pill>
            ))}
          </div>
        </FilterGroup>
      )}

      {facets.styles.length > 1 && (
        <FilterGroup title="Style" hint={stylesHint}>
          <div className="flex flex-wrap gap-2">
            {facets.styles.map((f) => (
              <Pill
                key={f.value}
                active={filters.styles.includes(f.value)}
                count={counts.styles.get(f.value) ?? 0}
                onClick={() => toggleIn("styles", f.value)}
              >
                {f.label}
              </Pill>
            ))}
          </div>
        </FilterGroup>
      )}

      <FilterGroup title="Availability">
        <label className="flex cursor-pointer items-center gap-3 text-sm text-ink-soft">
          <input
            type="checkbox"
            checked={filters.availableOnly}
            onChange={(e) => set("availableOnly", e.target.checked)}
            className="size-4 accent-[var(--ember)]"
          />
          Hide sold and pending
        </label>
      </FilterGroup>

      {count > 0 && (
        <button
          type="button"
          onClick={() => setFilters(EMPTY)}
          className={cx(buttonStyles.small, "w-full")}
        >
          <Icon.Close className="size-3.5" />
          Clear {count} filter{count > 1 ? "s" : ""}
        </button>
      )}
    </div>
  );

  return (
    <div className="grid gap-10 lg:grid-cols-[16.5rem_minmax(0,1fr)] lg:gap-14">
      <aside className="hidden lg:block">
        <div className="sticky top-28">{panel}</div>
      </aside>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close filters"
          />
          <div className="relative ml-auto flex h-full w-[min(22rem,88vw)] flex-col overflow-y-auto bg-paper p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-2xl text-ink">Filters</h2>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="grid size-9 place-items-center rounded-full border border-line-strong text-ink"
                aria-label="Close filters"
              >
                <Icon.Close className="size-4" />
              </button>
            </div>
            {panel}
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className={cx(buttonStyles.primary, "mt-6 w-full")}
            >
              Show {results.length} home{results.length === 1 ? "" : "s"}
            </button>
          </div>
        </div>
      )}

      <div className="min-w-0">
        {/* The primary facet, above everything else and in the main column
            rather than the filter rail — this is how most people shop. */}
        <SizeCategories
          from={listings}
          active={filters.size}
          onSelect={(size) => set("size", size)}
          className="mb-8"
        />

        <div className="sticky top-[var(--chrome-h)] z-20 -mx-5 mb-8 flex flex-wrap items-center gap-3 border-b border-line bg-paper/90 px-5 py-4 backdrop-blur-xl sm:-mx-8 sm:px-8 lg:mx-0 lg:rounded-full lg:border lg:px-6">
          <p className="font-mono text-[0.78rem] uppercase tracking-[0.14em] text-muted">
            <span className="text-ink">{results.length}</span> of {listings.length} homes
          </p>

          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className={cx(buttonStyles.small, "ml-auto lg:hidden")}
          >
            <Icon.Sliders className="size-4" />
            Filters
            {count > 0 && (
              <span className="grid size-5 place-items-center rounded-full bg-ember font-mono text-[0.6rem] text-on-ember">
                {count}
              </span>
            )}
          </button>

          <div className="ml-auto flex items-center gap-2 max-lg:ml-0">
            <label className="flex items-center gap-2">
              <span className="sr-only">Sort homes</span>
              <select
                value={filters.sort}
                onChange={(e) => set("sort", e.target.value as SortId)}
                className="cursor-pointer rounded-full border border-line-strong bg-paper px-3.5 py-1.5 text-[0.8rem] text-ink focus:border-ink focus:outline-none"
              >
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="hidden items-center rounded-full border border-line-strong p-0.5 sm:flex">
              {(
                [
                  { id: "grid", icon: Icon.Grid, label: "Grid view" },
                  { id: "list", icon: Icon.Rows, label: "List view" },
                ] as const
              ).map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setView(v.id)}
                  aria-pressed={view === v.id}
                  aria-label={v.label}
                  className={cx(
                    "grid size-8 place-items-center rounded-full transition-colors",
                    view === v.id ? "bg-ink text-paper" : "text-muted hover:text-ink",
                  )}
                >
                  <v.icon className="size-4" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {results.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line-strong px-8 py-24 text-center">
            <p className="font-display text-3xl tracking-tight text-ink">
              Nothing matches that yet.
            </p>
            <p className="mx-auto mt-4 max-w-md text-muted">
              We build to order too — if the home you want isn&apos;t on the lot it can be in
              the plant in a fortnight. Loosen a filter, or tell us what you&apos;re after.
            </p>
            <button
              type="button"
              onClick={() => setFilters(EMPTY)}
              className={cx(buttonStyles.primary, "mt-8")}
            >
              Reset filters
            </button>
          </div>
        ) : view === "grid" ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((l) => (
              <ListingCard key={l.slug} listing={l} className="h-full" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {results.map((l) => (
              <ListingRow key={l.slug} listing={l} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

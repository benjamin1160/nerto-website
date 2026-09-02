"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { SizeCategories } from "./size-categories";
import { ListingCard, ListingRow } from "./listing-card";
import { buttonStyles, cx, Icon } from "./ui";
import { money } from "@/lib/format";
import {
  hasPrices,
  priceBounds,
  sectionLabels,
  seriesList,
  sizeCategoryOf,
  styleLabels,
  type ArchStyle,
  type Listing,
  type Sections,
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

const SERIES = seriesList;
const SECTIONS: Sections[] = ["single", "double", "triple"];
const SIZES: SizeCategory[] = ["tiny", "single", "double", "triple"];
const STYLES = Object.keys(styleLabels) as ArchStyle[];

const STEP = 2500;
const FLOOR = hasPrices ? Math.floor(priceBounds.min / STEP) * STEP : 0;
const CEIL = hasPrices ? Math.ceil(priceBounds.max / STEP) * STEP : 0;

type Filters = {
  q: string;
  /** The primary facet: tiny / single / double / triple. Null is "any". */
  size: SizeCategory | null;
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
    f.series.length +
    f.sections.length +
    f.styles.length +
    (f.beds ? 1 : 0) +
    (f.baths ? 1 : 0) +
    (f.min !== FLOOR || f.max !== CEIL ? 1 : 0) +
    (f.availableOnly ? 1 : 0)
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-line py-6 first:border-t-0 first:pt-0">
      <h3 className="eyebrow">{title}</h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cx(
        "rounded-full border px-3.5 py-1.5 text-[0.8rem] transition-all duration-200",
        active
          ? "border-ink bg-ink text-paper"
          : "border-line-strong text-ink-soft hover:border-ink hover:text-ink",
      )}
    >
      {children}
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

  const toggleIn = (key: "series" | "sections" | "styles", value: string) =>
    setFilters((f) => ({
      ...f,
      [key]: f[key].includes(value) ? f[key].filter((v) => v !== value) : [...f[key], value],
    }));

  const results = useMemo(() => {
    const q = filters.q.trim().toLowerCase();

    const filtered = listings.filter((l) => {
      if (filters.availableOnly && l.status !== "available") return false;
      if (filters.size && sizeCategoryOf(l) !== filters.size) return false;
      if (filters.series.length && !(l.series && filters.series.includes(l.series))) return false;
      if (filters.sections.length && !(l.sections && filters.sections.includes(l.sections)))
        return false;
      if (filters.styles.length && !(l.style && filters.styles.includes(l.style))) return false;
      if (l.beds < filters.beds) return false;
      if (l.baths < filters.baths) return false;
      /* A home with no published price is not excluded by the price range —
         it has no price to fall outside it. */
      if (l.price !== undefined && (l.price < filters.min || l.price > filters.max)) return false;
      if (q) {
        const hay = [l.name, l.series, l.model, l.tagline, l.style && styleLabels[l.style]]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    const order = [...filtered];
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

      {SERIES.length > 0 && (
      <FilterGroup title="Series">
        <div className="flex flex-wrap gap-2">
          {SERIES.map((s) => (
            <Pill key={s} active={filters.series.includes(s)} onClick={() => toggleIn("series", s)}>
              {s}
            </Pill>
          ))}
        </div>
      </FilterGroup>
      )}

      <FilterGroup title="Sections">
        <div className="flex flex-wrap gap-2">
          {SECTIONS.map((s) => (
            <Pill
              key={s}
              active={filters.sections.includes(s)}
              onClick={() => toggleIn("sections", s)}
            >
              {sectionLabels[s].replace("-section", "")}
            </Pill>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Style">
        <div className="flex flex-wrap gap-2">
          {STYLES.map((s) => (
            <Pill key={s} active={filters.styles.includes(s)} onClick={() => toggleIn("styles", s)}>
              {styleLabels[s]}
            </Pill>
          ))}
        </div>
      </FilterGroup>

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
              We build to order too — if the plan you want isn&apos;t on the lot it can be in
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

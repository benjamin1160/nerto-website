import { floorPlans, type FloorPlan } from "./floor-plans";

export type ListingStatus = "available" | "pending" | "sold" | "coming-soon";
export type Sections = "single" | "double" | "triple";
export type ArchStyle =
  | "farmhouse"
  | "craftsman"
  | "modern"
  | "coastal"
  | "lodge"
  | "ranch";
export type SceneKind =
  | "exterior"
  | "living"
  | "kitchen"
  | "bedroom"
  | "bath"
  | "porch";

export type Scene = { kind: SceneKind; caption: string };

export type FeatureGroup = { group: string; items: string[] };

/**
 * A home in the catalogue.
 *
 * Required fields are the ones a listing cannot mean anything without. The
 * rest are optional because real inventory arrives incomplete: a
 * manufacturer's spec sheet may carry dimensions but no price, an imported
 * feed may carry photographs but no floor plan. Every field below that can
 * be absent is absent from the UI too — nothing is faked to fill a slot,
 * and nothing renders as a blank or a zero.
 */
export type Listing = {
  slug: string;
  name: string;
  beds: number;
  baths: number;
  sqft: number;
  status: ListingStatus;
  scenes: Scene[];

  /** Product line, e.g. "Elite". Free text — the facet list derives from it. */
  series?: string;
  /** Manufacturer's model code. */
  model?: string;
  /** Absent means the home is priced on enquiry; the UI says so. */
  price?: number;
  /** Optional pre-discount price; renders as a strikethrough. */
  wasPrice?: number;
  sections?: Sections;
  /** Transport dimensions in feet, e.g. 28 × 60. */
  widthFt?: number;
  lengthFt?: number;
  year?: number;
  communitySlug?: string;
  style?: ArchStyle;
  tagline?: string;
  story?: string[];
  highlights?: string[];
  features?: FeatureGroup[];
  planId?: keyof typeof floorPlans;
  /** HERS index — lower is better. A new stick-built home scores ~100. */
  hers?: number;
  featured?: boolean;
  /** Days the listing has been on market, used for the "new" badge. */
  daysListed?: number;
  /** Matterport walkthrough. */
  tourUrl?: string;
  /** Where this listing was imported from, for re-checking against source. */
  sourceUrl?: string;
};

/**
 * Shorthand for a listing's scene list: `scenes(["exterior", "Front
 * elevation"], ["kitchen", "Kitchen"])`. Exported rather than local because
 * the catalogue below is empty and nothing in this file calls it yet — it is
 * the first thing a new listing needs.
 */
export const scenes = (...kinds: [SceneKind, string][]): Scene[] =>
  kinds.map(([kind, caption]) => ({ kind, caption }));

/* ------------------------------------------------------------------ *
 * The catalogue — empty
 *
 * NERTO does not publish a home inventory. Its own site shows the four size
 * buckets and no homes behind them, so this array is empty rather than
 * carrying somebody else's plans: a listing is a claim that a specific home
 * is available from this dealership at this specification, and there is no
 * published basis for one yet.
 *
 * The site is built to read honestly at zero. `/listings` says so, the
 * landing page's listings band hides itself (`featured.length > 0` gates
 * it), the size-category buttons hide themselves, and the `/communities`
 * page is switched off in `lib/page-config.ts` to match.
 *
 * To put real inventory up, add a `Listing` per home below — see the `homes`
 * skill in `.claude/skills/homes/` for the field-by-field contract — and its
 * photographs in `lib/photos.ts`. Fill in only what the manufacturer's or
 * NERTO's own sheet actually says; every optional field above is absent from
 * the UI when it is absent here, and nothing is faked to fill a slot.
 * ------------------------------------------------------------------ */

export const listings: Listing[] = [];

/* ------------------------------------------------------------------ *
 * Accessors
 * ------------------------------------------------------------------ */

export function getListing(slug: string): Listing | undefined {
  return listings.find((l) => l.slug === slug);
}

export function getPlan(listing: Listing): FloorPlan | undefined {
  return listing.planId ? floorPlans[listing.planId] : undefined;
}

export function featuredListings(): Listing[] {
  return listings.filter((l) => l.featured);
}

/** Homes that share a series or a community, minus the one being viewed. */
export function relatedListings(listing: Listing, count = 3): Listing[] {
  const scored = listings
    .filter((l) => l.slug !== listing.slug)
    .map((l) => ({
      listing: l,
      score:
        (l.series && l.series === listing.series ? 3 : 0) +
        (l.communitySlug && l.communitySlug === listing.communitySlug ? 2 : 0) +
        (l.beds === listing.beds ? 1 : 0) +
        (Math.abs(l.sqft - listing.sqft) < 400 ? 1 : 0),
    }))
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, count).map((s) => s.listing);
}

export const statusLabels: Record<ListingStatus, string> = {
  available: "Available",
  pending: "Sale pending",
  sold: "Sold",
  "coming-soon": "Coming soon",
};

export const sectionLabels: Record<Sections, string> = {
  single: "Single-section",
  double: "Double-section",
  triple: "Triple-section",
};

/**
 * A series rendered as a label. Most manufacturers name a line for the series
 * alone — "TRU", "NXT" — which reads as "TRU Series". The ones whose own name
 * already carries that noun, like a Patriot Collection, are left as they are
 * rather than doubled into "Patriot Collection Series".
 */
export function seriesLabel(series: string): string {
  return /\b(series|collection)$/i.test(series) ? series : `${series} Series`;
}

export const styleLabels: Record<ArchStyle, string> = {
  farmhouse: "Modern farmhouse",
  craftsman: "Craftsman",
  modern: "Modern",
  coastal: "Coastal cottage",
  lodge: "Mountain lodge",
  ranch: "Ranch",
};

/** Series present in the catalogue, so the facet list follows the data. */
export const seriesList: string[] = [
  ...new Set(listings.map((l) => l.series).filter((s): s is string => Boolean(s))),
].sort();

const priced = listings.filter((l): l is Listing & { price: number } => l.price !== undefined);

/** Whether any home carries a price at all — the price UI hides when none do. */
export const hasPrices = priced.length > 0;

export const priceBounds = {
  min: hasPrices ? Math.min(...priced.map((l) => l.price)) : 0,
  max: hasPrices ? Math.max(...priced.map((l) => l.price)) : 0,
};

/* ------------------------------------------------------------------ *
 * Size categories
 * ------------------------------------------------------------------ */

/**
 * The four buckets a buyer actually shops by — tiny, single, double, triple.
 *
 * A note on how these are decided, because it matters. The obvious approach
 * is to sort purely on square footage, and plenty of dealership sites do
 * exactly that. It produces a lie: a 1,000-square-foot double-section home
 * filed under "Single wide" is a claim about its width, and it is wrong.
 *
 * So width comes from `sections`, which is the field that actually records
 * it, and square footage is only used for the tiny bucket and as the
 * fallback for a home whose `sections` was never filled in. The footprint
 * ranges shown under each label are computed from the homes really in that
 * bucket rather than being printed from a table, so they cannot drift away
 * from the catalogue either.
 */
export type SizeCategory = "tiny" | "single" | "double" | "triple";

/** Anything under this is a tiny home whatever its section count. */
const TINY_MAX_SQFT = 800;

/* Only reached by a home with no `sections` value — see the note above. */
const SQFT_FALLBACK: [number, SizeCategory][] = [
  [TINY_MAX_SQFT, "tiny"],
  [1200, "single"],
  [2000, "double"],
];

export function sizeCategoryOf(listing: Listing): SizeCategory {
  if (listing.sqft < TINY_MAX_SQFT) return "tiny";
  if (listing.sections) return listing.sections;
  const match = SQFT_FALLBACK.find(([ceiling]) => listing.sqft < ceiling);
  return match ? match[1] : "triple";
}

export const sizeCategoryLabels: Record<SizeCategory, string> = {
  tiny: "Tiny home",
  single: "Single wide",
  double: "Double wide",
  triple: "Triple wide",
};

/* The glyph on each bucket's button. Emoji rather than drawn icons on
   purpose: there is no icon set with four house silhouettes that read as
   "wider than the last one" at 32 pixels, and these do. Swap them for an
   `Icon` if a deployment would rather not use emoji. */
export const sizeCategoryGlyphs: Record<SizeCategory, string> = {
  tiny: "🏠",
  single: "🏡",
  double: "🏘️",
  triple: "🏰",
};

export const sizeCategoryOrder: SizeCategory[] = ["tiny", "single", "double", "triple"];

export type SizeCategoryFacet = {
  id: SizeCategory;
  label: string;
  /** How many homes are in it. Zero means the button is not worth showing. */
  count: number;
  /** The real footprint range of the homes in it, e.g. "812–1,144 sq ft". */
  range?: string;
  /** The glyph on the button. */
  glyph: string;
};

/** The four buckets, measured against whatever catalogue is passed in. */
export function sizeCategoryFacets(from: Listing[] = listings): SizeCategoryFacet[] {
  return sizeCategoryOrder.map((id) => {
    const inBucket = from.filter((l) => sizeCategoryOf(l) === id);
    const sizes = inBucket.map((l) => l.sqft);
    const low = Math.min(...sizes);
    const high = Math.max(...sizes);
    return {
      id,
      label: sizeCategoryLabels[id],
      glyph: sizeCategoryGlyphs[id],
      count: inBucket.length,
      range: inBucket.length
        ? low === high
          ? `${low.toLocaleString()} sq ft`
          : `${low.toLocaleString()}–${high.toLocaleString()} sq ft`
        : undefined,
    };
  });
}

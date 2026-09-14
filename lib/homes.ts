import { floorPlans, type FloorPlan } from "./floor-plans";
import { catalogue } from "./catalogue.generated";

export type ListingStatus =
  | "available"
  | "to-order"
  | "pending"
  | "sold"
  | "coming-soon";
export type Sections = "single" | "double" | "triple";

/**
 * How the home is built and inspected, which is a different question from how
 * wide it is.
 *
 * `manufactured` is HUD-code — built to the federal standard, titled and
 * financed as such. `modular` is built to the same state and local building
 * code as a site-built house, inspected by the state, and appraised and
 * titled as real property. NERTO retails both: Pine Grove builds the
 * manufactured homes, Pleasant Valley the modulars.
 *
 * This drives its own bucket in the size categories below — "Mods" — because
 * a buyer shopping for a modular is not shopping by width at all.
 */
export type Construction = "manufactured" | "modular";

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

  /** Who builds it — "Pine Grove Homes", "Pleasant Valley Homes". */
  builder?: string;
  /** HUD-code or state-code. Drives the "Mods" bucket. */
  construction?: Construction;
  /** Product line, e.g. "NETR". Free text — the facet list derives from it. */
  series?: string;
  /** Manufacturer's model code. */
  model?: string;
  /** Absent means the home is priced on enquiry; the UI says so. */
  price?: number;
  /** Optional pre-discount price; renders as a strikethrough. */
  wasPrice?: number;
  sections?: Sections;
  /** Nominal transport dimensions in feet, e.g. 28 × 60. */
  widthFt?: number;
  lengthFt?: number;
  /**
   * The manufacturer's own dimension string, e.g. `26'8" × 52'`. Box
   * dimensions run a few inches under the nominal width everyone says out
   * loud — a 26'8" home is a 27-wide — so both are kept: this one is what the
   * spec strip shows, `widthFt` is what the filters count.
   */
  dimensions?: string;
  year?: number;
  communitySlug?: string;
  style?: ArchStyle;
  tagline?: string;
  story?: string[];
  highlights?: string[];
  features?: FeatureGroup[];
  planId?: keyof typeof floorPlans;
  /**
   * The manufacturer's floor-plan DRAWING, as an image under `public/`. It is
   * a drawing and is labelled as one wherever it renders — it is never shown
   * as a photograph and never fills a photograph's slot.
   */
  planImage?: string;
  /** HERS index — lower is better. A new stick-built home scores ~100. */
  hers?: number;
  featured?: boolean;
  /**
   * Standing on the lot on River Road, skirted and open to walk through.
   * Everything else in the catalogue is a plan NERTO orders in, which is a
   * different promise and gets a different badge.
   */
  onLot?: boolean;
  /** Days the listing has been on market, used for the "new" badge. */
  daysListed?: number;
  /** Matterport walkthrough. */
  tourUrl?: string;
  /** Where this listing was imported from, for re-checking against source. */
  sourceUrl?: string;
};

/**
 * What the importer is allowed to write: the manufacturer's published facts
 * and nothing else. Lot state — status, what is featured, what is standing on
 * River Road — is decided by NERTO, lives in `lotState` below, and is applied
 * over the generated file so re-running the import never overwrites it.
 */
export type CatalogueEntry = Omit<Listing, "status">;

/* ------------------------------------------------------------------ *
 * The catalogue
 *
 * Every plan NERTO retails, imported from the two manufacturers it buys
 * from, in `lib/catalogue.generated.ts`:
 *
 *   Pine Grove Homes — HUD-code manufactured homes, single-section through
 *   double-section, plus the multi-family duplexes. The NETR line is the
 *   northern-states specification, which is the one that matters in Maine.
 *
 *   Pleasant Valley Homes — state-code modulars. NERTO does not stock these:
 *   every one is built to order, which is why they all carry `to-order`
 *   below. The Lake Series is excluded on NERTO's instruction and is not in
 *   the generated file at all.
 *
 * Do not edit the generated file. Re-import it with:
 *
 *   node scripts/import-manufacturers.mjs homes
 *
 * No prices: neither manufacturer publishes one, and a dealer quotes on
 * options, delivery distance and site work, so the site says "call for
 * pricing" everywhere a price would go.
 * ------------------------------------------------------------------ */

/**
 * What is actually standing on River Road, and what NERTO wants surfaced.
 *
 * This is the one hand-maintained half of the catalogue, and the only place
 * lot state is written. Anything not named here is a plan NERTO orders in,
 * and defaults to `to-order` — "Available to order" — below.
 *
 * Keys are slugs in the generated catalogue. A key that matches no plan is
 * caught by `npm run lint` (see `scripts/check-data.mjs`), so a model code
 * that changes upstream fails loudly instead of silently dropping a home off
 * the lot.
 */
const lotState: Record<string, Partial<Listing>> = {
  /* The four homes open to walk through on the lot. */
  "netr-g-3157": { status: "available", onLot: true, featured: true },
  /* CHECK THIS ONE. NERTO named it as "3465", and Pine Grove publishes two
     plans by that number: NETR G-3465 (the northern-states specification,
     1,493 sq ft) and G-3465 (the standard one, 1,568 sq ft). The NETR is the
     Maine build and matches the other NETR home on the lot, so it is the one
     flagged here — but it is a claim about which house a visitor will find in
     the yard, so confirm it and move this line to "g-3465" if it is wrong. */
  "netr-g-3465": { status: "available", onLot: true, featured: true },
  "zk-1100": { status: "available", onLot: true, featured: true },
  "g-3002": { status: "available", onLot: true, featured: true },
};

/**
 * Matterport walkthroughs NERTO has filmed, keyed by the slug of the plan the
 * tour is of.
 *
 * Separate from `lotState` because it answers a different question. A tour is
 * not lot state: most of these are plans NERTO can order rather than houses
 * standing on River Road, and a tour filmed in one of those is a walkthrough
 * of the plan, not a claim that the house is here to visit. Keeping the two
 * apart means adding a tour never accidentally says a home is on the lot.
 *
 * Like `lotState`, keys are slugs in the generated catalogue and a key that
 * matches no plan fails `npm run lint` (see `scripts/check-data.mjs`).
 */
const tours: Record<string, string> = {
  "netr-g-3655": "https://my.matterport.com/show/?m=7ZFKGKTyGc2",
  knox: "https://my.matterport.com/show/?m=5221mGYjwCz",
  "gh-2017": "https://my.matterport.com/show/?m=swdorJ7jSZp",
  "g-487": "https://my.matterport.com/show/?m=wBBpn3sMroC",
  "netr-g-3461": "https://my.matterport.com/show/?m=Ydjo6ZxMcL3",
  "g-200": "https://my.matterport.com/show/?m=T6h1Zv3hgHu",
  /* Filmed with the porch on, which is an option rather than part of the
     plan — the drawing below the tour is the plan as Pine Grove publishes
     it. This is also the one home here that is standing on the lot. */
  "netr-g-3157": "https://my.matterport.com/models/p7X7JuDjFBf",
  "gh-210": "https://my.matterport.com/models/yUcaXGHWjbx",
};

/**
 * The Matterport model id inside a tour URL, whichever shape the URL is.
 *
 * Matterport hands out two, and both get pasted into this file: the share
 * link `my.matterport.com/show/?m=<id>`, and the one the Copy Link button
 * gives you from inside your own model list,
 * `my.matterport.com/models/<id>?cta_origin=...`. They address the same
 * model, so both are read here rather than asking whoever files a tour to
 * convert one into the other by hand.
 *
 * Anything that is not a Matterport URL returns `undefined`, and the page
 * falls back to a plain link out for the same reason the video shelf does:
 * a broken frame tells a visitor nothing, a link at least goes somewhere.
 */
function matterportId(url: string): string | undefined {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return undefined;
  }
  if (!/(^|\.)matterport\.com$/.test(parsed.hostname)) return undefined;

  const fromQuery = parsed.searchParams.get("m");
  if (fromQuery) return fromQuery;

  const fromPath = parsed.pathname.match(/^\/(?:models|show)\/([A-Za-z0-9]+)\/?$/);
  return fromPath?.[1];
}

/**
 * The tour as an embeddable URL, or `undefined` if this is not a Matterport
 * link.
 *
 * `play=1` starts the visitor inside the house rather than on the dollhouse,
 * and `qs=1` skips the splash.
 */
export function tourEmbedUrl(url: string): string | undefined {
  const id = matterportId(url);
  if (!id) return undefined;
  return `https://my.matterport.com/show/?m=${encodeURIComponent(id)}&play=1&qs=1`;
}

/**
 * The tour as a public share link — what "open full screen" should point at.
 *
 * Always the `/show/` form, because a `/models/` URL is the one Matterport
 * shows the account that owns the scan and it carries that dashboard's
 * tracking parameters. A visitor should get the plain share link, not our
 * `cta_origin`. Falls back to the URL as filed if it cannot be parsed.
 */
export function tourShareUrl(url: string): string {
  const id = matterportId(url);
  return id ? `https://my.matterport.com/show/?m=${encodeURIComponent(id)}` : url;
}

/**
 * The catalogue as the site sees it: the manufacturers' published facts, with
 * NERTO's walkthroughs and lot state laid over the top.
 */
export const listings: Listing[] = catalogue.map((entry) => ({
  ...entry,
  /* A plan NERTO can order but does not stock. The four on the lot override
     this from `lotState`. */
  status: "to-order" as ListingStatus,
  ...(tours[entry.slug] ? { tourUrl: tours[entry.slug] } : {}),
  ...lotState[entry.slug],
}));


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
  /* The catalogue's default. NERTO stocks four homes and orders the rest, so
     "available to order" is the honest word for almost every plan on the
     site — it is a home the dealership can build for you, not one standing
     on the lot today. */
  "to-order": "Available to order",
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
 * Series whose name is a bare product code and wants the noun after it —
 * "NETR" reads as a typo, "NETR Series" reads as a line. Everything else in
 * this catalogue is already a phrase a buyer would say out loud ("Main
 * Street", "Single-Section", "Cabin/Chalet") and is left alone: "Single-
 * Section Series" is worse English than "Single-Section".
 */
const SERIES_TAKING_SUFFIX = new Set(["NETR"]);

/** A series rendered as a label. */
export function seriesLabel(series: string): string {
  if (/\b(series|collection)$/i.test(series)) return series;
  return SERIES_TAKING_SUFFIX.has(series) ? `${series} Series` : series;
}

/**
 * How the home is built and inspected, as a buyer would pick it off a filter.
 *
 * This is the "home type" question, and it is not the width question: a
 * modular can be as wide as a double-section manufactured home and is still a
 * different animal — state code rather than HUD code, inspected by the state,
 * appraised and titled as real property.
 */
export const constructionLabels: Record<Construction, string> = {
  manufactured: "Manufactured",
  modular: "Modular",
};

export const constructionOrder: Construction[] = ["manufactured", "modular"];

export const sectionsOrder: Sections[] = ["single", "double", "triple"];

export const styleOrder: ArchStyle[] = [
  "farmhouse",
  "craftsman",
  "modern",
  "coastal",
  "lodge",
  "ranch",
];

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
 * The buckets a buyer actually shops by — tiny, single, double, triple, mods.
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
 * from the catalogue.
 *
 * `modular` is the exception, and deliberately so: it is checked before any
 * width or footprint rule, because a modular is not a width at all. It is a
 * different code, a different inspection and a different appraisal, and a
 * buyer shopping for one is not comparing it to a 28-wide. Pleasant Valley's
 * plans land here whatever their footprint, which is what keeps the
 * double-section manufactured homes together under "Double wide".
 */
export type SizeCategory = "tiny" | "single" | "double" | "triple" | "modular";

/** Anything under this is a tiny home whatever its section count. */
const TINY_MAX_SQFT = 800;

/* Only reached by a home with no `sections` value — see the note above. */
const SQFT_FALLBACK: [number, SizeCategory][] = [
  [TINY_MAX_SQFT, "tiny"],
  [1200, "single"],
  [2000, "double"],
];

export function sizeCategoryOf(listing: Listing): SizeCategory {
  /* Before everything else: a modular is a build standard, not a width. */
  if (listing.construction === "modular") return "modular";
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
  modular: "Mods",
};

/** The longer label, for the page heading a bucket links to. */
export const sizeCategoryDescriptions: Record<SizeCategory, string> = {
  tiny: "Under 800 square feet, on one section.",
  single: "One section, delivered whole and set on your site.",
  double: "Two sections, joined on site — the most common home we set.",
  triple: "Three sections, for the widest floor plans we can deliver.",
  modular:
    "Built to the same state building code as a site-built house, inspected by the state and appraised as real property. Every one is built to order.",
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
  modular: "🏗️",
};

export const sizeCategoryOrder: SizeCategory[] = [
  "tiny",
  "single",
  "double",
  "triple",
  "modular",
];

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

/** The buckets, measured against whatever catalogue is passed in. */
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

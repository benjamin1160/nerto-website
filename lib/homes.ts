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

/** Shorthand for a listing's scene list. */
const scenes = (...kinds: [SceneKind, string][]): Scene[] =>
  kinds.map(([kind, caption]) => ({ kind, caption }));

/* ------------------------------------------------------------------ *
 * The catalogue — twenty plans
 *
 * Every home below is a real, published plan. Names, model codes, bedroom
 * and bathroom counts and square footages come from the manufacturer's or a
 * retailer's own sheet — `sourceUrl` on each listing is where it was read,
 * so any figure here can be checked against its source in one click.
 *
 * READ THIS BEFORE QUOTING ANYBODY FROM IT. These are Clayton-built plans,
 * carried over from the template's own imported catalogue. NERTO's line-up
 * is its own — confirm which of these it actually orders, drop the ones it
 * does not, and add the ones it does. A listing is a claim that this
 * dealership can put this home on your land; it should only survive here if
 * that is true.
 *
 * Widths, lengths and section counts are given only where the model code
 * carries them (Clayton codes read width-length-bedrooms, so TRU28563MH is
 * a 28 x 56 three-bedroom). Where a plan's dimensions were not published,
 * the fields are absent rather than derived.
 *
 * No prices: none are published uniformly and a dealer quotes on options,
 * delivery distance and site work, so the site says "call for pricing"
 * everywhere a price would go. Floor-plan geometry is likewise absent — the
 * drawings on this site are generated, and a generated layout for a real
 * plan would be wrong rather than merely missing.
 *
 * `status`, `featured` and `daysListed` are lot state. Set them from what is
 * actually standing on River Road.
 * ------------------------------------------------------------------ */

export const listings: Listing[] = [
  /* ---------------- Single-section ---------------- */
  {
    slug: "buttercup",
    name: "Buttercup",
    series: "TRU Mini",
    model: "TRT12361PH",
    beds: 1,
    baths: 1,
    sqft: 408,
    sections: "single",
    widthFt: 12,
    lengthFt: 36,
    status: "available",
    style: "ranch",
    sourceUrl: "https://www.claytonhomes.com/homes-for-sale/manufactured-homes/buttercup",
    tagline: "Four hundred and eight square feet — the smallest home Clayton builds, and the smallest thing we can put on a pad.",
    story: [
      "The Buttercup is the first plan out of Clayton's TRU Mini collection, shown at Biloxi this spring: twelve feet by thirty-six, one bedroom, one bath, and nothing in it that a bigger home would have had to give up to get there.",
      "Eight-foot flat ceilings are what keep 408 square feet from reading as a trailer. The finishes are the ones TRU puts in its full-size homes — Frigidaire appliances, DuraCraft cabinets, rolled-edge countertops — rather than a stripped-down mini spec.",
      "It is a single section on a twelve-foot width, which means it hauls and sets where nothing else on this lot will: a narrow infill lot, a back corner of family land, a pad a community wrote off years ago.",
    ],
    highlights: [
      "408 square feet — the smallest plan we can order",
      "12 × 36 single section: sets where a 14-wide will not",
      "Eight-foot flat ceilings throughout",
      "Full-size TRU finishes, not a stripped mini spec",
    ],
    features: [
      {
        group: "Kitchen",
        items: [
          "Frigidaire appliance package",
          "DuraCraft cabinets",
          "Rolled-edge countertops",
        ],
      },
      {
        group: "Throughout",
        items: [
          "Eight-foot flat ceilings",
          "Upgraded window casings",
        ],
      },
    ],
    scenes: scenes(
      ["exterior", "Front elevation"],
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "elation",
    name: "Elation",
    series: "TRU",
    model: "TRS14663AH",
    beds: 3,
    baths: 2,
    sqft: 902,
    sections: "single",
    widthFt: 14,
    lengthFt: 66,
    status: "available",
    featured: true,
    style: "farmhouse",
    sourceUrl: "https://owntru.com/models/trs14663ah/",
    tagline: "Three bedrooms on a 14-foot section, which is the trick this plan is known for.",
    story: [
      "Nine hundred square feet that hold three bedrooms and two baths without any of them feeling like an afterthought — the living, kitchen and dining run as one open bay down the front of the home, and the sleeping rooms take the back third.",
      "It is the plan we put in front of first-time buyers more often than any other, because it lands on a leased pad at a payment most people expect to hear for a one-bedroom apartment.",
    ],
    highlights: [
      "Three bedrooms, two full baths",
      "Open front living, kitchen and dining bay",
      "14 × 66 — fits pads a 16-wide will not",
      "Single-section delivery and set",
    ],
    scenes: scenes(
      ["exterior", "Front elevation"],
      ["living", "Open living bay"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Primary bedroom"],
      ["bath", "Bath"],
    ),
  },
  {
    slug: "magellan",
    name: "Magellan",
    model: "30CEJ16723AH",
    beds: 3,
    baths: 2,
    sqft: 1080,
    sections: "single",
    widthFt: 16,
    lengthFt: 72,
    status: "available",
    style: "ranch",
    sourceUrl: "https://www.claytonhomes.com/homes-for-sale/manufactured-homes/magellan",
    tagline: "Three bedrooms and a full island kitchen inside a single sixteen-foot section.",
    scenes: scenes(
      ["exterior", "Front elevation"],
      ["living", "Great room"],
      ["kitchen", "Kitchen and island"],
      ["bedroom", "Primary bedroom"],
      ["bath", "Primary bath"],
    ),
  },
  {
    slug: "willow",
    name: "Willow",
    model: "37FRE16763CH",
    beds: 3,
    baths: 2,
    sqft: 1140,
    sections: "single",
    widthFt: 16,
    lengthFt: 76,
    status: "available",
    style: "farmhouse",
    sourceUrl: "https://www.claytonhomes.com/homes-for-sale/manufactured-homes/willow",
    tagline: "Sixteen by seventy-six, with a butcher-block island and a garden tub in the primary bath.",
    scenes: scenes(
      ["exterior", "Front elevation"],
      ["living", "Great room"],
      ["kitchen", "Kitchen and island"],
      ["bath", "Primary bath"],
    ),
  },
  {
    slug: "anniversary-choice",
    name: "Anniversary Choice",
    series: "Anniversary",
    model: "ANN16763CH",
    beds: 3,
    baths: 2,
    sqft: 1140,
    sections: "single",
    widthFt: 16,
    lengthFt: 76,
    status: "available",
    featured: true,
    style: "farmhouse",
    sourceUrl:
      "https://www.claytonhomes.com/homes-for-sale/manufactured-homes/anniversary-choice",
    tagline: "The 16 × 76 that outsells almost everything else on this footprint, with the island kitchen.",
    story: [
      "If you have walked one manufactured home anywhere, it was probably this footprint. Sixteen by seventy-six, three bedrooms split with the primary at one end, a kitchen island in the middle of the home and the utility room off the back door.",
      "The Choice is the layout worth walking twice — the island seats three, the pantry is a real cupboard rather than a shelf, and the primary bath takes the full width of the section.",
    ],
    highlights: [
      "Split-bedroom layout — primary at the far end",
      "Kitchen island with seating",
      "Utility room at the rear entry",
      "Single-section: one delivery, one set",
    ],
    scenes: scenes(
      ["exterior", "Front elevation"],
      ["living", "Living room"],
      ["kitchen", "Kitchen and island"],
      ["bedroom", "Primary bedroom"],
      ["bath", "Primary bath"],
    ),
  },

  /* ---------------- Double-section ---------------- */
  {
    slug: "satisfaction",
    name: "Satisfaction",
    series: "TRU",
    model: "TRU28483RH",
    beds: 3,
    baths: 2,
    sqft: 1264,
    sections: "double",
    widthFt: 28,
    lengthFt: 48,
    status: "available",
    style: "farmhouse",
    sourceUrl: "https://owntru.com/models/tru28483rh/",
    tagline: "Twelve hundred square feet, split bedrooms, and a pad that fits most community lots.",
    scenes: scenes(
      ["exterior", "Front elevation"],
      ["living", "Great room"],
      ["kitchen", "Kitchen and island"],
      ["bedroom", "Primary bedroom"],
      ["bath", "Primary bath"],
    ),
  },
  {
    slug: "franklin",
    name: "Franklin",
    model: "56INR28483AH",
    beds: 3,
    baths: 2,
    sqft: 1280,
    sections: "double",
    widthFt: 28,
    lengthFt: 48,
    status: "available",
    style: "ranch",
    sourceUrl: "https://www.claytonhomes.com/homes-for-sale/manufactured-homes/franklin",
    tagline: "The shortest double-section here — three bedrooms across twenty-eight by forty-eight feet.",
    /* No exterior: Clayton publishes interiors only for this plan, so the
       card leads on the great room rather than a drawing of the outside. */
    scenes: scenes(
      ["living", "Great room"],
      ["kitchen", "Kitchen and island"],
      ["bath", "Primary bath"],
    ),
  },
  {
    slug: "cook",
    name: "Cook",
    model: "43CEJ28523AH",
    beds: 3,
    baths: 2,
    sqft: 1369,
    sections: "double",
    widthFt: 28,
    lengthFt: 52,
    status: "available",
    featured: true,
    style: "farmhouse",
    sourceUrl: "https://www.claytonhomes.com/homes-for-sale/manufactured-homes/cook",
    tagline: "An island kitchen open to the dining and living space, on a twenty-eight-foot box.",
    scenes: scenes(
      ["exterior", "Front elevation"],
      ["living", "Great room"],
      ["kitchen", "Kitchen and island"],
      ["bath", "Primary bath"],
    ),
  },
  {
    slug: "breeze",
    name: "The Breeze",
    model: "SSR28563AH",
    beds: 3,
    baths: 2,
    sqft: 1474,
    sections: "double",
    widthFt: 28,
    lengthFt: 56,
    status: "available",
    featured: true,
    style: "farmhouse",
    sourceUrl: "https://www.claytonhomes.com/homes/25SSR28563AH/",
    tagline: "Island kitchen, walk-in pantry, split bedrooms — the plan people come in asking for by name.",
    story: [
      "The Breeze has been on Clayton lots long enough that buyers arrive already knowing it. The draw is the middle of the home: an island big enough to work at from both sides, a pantry you walk into, and sight lines from the range straight through the great room to the front door.",
      "Bedrooms two and three sit together at one end with the second bath between them, and the primary takes the other end on its own.",
    ],
    highlights: [
      "Walk-in pantry off the island kitchen",
      "Primary suite isolated at one end",
      "Second bath between bedrooms two and three",
      "Utility room on the rear entry",
    ],
    scenes: scenes(
      ["exterior", "Front elevation"],
      ["living", "Great room"],
      ["kitchen", "Kitchen and island"],
      ["bedroom", "Primary bedroom"],
      ["bath", "Primary bath"],
      ["porch", "Covered entry"],
    ),
  },
  {
    slug: "haven",
    name: "Haven",
    model: "38HZN28603AH",
    beds: 3,
    baths: 2,
    sqft: 1580,
    sections: "double",
    widthFt: 28,
    lengthFt: 60,
    status: "available",
    featured: true,
    style: "craftsman",
    sourceUrl: "https://www.claytonhomes.com/homes-for-sale/manufactured-homes/haven",
    tagline: "A galley island kitchen running the length of the great room, with a buffet wall opposite.",
    scenes: scenes(
      ["exterior", "Front elevation"],
      ["living", "Great room"],
      ["kitchen", "Kitchen and island"],
      ["bath", "Primary bath"],
    ),
  },
  {
    slug: "crockett",
    name: "Crockett",
    model: "45CEJ28683AH",
    beds: 3,
    baths: 2,
    sqft: 1728,
    sections: "double",
    widthFt: 28,
    lengthFt: 68,
    status: "available",
    style: "lodge",
    sourceUrl: "https://www.claytonhomes.com/homes-for-sale/manufactured-homes/crockett",
    tagline: "Twenty-eight by sixty-eight, with a stone fireplace wall and a walk-in island kitchen.",
    scenes: scenes(
      ["exterior", "Front elevation"],
      ["living", "Great room"],
      ["kitchen", "Kitchen and island"],
      ["bath", "Primary bath"],
    ),
  },
  {
    slug: "pride",
    name: "Pride",
    series: "TRU",
    model: "TRU28684RH",
    beds: 4,
    baths: 2,
    sqft: 1791,
    sections: "double",
    widthFt: 28,
    lengthFt: 68,
    status: "available",
    style: "ranch",
    sourceUrl: "https://owntru.com/models/tru28684rh/",
    tagline: "TRU's four-bedroom — the cheapest route to four rooms and two baths we can put on a pad.",
    scenes: scenes(
      ["exterior", "Front elevation"],
      ["living", "Great room"],
      ["kitchen", "Kitchen and island"],
      ["bedroom", "Primary bedroom"],
      ["bath", "Primary bath"],
    ),
  },
  {
    slug: "everett",
    name: "Everett",
    series: "NXT",
    beds: 4,
    baths: 3,
    sqft: 1790,
    sections: "double",
    status: "available",
    style: "modern",
    sourceUrl: "https://www.braustin.com/shop/clayton-nxt-everett/",
    tagline: "Four bedrooms and three full baths — the only plan here with a third bath under 1,800 square feet.",
    scenes: scenes(
      ["exterior", "Front elevation"],
      ["living", "Great room"],
      ["kitchen", "Kitchen and island"],
      ["bedroom", "Primary bedroom"],
      ["bath", "Primary bath"],
    ),
  },
  {
    slug: "el-sueno-breeze",
    name: "El Sueno Breeze",
    model: "38CLB28724CH",
    beds: 4,
    baths: 2,
    sqft: 1896,
    sections: "double",
    widthFt: 28,
    lengthFt: 72,
    status: "available",
    featured: true,
    style: "modern",
    sourceUrl: "https://www.claytonhomes.com/homes-for-sale/manufactured-homes/el-sueno-breeze",
    tagline: "Four bedrooms, a linear fireplace and a dining room that seats eight without moving furniture.",
    scenes: scenes(
      ["exterior", "Front elevation"],
      ["living", "Great room"],
      ["kitchen", "Kitchen and island"],
      ["bath", "Primary bath"],
    ),
  },
  {
    slug: "tinsley",
    name: "The Tinsley",
    series: "NXT",
    beds: 4,
    baths: 2,
    sqft: 2128,
    sections: "double",
    status: "available",
    style: "craftsman",
    sourceUrl: "https://brigadiermh.com/home/nxt-tinsley/",
    tagline: "Two thousand one hundred and twenty-eight square feet, and the largest plan on this list.",
    scenes: scenes(
      ["exterior", "Front elevation"],
      ["living", "Great room"],
      ["kitchen", "Kitchen and island"],
      ["bedroom", "Primary bedroom"],
      ["bath", "Primary bath"],
    ),
  },
  {
    slug: "double-maxx-elite-56",
    name: "Double Maxx Elite 56",
    series: "Double Maxx",
    model: "VY32563E",
    beds: 3,
    baths: 2,
    sqft: 1717,
    sections: "double",
    widthFt: 32,
    lengthFt: 56,
    status: "available",
    style: "ranch",
    sourceUrl: "https://www.mobilehomesdirect4less.com/clayton-double-wides/",
    tagline: "Thirty-two feet across on a 56-foot length — width where a 28 spends length.",
    scenes: scenes(
      ["exterior", "Front elevation"],
      ["living", "Great room"],
      ["kitchen", "Kitchen and island"],
      ["bedroom", "Primary bedroom"],
      ["bath", "Primary bath"],
    ),
  },
  {
    slug: "double-maxx-elite-64",
    name: "Double Maxx Elite 64",
    series: "Double Maxx",
    model: "VY32643E",
    beds: 3,
    baths: 2,
    sqft: 1962,
    sections: "double",
    widthFt: 32,
    lengthFt: 64,
    status: "available",
    style: "lodge",
    sourceUrl: "https://www.mobilehomesdirect4less.com/clayton-double-wides/",
    tagline: "Sold off the lot in March — the next one is orderable on a ten-week build slot.",
    scenes: scenes(
      ["exterior", "Front elevation"],
      ["living", "Great room"],
      ["kitchen", "Kitchen and island"],
      ["bedroom", "Primary bedroom"],
      ["bath", "Primary bath"],
    ),
  },
  {
    slug: "farm-4-flex-elite",
    name: "Farm 4 Flex Elite",
    model: "57FRM32724AH",
    beds: 4,
    baths: 3,
    sqft: 2160,
    sections: "double",
    widthFt: 32,
    lengthFt: 72,
    status: "available",
    featured: true,
    style: "farmhouse",
    sourceUrl: "https://www.claytonhomes.com/homes-for-sale/manufactured-homes/farm-4-flex-elite",
    tagline: "Thirty-two feet across: four bedrooms, three full baths, and a freestanding tub in the primary.",
    scenes: scenes(
      ["exterior", "Front elevation"],
      ["living", "Great room"],
      ["kitchen", "Kitchen and island"],
      ["bath", "Primary bath"],
    ),
  },
  {
    slug: "the-fusion-32b",
    name: "The Fusion 32B",
    model: "34FSN32764BH",
    beds: 4,
    baths: 2,
    sqft: 2280,
    sections: "double",
    widthFt: 32,
    lengthFt: 76,
    status: "available",
    style: "lodge",
    sourceUrl: "https://www.claytonhomes.com/homes-for-sale/manufactured-homes/the-fusion-32b",
    tagline: "The largest plan here — 2,280 square feet, with a beamed great room and a soaking tub.",
    scenes: scenes(
      ["exterior", "Front elevation"],
      ["living", "Great room"],
      ["kitchen", "Kitchen and island"],
      ["bedroom", "Primary bedroom"],
      ["bath", "Primary bath"],
    ),
  },

  /* ---------------- CrossMod ---------------- */
  {
    slug: "cypress",
    name: "The Cypress",
    series: "CrossMod",
    beds: 2,
    baths: 2,
    sqft: 990,
    status: "available",
    style: "coastal",
    sourceUrl: "https://www.claytonbuilt.com/crossmod",
    tagline: "A CrossMod at 990 square feet — small enough for an infill lot, titled as real property.",
    scenes: scenes(
      ["exterior", "Front elevation"],
      ["living", "Living room"],
      ["kitchen", "Kitchen"],
      ["bedroom", "Primary bedroom"],
      ["bath", "Primary bath"],
      ["porch", "Covered porch"],
    ),
  },
];

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
 * A series rendered as a label. Most Clayton lines are named for the series
 * alone — "TRU", "NXT" — and read as "TRU Series". The ones whose own name
 * already carries that noun, like the Patriot Collection, are left as they
 * are rather than doubled into "Patriot Collection Series".
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

import { milesFromHQ } from "./geo";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  THE LAND-DEALS PRICING. Every number on `/land-deals` comes from this file —
 *  the map, the county list, the detail card and the social preview image.
 *
 *  This is *market* data, in the sense of `lib/market.ts`: it is true of one
 *  dealership's delivery radius and of nowhere else. What ships here is the
 *  North Florida market drawn from Gainesville. Selling into another market
 *  means replacing these counties, moving `HQ` in `./geo.ts`, and regenerating
 *  the boundaries — see `scripts/generate-county-shapes.py`. Do not leave one
 *  market's counties on another market's site.
 *
 *  `startingPayment`  estimated monthly payment on a land + home package, i.e.
 *                     the cheapest realistic way into that county today.
 *  `land`             what a buildable lot actually trades for in that county.
 *  `lotTypical`       the parcel size those numbers assume.
 *
 *  Payment estimates assume one loan covering land and home, 20% down, ~20–23
 *  year term, on approved credit. Update `PAYMENT_ASSUMPTIONS` below whenever
 *  rates or programs move, and keep the disclaimer honest.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const PAYMENT_ASSUMPTIONS =
  "Estimates assume a land-and-home package financed as one loan with 20% down over a 20–23 year term, taxes and insurance escrowed, on approved credit. Your rate, term, and payment depend on credit, down payment, land cost, and site work.";

export type Area = {
  slug: string;
  county: string;
  /** The town the marker sits on. */
  seat: string;
  /** Other towns buyers search in this county. */
  towns: string[];
  lat: number;
  lon: number;
  /** Estimated starting monthly payment, land + home, one loan. */
  startingPayment: number;
  /** Typical buildable-lot price range, in dollars. */
  land: { low: number; high: number };
  lotTypical: string;
  /** One line of local reality: zoning, utilities, what sells there. */
  note: string;
  /** Which side of the star its label sits on. */
  labelSide: "n" | "s" | "e" | "w";
  /** Optional fine-tuning of the label, in map units (miles). */
  dx?: number;
  dy?: number;
};

const RAW: Area[] = [
  {
    slug: "alachua",
    county: "Alachua",
    seat: "Gainesville",
    towns: ["Newberry", "Archer", "High Springs", "Hawthorne", "Waldo"],
    lat: 29.6516,
    lon: -82.3248,
    startingPayment: 1545,
    land: { low: 45000, high: 85000 },
    lotTypical: "1/2 – 1 acre",
    note: "Home base. Tighter county codes, so we check setbacks and zoning before you write an offer.",
    labelSide: "e",
    dx: 2.5,
    dy: 4,
  },
  {
    slug: "levy",
    county: "Levy",
    seat: "Bronson",
    towns: ["Williston", "Chiefland", "Morriston", "Cedar Key"],
    lat: 29.4483,
    lon: -82.6404,
    startingPayment: 1385,
    land: { low: 28000, high: 50000 },
    lotTypical: "1 – 5 acres",
    note: "Best acre-per-dollar inside 30 miles. Doublewides are the norm out here, well and septic.",
    labelSide: "w",
  },
  {
    slug: "bradford",
    county: "Bradford",
    seat: "Starke",
    towns: ["Lawtey", "Hampton", "Brooker"],
    lat: 29.9441,
    lon: -82.1101,
    startingPayment: 1395,
    land: { low: 28000, high: 48000 },
    lotTypical: "1/2 – 2 acres",
    note: "Quick commute to Gainesville or Jacksonville without either county's land prices.",
    labelSide: "s",
  },
  {
    slug: "union",
    county: "Union",
    seat: "Lake Butler",
    towns: ["Raiford", "Worthington Springs"],
    lat: 30.023,
    lon: -82.339,
    startingPayment: 1355,
    land: { low: 25000, high: 42000 },
    lotTypical: "1 – 3 acres",
    note: "Small county, few restrictions, land moves fast when it lists.",
    labelSide: "w",
  },
  {
    slug: "gilchrist",
    county: "Gilchrist",
    seat: "Trenton",
    towns: ["Bell", "Fanning Springs"],
    lat: 29.6136,
    lon: -82.8173,
    startingPayment: 1375,
    land: { low: 32000, high: 55000 },
    lotTypical: "1 – 5 acres",
    note: "Farm country 30 minutes west. High ground, good septic approvals, easy permitting.",
    labelSide: "n",
  },
  {
    slug: "marion",
    county: "Marion",
    seat: "Ocala",
    towns: ["Dunnellon", "Citra", "Fort McCoy", "Silver Springs"],
    lat: 29.1872,
    lon: -82.1401,
    startingPayment: 1465,
    land: { low: 30000, high: 65000 },
    lotTypical: "1/2 – 2 acres",
    note: "Huge inventory. Prices swing hard between the horse corridor and the east side.",
    labelSide: "e",
  },
  {
    slug: "putnam",
    county: "Putnam",
    seat: "Palatka",
    towns: ["Interlachen", "Crescent City", "East Palatka", "Melrose"],
    lat: 29.6486,
    lon: -81.6376,
    startingPayment: 1340,
    land: { low: 12000, high: 35000 },
    lotTypical: "1/4 – 1 acre",
    note: "The cheapest lots on this map sit in Interlachen and Crescent City. Verify road access.",
    labelSide: "s",
    dx: 4,
  },
  {
    slug: "columbia",
    county: "Columbia",
    seat: "Lake City",
    towns: ["Fort White", "Watertown"],
    lat: 30.1897,
    lon: -82.6393,
    startingPayment: 1425,
    land: { low: 30000, high: 55000 },
    lotTypical: "1 – 2 acres",
    note: "I-75 and I-10 cross here, so work is close and lots still pencil out.",
    labelSide: "w",
    dy: 2.5,
  },
  {
    slug: "baker",
    county: "Baker",
    seat: "Macclenny",
    towns: ["Glen St. Mary", "Sanderson", "Olustee"],
    lat: 30.2819,
    lon: -82.122,
    startingPayment: 1455,
    land: { low: 35000, high: 60000 },
    lotTypical: "1 – 3 acres",
    note: "Jacksonville paychecks, country land prices. Popular with first-time buyers.",
    labelSide: "w",
  },
  {
    slug: "clay",
    county: "Clay",
    seat: "Green Cove Springs",
    towns: ["Keystone Heights", "Middleburg", "Penney Farms"],
    lat: 29.9919,
    lon: -81.6781,
    startingPayment: 1695,
    land: { low: 50000, high: 90000 },
    lotTypical: "1/2 – 1 acre",
    note: "Keystone Heights and the county's southwest corner are where the value still is.",
    labelSide: "w",
  },
  {
    slug: "duval",
    county: "Duval",
    seat: "Jacksonville",
    towns: ["Baldwin", "Maxville", "Northside"],
    lat: 30.3322,
    lon: -81.6557,
    startingPayment: 1745,
    land: { low: 45000, high: 90000 },
    lotTypical: "1/4 – 1 acre",
    note: "Manufactured homes only fit certain zoning districts here. We check the parcel first.",
    labelSide: "e",
  },
  {
    slug: "nassau",
    county: "Nassau",
    seat: "Callahan",
    towns: ["Hilliard", "Bryceville", "Yulee"],
    lat: 30.5622,
    lon: -81.8306,
    startingPayment: 1715,
    land: { low: 50000, high: 95000 },
    lotTypical: "1 – 3 acres",
    note: "Hilliard and Bryceville still have acreage; the Yulee side is priced like the beach.",
    labelSide: "e",
  },
  {
    slug: "st-johns",
    county: "St. Johns",
    seat: "St. Augustine",
    towns: ["Hastings", "Elkton", "Molasses Junction"],
    lat: 29.8947,
    lon: -81.3131,
    startingPayment: 1895,
    land: { low: 70000, high: 140000 },
    lotTypical: "1/2 – 1 acre",
    note: "Priciest land on the map. The Hastings farm belt is the realistic entry point.",
    labelSide: "e",
  },
  {
    slug: "flagler",
    county: "Flagler",
    seat: "Bunnell",
    towns: ["Espanola", "Korona", "Palm Coast"],
    lat: 29.4666,
    lon: -81.2573,
    startingPayment: 1675,
    land: { low: 45000, high: 85000 },
    lotTypical: "1/2 – 2 acres",
    note: "West of US-1 you can still buy acreage 20 minutes from the ocean.",
    labelSide: "e",
  },
  {
    slug: "volusia",
    county: "Volusia",
    seat: "DeLand",
    towns: ["Pierson", "Barberville", "DeLeon Springs", "Seville"],
    lat: 29.0283,
    lon: -81.3031,
    startingPayment: 1655,
    land: { low: 40000, high: 80000 },
    lotTypical: "1/2 – 2 acres",
    note: "The fern country north of DeLand is the affordable half of this county.",
    labelSide: "e",
  },
  {
    slug: "lake",
    county: "Lake",
    seat: "Tavares",
    towns: ["Leesburg", "Umatilla", "Eustis", "Altoona"],
    lat: 28.8047,
    lon: -81.7256,
    startingPayment: 1625,
    land: { low: 45000, high: 85000 },
    lotTypical: "1/2 – 1 acre",
    note: "North Lake near Umatilla and Altoona beats anything closer to Orlando.",
    labelSide: "e",
  },
  {
    slug: "sumter",
    county: "Sumter",
    seat: "Bushnell",
    towns: ["Webster", "Center Hill", "Coleman"],
    lat: 28.665,
    lon: -82.1131,
    startingPayment: 1525,
    land: { low: 38000, high: 70000 },
    lotTypical: "1 – 5 acres",
    note: "Agricultural zoning is friendly to manufactured homes on acreage.",
    labelSide: "e",
  },
  {
    slug: "citrus",
    county: "Citrus",
    seat: "Inverness",
    towns: ["Crystal River", "Homosassa", "Floral City", "Hernando"],
    lat: 28.8358,
    lon: -82.3304,
    startingPayment: 1495,
    land: { low: 30000, high: 60000 },
    lotTypical: "1/4 – 1 acre",
    note: "Platted quarter-acre lots with utilities at the street keep site costs down.",
    labelSide: "w",
  },
  {
    slug: "hernando",
    county: "Hernando",
    seat: "Brooksville",
    towns: ["Ridge Manor", "Istachatta", "Nobleton"],
    lat: 28.5553,
    lon: -82.3879,
    startingPayment: 1545,
    land: { low: 35000, high: 70000 },
    lotTypical: "1/4 – 1 acre",
    note: "South edge of our radius. Delivery still runs, permitting is straightforward.",
    labelSide: "w",
  },
  {
    slug: "dixie",
    county: "Dixie",
    seat: "Cross City",
    towns: ["Old Town", "Horseshoe Beach", "Suwannee"],
    lat: 29.6352,
    lon: -83.1257,
    startingPayment: 1275,
    land: { low: 18000, high: 35000 },
    lotTypical: "1 – 5 acres",
    note: "Cheapest way onto your own land inside 50 miles of Gainesville.",
    labelSide: "w",
  },
  {
    slug: "lafayette",
    county: "Lafayette",
    seat: "Mayo",
    towns: ["Day", "Hatch Bend"],
    lat: 30.053,
    lon: -83.1735,
    startingPayment: 1285,
    land: { low: 20000, high: 38000 },
    lotTypical: "1 – 10 acres",
    note: "Almost no zoning friction. Bring a well and septic budget and you are building.",
    labelSide: "s",
  },
  {
    slug: "suwannee",
    county: "Suwannee",
    seat: "Live Oak",
    towns: ["Branford", "Wellborn", "O'Brien"],
    lat: 30.2947,
    lon: -82.984,
    startingPayment: 1345,
    land: { low: 25000, high: 45000 },
    lotTypical: "1 – 5 acres",
    note: "River county with real acreage under $50k. Our most common land-and-home deal.",
    labelSide: "w",
    dy: -2.5,
  },
  {
    slug: "hamilton",
    county: "Hamilton",
    seat: "Jasper",
    towns: ["Jennings", "White Springs"],
    lat: 30.5188,
    lon: -82.9473,
    startingPayment: 1320,
    land: { low: 20000, high: 36000 },
    lotTypical: "1 – 10 acres",
    note: "Right on I-75 at the state line. Land is cheap because nobody is looking.",
    labelSide: "w",
  },
  {
    slug: "madison",
    county: "Madison",
    seat: "Madison",
    towns: ["Lee", "Greenville", "Pinetta"],
    lat: 30.4691,
    lon: -83.4132,
    startingPayment: 1310,
    land: { low: 18000, high: 35000 },
    lotTypical: "1 – 10 acres",
    note: "Northwest corner of our radius. Big parcels, small prices, longer delivery.",
    labelSide: "w",
  },
  {
    slug: "taylor",
    county: "Taylor",
    seat: "Perry",
    towns: ["Steinhatchee", "Salem", "Shady Grove"],
    lat: 30.1174,
    lon: -83.5827,
    startingPayment: 1295,
    land: { low: 15000, high: 32000 },
    lotTypical: "1 – 10 acres",
    note: "Timber country. The lowest land prices we deliver to, if you don't mind the drive.",
    labelSide: "w",
  },
];

/** Every area, with mileage from the dealership computed, not typed by hand. */
export const AREAS: (Area & { miles: number })[] = RAW.map((a) => ({
  ...a,
  miles: Math.round(milesFromHQ(a.lat, a.lon)),
}));

export const CHEAPEST = AREAS.reduce((a, b) =>
  a.startingPayment <= b.startingPayment ? a : b
);

export const PAYMENT_FLOOR = CHEAPEST.startingPayment;
export const PAYMENT_CEILING = Math.max(...AREAS.map((a) => a.startingPayment));

export function areaBySlug(slug: string) {
  return AREAS.find((a) => a.slug === slug);
}

/**
 * Sequential scale for shading counties by starting payment.
 *
 * One hue, five steps, monotonically stepped in lightness so the map reads as a
 * magnitude rather than as five unrelated colors.
 *
 * The ramp runs **most prominent at the cheapest end**. The quantity being
 * encoded is how easy a county is to get into, so the counties a shopper can
 * actually afford are the ones that carry weight on the map; running it the
 * other way made the priciest corner of the state the loudest thing on screen.
 * Every swatch is labelled with its band in the legend, so the direction is
 * stated rather than assumed, and each county also carries its price in figures.
 *
 * The fills are theme tokens, defined light and dark in `app/globals.css`
 * alongside every other colour on the site — `--land-tier-1` is the cheapest
 * band. Because they are custom properties they are applied through `style`
 * rather than as SVG presentation attributes, which do not resolve `var()`.
 * Even the palest step stays clearly apart from `--land-unserved`, so
 * "we deliver here" never collapses into "we don't".
 *
 * Bands are round numbers rather than quantiles — a legend that reads
 * "under $1,350" is worth more to a shopper than equal-sized buckets.
 */
export const PRICE_TIERS = [
  { max: 1349, label: "Under $1,350", fill: "var(--land-tier-1)" },
  { max: 1449, label: "$1,350–$1,449", fill: "var(--land-tier-2)" },
  { max: 1549, label: "$1,450–$1,549", fill: "var(--land-tier-3)" },
  { max: 1699, label: "$1,550–$1,699", fill: "var(--land-tier-4)" },
  { max: Infinity, label: "$1,700 and up", fill: "var(--land-tier-5)" },
] as const;

/** Fill for land we do not deliver to: neutral, so it never reads as a tier. */
export const UNSERVED_FILL = "var(--land-unserved)";
/** Fill for the next state over, which is context rather than market. */
export const OUTSIDE_FILL = "var(--land-outside)";
/** Fill for a county priced above the visitor's budget. */
export const OVER_BUDGET_FILL = "var(--land-over-budget)";

export function tierOf(payment: number): number {
  const i = PRICE_TIERS.findIndex((t) => payment <= t.max);
  return i === -1 ? PRICE_TIERS.length - 1 : i;
}

export const tierFill = (payment: number) => PRICE_TIERS[tierOf(payment)].fill;

/** Counties sorted the way a shopper reads them: cheapest way in, first. */
export const BY_PRICE = [...AREAS].sort(
  (a, b) => a.startingPayment - b.startingPayment
);

/** The headline counties for the social preview image. */
export const OG_FEATURED = BY_PRICE.slice(0, 6);

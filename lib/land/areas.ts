import { milesFromHQ } from "./geo";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  THE LAND-DEALS PRICING. Every number on `/land-deals` comes from this file —
 *  the map, the county list, the detail card and the social preview image.
 *
 *  This is *market* data, in the sense of `lib/market.ts`: it is true of one
 *  dealership's delivery radius and of nowhere else.
 *
 *  IT IS CURRENTLY EMPTY, and `/land-deals` is switched off in
 *  `lib/page-config.ts` to match. NERTO publishes no county-by-county land
 *  prices or starting payments, and a monthly figure printed next to a county
 *  name is a claim a shopper will act on — so there are none here rather than
 *  estimates. The geography around it is real and points at the right place:
 *  `HQ` in `./geo.ts` is the lot on River Road in Chelsea, and the county
 *  boundaries in `./county-shapes.generated.ts` are Maine, New Hampshire,
 *  Vermont and Massachusetts.
 *
 *  To turn the page on: price the counties NERTO actually delivers homes to,
 *  add an `Area` per county below, list them in `PRICED` in
 *  `scripts/generate-county-shapes.py` and regenerate so each county's shape
 *  carries its slug, then flip `landDeals` in `lib/page-config.ts`. Check the
 *  bands in `PRICE_TIERS` still bracket the payments you entered.
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

const RAW: Area[] = [];

/** Every area, with mileage from the dealership computed, not typed by hand. */
export const AREAS: (Area & { miles: number })[] = RAW.map((a) => ({
  ...a,
  miles: Math.round(milesFromHQ(a.lat, a.lon)),
}));

/** The cheapest way in, or undefined while no county is priced. */
export const CHEAPEST: (Area & { miles: number }) | undefined = AREAS.reduce<
  (Area & { miles: number }) | undefined
>((a, b) => (a && a.startingPayment <= b.startingPayment ? a : b), undefined);

export const PAYMENT_FLOOR = CHEAPEST?.startingPayment ?? 0;
export const PAYMENT_CEILING = AREAS.length
  ? Math.max(...AREAS.map((a) => a.startingPayment))
  : 0;

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

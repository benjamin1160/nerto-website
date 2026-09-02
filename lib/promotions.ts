/**
 * Live offers.
 *
 * A promotion is a claim with a date on it — "$5,000 off through March" — and
 * a stale one on a dealership site is worse than none at all, so nothing here
 * is invented and nothing renders unless it is current. `endsOn` is checked
 * against today's date at render time: an expired promotion drops out of the
 * banner, the `/promotions` page and the header on its own, without anybody
 * having to remember to delete it.
 *
 * Ship this file empty for a dealership with nothing running. The landing
 * banner disappears, and `/promotions` — with `pages.promotions` on — shows
 * an honest "nothing at the moment" rather than a fabricated deal.
 */

export type Promotion = {
  slug: string;
  /** Short label on the banner, e.g. "Spring event". */
  kicker: string;
  headline: string;
  body: string;
  /** ISO date, `YYYY-MM-DD`. The promotion disappears the day after. */
  endsOn?: string;
  /** Where the banner's button goes. Defaults to `/contact`. */
  href?: string;
  ctaText?: string;
  /** Homes the offer applies to, by slug. Empty means the whole lot. */
  listingSlugs?: string[];
};

export const promotions: Promotion[] = [];

const startOfToday = () => new Date(new Date().toDateString());

/** True while `endsOn` is today or later, and always for an offer with no end. */
export function isLive(promotion: Promotion, now = startOfToday()): boolean {
  if (!promotion.endsOn) return true;
  const ends = new Date(`${promotion.endsOn}T23:59:59`);
  return !Number.isNaN(ends.getTime()) && ends >= now;
}

/** Everything still running, in the order it is written above. */
export function livePromotions(): Promotion[] {
  const now = startOfToday();
  return promotions.filter((p) => isLive(p, now));
}

/** The one the landing banner shows. First live offer wins. */
export function featuredPromotion(): Promotion | undefined {
  return livePromotions()[0];
}

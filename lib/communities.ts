export type Community = {
  slug: string;
  name: string;
  city: string;
  state: string;
  blurb: string;
  /** Whether homesites here are owned or leased. */
  tenure: "Land-lease" | "Resident-owned" | "Fee-simple lots";

  /* Everything below is optional, because these are real communities run by
     someone else and only some of it is published. An absent figure is
     hidden from the UI rather than guessed at — see the note above the
     array. */

  /** Who runs the community, where it is a managed property. */
  operator?: string;
  /** The community's own page, so a buyer can check us against the source. */
  url?: string;
  /** Monthly lot rent, where the operator publishes one. */
  lotRent?: number;
  /** Approximate homesites in the community. */
  sites?: number;
  available?: number;
  established?: number;
  amenities?: string[];
};

/* ------------------------------------------------------------------ *
 * The communities — empty
 *
 * NERTO does not publish a list of communities it places homes into, so
 * there is not one here. A community entry is a claim about a property run
 * by somebody else — its tenure, its rent, its amenities — and carrying
 * another market's communities over is exactly the mistake this file exists
 * to prevent.
 *
 * `/communities` is switched off in `lib/page-config.ts` to match; turn it
 * back on once there are real properties below, with the operator's own
 * page linked on each so a buyer can check us against the source. Leave a
 * figure out rather than guessing it — the page hides what it does not have.
 * ------------------------------------------------------------------ */

export const communities: Community[] = [];

export function getCommunity(slug: string): Community | undefined {
  return communities.find((c) => c.slug === slug);
}

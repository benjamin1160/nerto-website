import type { Listing, SceneKind } from "./homes";

/**
 * The inventory feed — lot state that comes from the platform instead of
 * from this repository.
 *
 * Out of the box the site's lot state is hand-written: `lotState` in
 * `lib/homes.ts` says which plans are standing in the yard, which are
 * featured, which are sold. Once a deployment is connected to the platform,
 * the platform says it instead. `scripts/sync-listings.mjs` runs before every
 * build, fetches `LISTINGS_FEED_URL`, checks what came back, downloads the
 * photographs, and writes `lib/inventory.generated.ts`. `lib/homes.ts` reads
 * that file and, when it holds a feed, uses it IN PLACE OF `lotState` — one
 * authority at a time, so a home the platform has marked sold cannot stay
 * "on the lot" because of a line somebody forgot to delete here.
 *
 * With no `LISTINGS_FEED_URL` the committed file holds `null` and nothing
 * changes: the site builds from `lotState` exactly as before.
 *
 * The wire format the platform sends is documented in `PLATFORM.md`. This
 * file is the shape after the sync script has checked and normalised it.
 */

/** A photograph the sync script downloaded into `public/photos/feed/`. */
export type InventoryPhoto = {
  kind: SceneKind;
  /** Path under `public/`, e.g. `/photos/feed/netr-g-3157/exterior.jpg`. */
  src: string;
  caption?: string;
};

/**
 * One home from the feed. A slug that names a plan in the catalogue is laid
 * over that plan — status, price, on-lot, featured, a tour, photographs. A
 * slug the catalogue does not have is a home in its own right (a pre-owned
 * home, a spec build) and the sync script has already made sure it carries
 * the fields a listing cannot mean anything without.
 */
export type InventoryListing = Partial<Omit<Listing, "scenes">> & {
  slug: string;
  photos?: InventoryPhoto[];
};

export type Inventory = {
  /** The feed's host — never the full URL, which may carry a token. */
  source: string;
  /** When this build fetched it, ISO 8601. */
  fetchedAt: string;
  /** The platform's own timestamp for the data, when it sends one. */
  updatedAt?: string;
  listings: InventoryListing[];
};

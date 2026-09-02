/**
 * The photo desk — one file for every photograph on the site.
 *
 * Key naming — three shapes, and only three:
 *
 *   "<home-slug>/<scene-kind>"   one scene on one home
 *                                kinds: exterior · living · kitchen
 *                                       bedroom · bath · porch
 *   "community/<community-slug>" a community's hero image
 *   "page/<name>"               a page hero or a one-off site image
 *
 * Values are paths under `public/`, so `/photos/homes/breeze/kitchen.jpg`
 * lives at `public/photos/homes/breeze/kitchen.jpg`. Use `.jpg` or
 * `.webp`, roughly 2000px on the long edge, and name the file after the key.
 *
 * The site shows photographs and nothing else. There is no generated
 * artwork behind this map: a key with no photograph renders as an empty
 * plate saying so, which is why every listing in `lib/homes.ts` declares
 * only the scenes it actually has a picture of. Add a scene to a listing
 * without adding its photograph here and the gallery will show that plate —
 * check both together.
 *
 * READ THIS BEFORE THE SITE GOES LIVE. Two kinds of photograph are mixed
 * below, and they are not equally true:
 *
 *   The manufacturer's own model photography, read off the model page each
 *   listing links as its `sourceUrl` — buttercup, cook, crockett,
 *   el-sueno-breeze, farm-4-flex-elite, franklin, haven, magellan,
 *   the-fusion-32b and willow. These picture the plan they are attached to.
 *
 *   Stand-in photography — anniversary-choice, breeze, cypress,
 *   double-maxx-elite-56, double-maxx-elite-64, elation, everett, pride,
 *   satisfaction and tinsley. These are pictures of other manufactured homes
 *   on a dealer's lot, matched to each listing by section count, size and
 *   scene set. They are photographs of the type of home, not of the plan
 *   named on the listing, and the footer tells a visitor so.
 *
 * None of it is a photograph of the yard on River Road, and none of it is
 * NERTO's to license. Photograph the lot and the homes standing on it, drop
 * the files under `public/photos/`, and repoint these keys — then delete the
 * photography paragraph in `components/site-footer.tsx`. A key whose
 * photograph is deleted rather than replaced renders the empty plate, which
 * is a better interim state than a stranger's marketing shot.
 *
 * Page keys the site is wired for: `page/homes` (the `/listings` hero — the
 * key kept its name when the route was renamed), `page/communities`,
 * `page/start-here`, `page/why-manufactured`, `page/financing`,
 * `page/faq`, `page/prequalify`, `page/promotions`, `page/blog`,
 * `page/address`, `page/about`, `page/contact`, `page/saved`,
 * `page/not-found`, `page/home-closing` (the wide band under the hero),
 * `page/reviews` (behind the testimonials),
 * `page/about-team-1` … `page/about-team-4`, and `blog/<slug>` for a post's
 * hero. Every one of those with no photograph renders as the empty plate,
 * which is the correct outcome — it is never filled with a stand-in.
 *
 * The homepage hero is the one image that is NOT listed here: it is
 * imported directly in `components/landing.tsx` so it can ship a blur
 * placeholder. `public/photos/hero-home.jpg` is a stock exterior standing in
 * until the lot is photographed — replace the file in place and rewrite its
 * `alt`.
 */
export const photos: Record<string, string> = {
  "anniversary-choice/bath": "/photos/homes/anniversary-choice/bath.webp",
  "anniversary-choice/bedroom": "/photos/homes/anniversary-choice/bedroom.webp",
  "anniversary-choice/exterior": "/photos/homes/anniversary-choice/exterior.webp",
  "anniversary-choice/kitchen": "/photos/homes/anniversary-choice/kitchen.webp",
  "anniversary-choice/living": "/photos/homes/anniversary-choice/living.webp",
  "breeze/bath": "/photos/homes/breeze/bath.webp",
  "breeze/bedroom": "/photos/homes/breeze/bedroom.webp",
  "breeze/exterior": "/photos/homes/breeze/exterior.webp",
  "breeze/kitchen": "/photos/homes/breeze/kitchen.webp",
  "breeze/living": "/photos/homes/breeze/living.webp",
  "breeze/porch": "/photos/homes/breeze/porch.webp",
  "buttercup/bath": "/photos/homes/buttercup/bath.webp",
  "buttercup/bedroom": "/photos/homes/buttercup/bedroom.webp",
  "buttercup/exterior": "/photos/homes/buttercup/exterior.webp",
  "buttercup/kitchen": "/photos/homes/buttercup/kitchen.webp",
  "buttercup/living": "/photos/homes/buttercup/living.webp",
  "cook/bath": "/photos/homes/cook/bath.webp",
  "cook/exterior": "/photos/homes/cook/exterior.webp",
  "cook/kitchen": "/photos/homes/cook/kitchen.webp",
  "cook/living": "/photos/homes/cook/living.webp",
  "crockett/bath": "/photos/homes/crockett/bath.webp",
  "crockett/exterior": "/photos/homes/crockett/exterior.webp",
  "crockett/kitchen": "/photos/homes/crockett/kitchen.webp",
  "crockett/living": "/photos/homes/crockett/living.webp",
  "cypress/bath": "/photos/homes/cypress/bath.webp",
  "cypress/bedroom": "/photos/homes/cypress/bedroom.webp",
  "cypress/exterior": "/photos/homes/cypress/exterior.webp",
  "cypress/kitchen": "/photos/homes/cypress/kitchen.webp",
  "cypress/living": "/photos/homes/cypress/living.webp",
  "cypress/porch": "/photos/homes/cypress/porch.webp",
  "double-maxx-elite-56/bath": "/photos/homes/double-maxx-elite-56/bath.webp",
  "double-maxx-elite-56/bedroom": "/photos/homes/double-maxx-elite-56/bedroom.webp",
  "double-maxx-elite-56/exterior": "/photos/homes/double-maxx-elite-56/exterior.webp",
  "double-maxx-elite-56/kitchen": "/photos/homes/double-maxx-elite-56/kitchen.webp",
  "double-maxx-elite-56/living": "/photos/homes/double-maxx-elite-56/living.webp",
  "double-maxx-elite-64/bath": "/photos/homes/double-maxx-elite-64/bath.webp",
  "double-maxx-elite-64/bedroom": "/photos/homes/double-maxx-elite-64/bedroom.webp",
  "double-maxx-elite-64/exterior": "/photos/homes/double-maxx-elite-64/exterior.webp",
  "double-maxx-elite-64/kitchen": "/photos/homes/double-maxx-elite-64/kitchen.webp",
  "double-maxx-elite-64/living": "/photos/homes/double-maxx-elite-64/living.webp",
  "el-sueno-breeze/bath": "/photos/homes/el-sueno-breeze/bath.webp",
  "el-sueno-breeze/exterior": "/photos/homes/el-sueno-breeze/exterior.webp",
  "el-sueno-breeze/kitchen": "/photos/homes/el-sueno-breeze/kitchen.webp",
  "el-sueno-breeze/living": "/photos/homes/el-sueno-breeze/living.webp",
  "elation/bath": "/photos/homes/elation/bath.webp",
  "elation/bedroom": "/photos/homes/elation/bedroom.webp",
  "elation/exterior": "/photos/homes/elation/exterior.webp",
  "elation/kitchen": "/photos/homes/elation/kitchen.webp",
  "elation/living": "/photos/homes/elation/living.webp",
  "everett/bath": "/photos/homes/everett/bath.webp",
  "everett/bedroom": "/photos/homes/everett/bedroom.webp",
  "everett/exterior": "/photos/homes/everett/exterior.webp",
  "everett/kitchen": "/photos/homes/everett/kitchen.webp",
  "everett/living": "/photos/homes/everett/living.webp",
  "farm-4-flex-elite/bath": "/photos/homes/farm-4-flex-elite/bath.webp",
  "farm-4-flex-elite/exterior": "/photos/homes/farm-4-flex-elite/exterior.webp",
  "farm-4-flex-elite/kitchen": "/photos/homes/farm-4-flex-elite/kitchen.webp",
  "farm-4-flex-elite/living": "/photos/homes/farm-4-flex-elite/living.webp",
  "franklin/bath": "/photos/homes/franklin/bath.webp",
  "franklin/kitchen": "/photos/homes/franklin/kitchen.webp",
  "franklin/living": "/photos/homes/franklin/living.webp",
  "haven/bath": "/photos/homes/haven/bath.webp",
  "haven/exterior": "/photos/homes/haven/exterior.webp",
  "haven/kitchen": "/photos/homes/haven/kitchen.webp",
  "haven/living": "/photos/homes/haven/living.webp",
  "magellan/bath": "/photos/homes/magellan/bath.webp",
  "magellan/bedroom": "/photos/homes/magellan/bedroom.webp",
  "magellan/exterior": "/photos/homes/magellan/exterior.webp",
  "magellan/kitchen": "/photos/homes/magellan/kitchen.webp",
  "magellan/living": "/photos/homes/magellan/living.webp",
  "pride/bath": "/photos/homes/pride/bath.webp",
  "pride/bedroom": "/photos/homes/pride/bedroom.webp",
  "pride/exterior": "/photos/homes/pride/exterior.webp",
  "pride/kitchen": "/photos/homes/pride/kitchen.webp",
  "pride/living": "/photos/homes/pride/living.webp",
  "satisfaction/bath": "/photos/homes/satisfaction/bath.webp",
  "satisfaction/bedroom": "/photos/homes/satisfaction/bedroom.webp",
  "satisfaction/exterior": "/photos/homes/satisfaction/exterior.webp",
  "satisfaction/kitchen": "/photos/homes/satisfaction/kitchen.webp",
  "satisfaction/living": "/photos/homes/satisfaction/living.webp",
  "the-fusion-32b/bath": "/photos/homes/the-fusion-32b/bath.webp",
  "the-fusion-32b/bedroom": "/photos/homes/the-fusion-32b/bedroom.webp",
  "the-fusion-32b/exterior": "/photos/homes/the-fusion-32b/exterior.webp",
  "the-fusion-32b/kitchen": "/photos/homes/the-fusion-32b/kitchen.webp",
  "the-fusion-32b/living": "/photos/homes/the-fusion-32b/living.webp",
  "tinsley/bath": "/photos/homes/tinsley/bath.webp",
  "tinsley/bedroom": "/photos/homes/tinsley/bedroom.webp",
  "tinsley/exterior": "/photos/homes/tinsley/exterior.webp",
  "tinsley/kitchen": "/photos/homes/tinsley/kitchen.webp",
  "tinsley/living": "/photos/homes/tinsley/living.webp",
  "willow/bath": "/photos/homes/willow/bath.webp",
  "willow/exterior": "/photos/homes/willow/exterior.webp",
  "willow/kitchen": "/photos/homes/willow/kitchen.webp",
  "willow/living": "/photos/homes/willow/living.webp",
  "page/homes": "/photos/homes/double-maxx-elite-64/exterior.webp",
  "page/reviews": "/photos/homes/breeze/living.webp",
  "page/why-manufactured": "/photos/homes/double-maxx-elite-56/exterior.webp",
  "page/financing": "/photos/homes/breeze/exterior.webp",
  "page/start-here": "/photos/homes/everett/exterior.webp",
  "page/about": "/photos/homes/elation/exterior.webp",
  "page/contact": "/photos/homes/cypress/exterior.webp",
  "page/saved": "/photos/homes/anniversary-choice/living.webp",
  "page/not-found": "/photos/homes/satisfaction/exterior.webp",
  "page/home-closing": "/photos/homes/tinsley/exterior.webp",
};

/** The photo registered for a key, or undefined when there is none. */
export function photoFor(key?: string): string | undefined {
  return key ? photos[key] : undefined;
}

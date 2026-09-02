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
 * READ THIS BEFORE THE SITE GOES LIVE.
 *
 * The catalogue is empty (see `lib/homes.ts`), so there are no per-home keys
 * left in this map. What remains is the page heroes, and every one of them
 * is still pointing at the template's imported manufacturer model
 * photography under `public/photos/homes/` — pictures of manufactured homes
 * in general, not of anything on NERTO's lot, and not NERTO's to license.
 *
 * They are placeholders. Photograph the yard on River Road and the homes
 * standing on it, drop the files under `public/photos/`, and repoint these
 * keys. A key whose photograph is deleted rather than replaced renders the
 * empty plate, which is a perfectly acceptable interim state and a better
 * one than a stranger's marketing shot.
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
  /* Page heroes. Placeholders — see the note above. */
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

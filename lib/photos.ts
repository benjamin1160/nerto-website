import { importedPhotos } from "./photos.generated";

/**
 * The photo desk — one lookup for every photograph on the site.
 *
 * Key naming — three shapes, and only three:
 *
 *   "<home-slug>/<scene-kind>"   one scene on one home
 *                                kinds: exterior · living · kitchen
 *                                       bedroom · bath · porch
 *   "community/<community-slug>" a community's hero image
 *   "page/<name>"               a page hero or a one-off site image
 *
 * Values are paths under `public/`, so `/photos/pages/about.webp` lives at
 * `public/photos/pages/about.webp`. Use `.jpg` or `.webp`, roughly 2000px on
 * the long edge, and name the file after the key.
 *
 * The site shows photographs and nothing else. There is no generated artwork
 * behind this map: a key with no photograph renders as an empty plate saying
 * so, which is why every listing in `lib/homes.ts` declares only the scenes
 * it actually has a picture of. Add a scene to a listing without adding its
 * photograph here and the gallery will show that plate — check both together.
 *
 * Two halves:
 *
 *   `importedPhotos` is generated from what is really in
 *   `public/photos/homes/` by `node scripts/import-manufacturers.mjs
 *   manifest`. Do not hand-edit it; it is rewritten on every import.
 *
 *   The map below is hand-written, and holds the page heroes and one-offs.
 *
 * READ THIS BEFORE THE SITE GOES LIVE. Nothing registered here is a
 * photograph of the yard on River Road, and none of it is NERTO's to
 * license:
 *
 *   Pleasant Valley's exterior renderings, one per modular plan. A rendering
 *   is a drawing of a house that has not been built yet — it pictures the
 *   plan honestly, but it is not a photograph.
 *
 *   Pine Grove's photographs of the four models NERTO keeps on the lot. They
 *   picture that model at Pine Grove, not the particular house standing on
 *   River Road.
 *
 *   The page heroes under `/photos/pages/`, which are stock exteriors carried
 *   over from the template and picture nobody's home in particular.
 *
 * Photograph the lot and the homes standing on it, drop the files under
 * `public/photos/`, and repoint these keys — then delete the photography
 * paragraph in `components/site-footer.tsx`. A key whose photograph is
 * deleted rather than replaced renders the empty plate, which is a better
 * interim state than a stranger's marketing shot.
 *
 * Page keys the site is wired for: `page/homes` (the `/listings` hero — the
 * key kept its name when the route was renamed), `page/communities`,
 * `page/start-here`, `page/why-manufactured`, `page/financing`,
 * `page/faq`, `page/prequalify`, `page/promotions`, `page/blog`,
 * `page/address`, `page/about`, `page/contact`, `page/saved`,
 * `page/projects`, `page/videos`, `page/not-found`,
 * `page/home-closing` (the wide band under the hero),
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
  /* Every imported home's scenes, generated from disk. */
  ...importedPhotos,

  /* Page heroes and one-offs, hand-written. */
  "page/homes": "/photos/pages/homes.webp",
  "page/reviews": "/photos/pages/reviews.webp",
  "page/why-manufactured": "/photos/pages/why-manufactured.webp",
  "page/financing": "/photos/pages/financing.webp",
  "page/start-here": "/photos/pages/start-here.webp",
  "page/about": "/photos/pages/about.webp",
  "page/contact": "/photos/pages/contact.webp",
  "page/saved": "/photos/pages/saved.webp",
  "page/not-found": "/photos/pages/not-found.webp",
  "page/home-closing": "/photos/pages/home-closing.webp",
  /* The NETR G-3160 job, delivered and standing — an actual project photo
     rather than a stock plate, since that is the page's whole argument. */
  "page/projects": "/photos/projects/netr-g-3160/24.jpg",
};

/** The photo registered for a key, or undefined when there is none. */
export function photoFor(key?: string): string | undefined {
  return key ? photos[key] : undefined;
}

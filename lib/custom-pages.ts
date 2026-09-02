/**
 * Custom pages: the landing page again, narrowed to one slice of the
 * catalogue.
 *
 * A dealership running an ad for its CrossMod homes wants a page that reads
 * like the front page — same hero, same closing call to action — with the
 * listings band showing only those homes and a heading that names them. That
 * is what `/p/<slug>` is. It renders `components/landing.tsx` with a series
 * filter, so a change to the landing composition reaches every custom page
 * without anybody remembering to update them.
 *
 * `series` must match a `series` value in `lib/homes.ts` exactly. A page
 * whose series matches nothing on the lot 404s rather than showing an empty
 * band — an ad pointing at a page with no homes on it is worse than a broken
 * link, because it looks like it worked.
 *
 * Ships empty. Add an entry and the route exists.
 */

export type CustomPage = {
  /** The URL segment: `/p/<slug>`. Lower case, hyphens, no slashes. */
  slug: string;
  /** Browser title and the listings-band heading. */
  title: string;
  /** One sentence under the heading. Optional. */
  subheadline?: string;
  /** Meta description. Falls back to `subheadline`. */
  description?: string;
  /** Series to filter the catalogue by, from `lib/homes.ts`. */
  series: string;
  /** Unpublished pages 404 without being deleted. */
  published?: boolean;
};

export const customPages: CustomPage[] = [];

export function publishedCustomPages(): CustomPage[] {
  return customPages.filter((page) => page.published !== false);
}

export function customPageBySlug(slug: string): CustomPage | undefined {
  return publishedCustomPages().find((page) => page.slug === slug);
}

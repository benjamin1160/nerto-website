/**
 * Posts.
 *
 * The template ships none, which is the honest default: a dealership site
 * with three lorem-ipsum articles on it reads worse than one with no blog at
 * all. `pages.blog` in `lib/page-config.ts` is off to match — write a post,
 * turn the page on, and `/blog` and `/blog/<slug>` start existing.
 *
 * Bodies are paragraphs of plain text, one string each, so this file stays
 * free of markup and of components. Anything that needs a heading inside it
 * probably wants to be two posts.
 */

export type BlogPost = {
  slug: string;
  title: string;
  /** One sentence for the index card and the meta description. */
  excerpt: string;
  /** ISO date, `YYYY-MM-DD`. Drives the ordering and the dateline. */
  publishedOn: string;
  /** Who wrote it. Omit and the byline disappears. */
  author?: string;
  /** One string per paragraph. */
  body: string[];
};

export const posts: BlogPost[] = [];

/** Newest first. */
export function publishedPosts(): BlogPost[] {
  return [...posts].sort((a, b) => b.publishedOn.localeCompare(a.publishedOn));
}

export function postBySlug(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}

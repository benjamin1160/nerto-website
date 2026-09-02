/**
 * Past projects — homes NERTO has actually delivered and set.
 *
 * This is the one part of the site that is evidence rather than catalogue.
 * Everything under `/listings` is a plan a manufacturer publishes; a project
 * is a house that exists, on ground in Maine, that this company put there.
 * For a turnkey builder that is the whole argument, so it gets its own route
 * and its own band on the landing page.
 *
 * SHIPS EMPTY, and `pages.projects` in `lib/page-config.ts` is off to match.
 * Add one project and turn the switch on; `/projects`, `/projects/<slug>`,
 * the nav links and the landing band all start existing together. An empty
 * gallery of past work is worse than no gallery — it reads as a company that
 * has not done any.
 *
 * Photographs are plain paths under `public/`, not keys into
 * `lib/photos.ts`: a project's pictures belong to that project and are never
 * reused as scenery elsewhere, so the indirection would buy nothing. Drop
 * files under `public/photos/projects/<slug>/` and list them here in the
 * order they should be shown. The first is the cover.
 *
 * Never write a project NERTO did not do, and never illustrate one with a
 * photograph of a different house. An absent field hides itself — that is
 * the rule everywhere in this codebase and it matters most here.
 */

/** What NERTO handled on a project. Free text — these are the usual ones. */
export type ProjectScope =
  | "Land search"
  | "Permitting"
  | "Survey"
  | "Septic design"
  | "Septic system"
  | "Well"
  | "Earthwork"
  | "Driveway"
  | "Foundation"
  | "Slab"
  | "Electrical"
  | "Utility connections"
  | "Delivery"
  | "Set and finish"
  | "Financing";

export type Project = {
  /** URL segment, kebab-case. */
  slug: string;
  /** What to call it — usually the family or the town, not the model code. */
  title: string;
  /** Town and county, e.g. "Windsor, Kennebec County". */
  location?: string;
  /** ISO `YYYY-MM` or `YYYY-MM-DD`. Drives the ordering and the dateline. */
  completedOn?: string;
  /** One sentence for the card and the meta description. */
  summary: string;
  /** The story, one string per paragraph. */
  body?: string[];
  /**
   * The catalogue slug of the home that was set, where it is one we still
   * carry. Renders as a link through to the plan; an unknown slug is caught
   * by `npm run lint`.
   */
  homeSlug?: string;
  /** What NERTO did on this one. The turnkey claim, made specific. */
  scope?: ProjectScope[];
  /** Paths under `public/`. The first is the cover image. */
  photos?: string[];
  /** What the customer said, if they said something and agreed to be quoted. */
  testimonial?: { quote: string; attribution: string };
};

export const projects: Project[] = [];

/** Newest first, with undated projects last. */
export function publishedProjects(): Project[] {
  return [...projects].sort((a, b) =>
    (b.completedOn ?? "").localeCompare(a.completedOn ?? ""),
  );
}

export function projectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

/** The cover image for a project, or undefined when it has no photographs. */
export function projectCover(project: Project): string | undefined {
  return project.photos?.[0];
}

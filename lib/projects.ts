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

export const projects: Project[] = [
  {
    slug: "netr-g-3160",
    title: "NETR G-3160",
    location: "Whitefield, Maine",
    completedOn: "2026-08",
    summary:
      "A NETR G-3160 NERTO carried land through finish — septic, well, driveway, foundation, electrical and utility hookups, delivery, and set and finish.",
    homeSlug: "netr-g-3160",
    scope: [
      "Land search",
      "Permitting",
      "Septic system",
      "Well",
      "Driveway",
      "Foundation",
      "Electrical",
      "Utility connections",
      "Delivery",
      "Set and finish",
    ],
    photos: [
      "/photos/projects/netr-g-3160/19.jpg",
      "/photos/projects/netr-g-3160/01.jpg",
      "/photos/projects/netr-g-3160/02.jpg",
      "/photos/projects/netr-g-3160/03.jpg",
      "/photos/projects/netr-g-3160/04.jpg",
      "/photos/projects/netr-g-3160/05.jpg",
      "/photos/projects/netr-g-3160/06.jpg",
      "/photos/projects/netr-g-3160/07.jpg",
      "/photos/projects/netr-g-3160/08.jpg",
      "/photos/projects/netr-g-3160/09.jpg",
      "/photos/projects/netr-g-3160/10.jpg",
      "/photos/projects/netr-g-3160/11.jpg",
      "/photos/projects/netr-g-3160/12.jpg",
      "/photos/projects/netr-g-3160/13.jpg",
      "/photos/projects/netr-g-3160/14.jpg",
      "/photos/projects/netr-g-3160/15.jpg",
      "/photos/projects/netr-g-3160/16.jpg",
      "/photos/projects/netr-g-3160/17.jpg",
      "/photos/projects/netr-g-3160/18.jpg",
      "/photos/projects/netr-g-3160/20.jpg",
      "/photos/projects/netr-g-3160/21.jpg",
      "/photos/projects/netr-g-3160/22.jpg",
      "/photos/projects/netr-g-3160/23.jpg",
      "/photos/projects/netr-g-3160/24.jpg",
      "/photos/projects/netr-g-3160/25.jpg",
      "/photos/projects/netr-g-3160/26.jpg",
      "/photos/projects/netr-g-3160/27.jpg",
      "/photos/projects/netr-g-3160/28.jpg",
      "/photos/projects/netr-g-3160/29.jpg",
      "/photos/projects/netr-g-3160/30.jpg",
      "/photos/projects/netr-g-3160/31.jpg",
      "/photos/projects/netr-g-3160/32.jpg",
      "/photos/projects/netr-g-3160/33.jpg",
      "/photos/projects/netr-g-3160/34.jpg",
      "/photos/projects/netr-g-3160/35.jpg",
      "/photos/projects/netr-g-3160/36.jpg",
      "/photos/projects/netr-g-3160/37.jpg",
    ],
  },
];

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

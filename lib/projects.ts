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

export type ProjectVideo = {
  /** Path under `public/`. */
  src: string;
  /** A still from the clip, under `public/`. */
  poster: string;
  title: string;
  /** Runtime as it should read, e.g. "1:54". */
  duration?: string;
  /** Portrait phone footage is the norm; set false for a landscape clip. */
  portrait?: boolean;
};

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
  /**
   * Walkthrough clips of this house, shown above the photographs. Files
   * under `public/videos/projects/<slug>/`, encoded small (720p, H.264,
   * faststart) because they play on phones; nothing loads until play.
   */
  videos?: ProjectVideo[];
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
  {
    slug: "augusta-cape",
    title: "Augusta Cape",
    location: "Augusta, Maine",
    summary:
      "Just over 1,500 square feet at the end of a cul-de-sac in Augusta — a Cape with the primary suite on the first floor and a full basement below.",
    body: [
      "The kitchen has quartz counters, a center island and a pantry. The primary bedroom is on the first floor, with a walk-in closet and its own bath, and there is a dedicated mudroom with laundry.",
      "Upstairs are two more bedrooms and a full bath. Underneath is a full poured-concrete basement.",
    ],
    videos: [
      {
        src: "/videos/projects/augusta-cape/tour.mp4",
        poster: "/videos/projects/augusta-cape/tour.jpg",
        title: "Walkthrough",
        duration: "1:54",
      },
      {
        src: "/videos/projects/augusta-cape/1.mp4",
        poster: "/videos/projects/augusta-cape/1.jpg",
        title: "Inside",
        duration: "0:24",
      },
      {
        src: "/videos/projects/augusta-cape/2.mp4",
        poster: "/videos/projects/augusta-cape/2.jpg",
        title: "Outside",
        duration: "0:14",
      },
      {
        src: "/videos/projects/augusta-cape/3.mp4",
        poster: "/videos/projects/augusta-cape/3.jpg",
        title: "A closer look",
        duration: "0:24",
      },
    ],
    photos: [
      "/photos/projects/augusta-cape/01.jpg",
      "/photos/projects/augusta-cape/02.jpg",
      "/photos/projects/augusta-cape/03.jpg",
      "/photos/projects/augusta-cape/04.jpg",
      "/photos/projects/augusta-cape/05.jpg",
      "/photos/projects/augusta-cape/06.jpg",
      "/photos/projects/augusta-cape/07.jpg",
      "/photos/projects/augusta-cape/08.jpg",
      "/photos/projects/augusta-cape/09.jpg",
      "/photos/projects/augusta-cape/10.jpg",
      "/photos/projects/augusta-cape/11.jpg",
      "/photos/projects/augusta-cape/12.jpg",
      "/photos/projects/augusta-cape/13.jpg",
      "/photos/projects/augusta-cape/14.jpg",
      "/photos/projects/augusta-cape/15.jpg",
      "/photos/projects/augusta-cape/16.jpg",
      "/photos/projects/augusta-cape/17.jpg",
      "/photos/projects/augusta-cape/18.jpg",
      "/photos/projects/augusta-cape/19.jpg",
      "/photos/projects/augusta-cape/20.jpg",
      "/photos/projects/augusta-cape/21.jpg",
      "/photos/projects/augusta-cape/22.jpg",
      "/photos/projects/augusta-cape/23.jpg",
      "/photos/projects/augusta-cape/24.jpg",
      "/photos/projects/augusta-cape/25.jpg",
      "/photos/projects/augusta-cape/26.jpg",
      "/photos/projects/augusta-cape/27.jpg",
      "/photos/projects/augusta-cape/28.jpg",
      "/photos/projects/augusta-cape/29.jpg",
      "/photos/projects/augusta-cape/30.jpg",
      "/photos/projects/augusta-cape/31.jpg",
      "/photos/projects/augusta-cape/32.jpg",
      "/photos/projects/augusta-cape/33.jpg",
      "/photos/projects/augusta-cape/34.jpg",
      "/photos/projects/augusta-cape/35.jpg",
      "/photos/projects/augusta-cape/36.jpg",
      "/photos/projects/augusta-cape/37.jpg",
      "/photos/projects/augusta-cape/38.jpg",
      "/photos/projects/augusta-cape/39.jpg",
      "/photos/projects/augusta-cape/40.jpg",
      "/photos/projects/augusta-cape/41.jpg",
      "/photos/projects/augusta-cape/42.jpg",
      "/photos/projects/augusta-cape/43.jpg",
      "/photos/projects/augusta-cape/44.jpg",
      "/photos/projects/augusta-cape/45.jpg",
      "/photos/projects/augusta-cape/46.jpg",
      "/photos/projects/augusta-cape/47.jpg",
      "/photos/projects/augusta-cape/48.jpg",
      "/photos/projects/augusta-cape/49.jpg",
      "/photos/projects/augusta-cape/50.jpg",
      "/photos/projects/augusta-cape/51.jpg",
      "/photos/projects/augusta-cape/52.jpg",
      "/photos/projects/augusta-cape/53.jpg",
      "/photos/projects/augusta-cape/54.jpg",
      "/photos/projects/augusta-cape/55.jpg",
      "/photos/projects/augusta-cape/56.jpg",
      "/photos/projects/augusta-cape/57.jpg",
    ],
  },
  {
    slug: "g-16-611",
    title: "G-16-611",
    location: "Pittston, Maine",
    homeSlug: "g-16-611",
    summary:
      "A 1,042 sq ft Pine Grove G-16-611 single-section, three bedrooms and two baths, set on land NERTO owns — and spoken for.",
    body: [
      "Pine Grove built the home in its plant. NERTO ran everything on the ground: land development, the driveway permit, septic, well, the Central Maine Power coordination, delivery, inspections and the final walkthrough.",
      "This one is sold. The same home can go on your land, or on land we help you find.",
    ],
    scope: [
      "Earthwork",
      "Permitting",
      "Septic system",
      "Well",
      "Utility connections",
      "Delivery",
    ],
    videos: [
      {
        src: "/videos/projects/g-16-611/tour.mp4",
        poster: "/videos/projects/g-16-611/tour.jpg",
        title: "Walkthrough",
        duration: "1:43",
      },
      {
        src: "/videos/projects/g-16-611/1.mp4",
        poster: "/videos/projects/g-16-611/1.jpg",
        title: "Inside",
        duration: "0:20",
      },
      {
        src: "/videos/projects/g-16-611/2.mp4",
        poster: "/videos/projects/g-16-611/2.jpg",
        title: "Outside",
        duration: "0:10",
      },
    ],
    photos: [
      "/photos/projects/g-16-611/01.jpg",
      "/photos/projects/g-16-611/02.jpg",
      "/photos/projects/g-16-611/03.jpg",
      "/photos/projects/g-16-611/04.jpg",
      "/photos/projects/g-16-611/05.jpg",
      "/photos/projects/g-16-611/06.jpg",
      "/photos/projects/g-16-611/07.jpg",
      "/photos/projects/g-16-611/08.jpg",
      "/photos/projects/g-16-611/09.jpg",
      "/photos/projects/g-16-611/10.jpg",
      "/photos/projects/g-16-611/11.jpg",
      "/photos/projects/g-16-611/12.jpg",
      "/photos/projects/g-16-611/13.jpg",
      "/photos/projects/g-16-611/14.jpg",
      "/photos/projects/g-16-611/15.jpg",
      "/photos/projects/g-16-611/16.jpg",
      "/photos/projects/g-16-611/17.jpg",
      "/photos/projects/g-16-611/18.jpg",
      "/photos/projects/g-16-611/19.jpg",
      "/photos/projects/g-16-611/20.jpg",
      "/photos/projects/g-16-611/21.jpg",
      "/photos/projects/g-16-611/22.jpg",
      "/photos/projects/g-16-611/23.jpg",
      "/photos/projects/g-16-611/24.jpg",
      "/photos/projects/g-16-611/25.jpg",
      "/photos/projects/g-16-611/26.jpg",
      "/photos/projects/g-16-611/27.jpg",
      "/photos/projects/g-16-611/28.jpg",
      "/photos/projects/g-16-611/29.jpg",
      "/photos/projects/g-16-611/30.jpg",
      "/photos/projects/g-16-611/31.jpg",
      "/photos/projects/g-16-611/32.jpg",
      "/photos/projects/g-16-611/33.jpg",
      "/photos/projects/g-16-611/34.jpg",
      "/photos/projects/g-16-611/35.jpg",
      "/photos/projects/g-16-611/36.jpg",
      "/photos/projects/g-16-611/37.jpg",
      "/photos/projects/g-16-611/38.jpg",
      "/photos/projects/g-16-611/39.jpg",
      "/photos/projects/g-16-611/40.jpg",
    ],
  },
  {
    slug: "netr-g-3465",
    title: "NETR G-3465",
    location: "Richmond, Maine",
    homeSlug: "netr-g-3465",
    summary:
      "A NETR G-3465 double-section ranch with green kitchen cabinets, NERTO delivered and set on open ground, with a gravel drive and a graded pad.",
    photos: [
      "/photos/projects/netr-g-3465/01.jpg",
      "/photos/projects/netr-g-3465/02.jpg",
      "/photos/projects/netr-g-3465/03.jpg",
      "/photos/projects/netr-g-3465/04.jpg",
      "/photos/projects/netr-g-3465/05.jpg",
      "/photos/projects/netr-g-3465/06.jpg",
      "/photos/projects/netr-g-3465/07.jpg",
      "/photos/projects/netr-g-3465/08.jpg",
      "/photos/projects/netr-g-3465/09.jpg",
      "/photos/projects/netr-g-3465/10.jpg",
      "/photos/projects/netr-g-3465/11.jpg",
      "/photos/projects/netr-g-3465/12.jpg",
      "/photos/projects/netr-g-3465/13.jpg",
      "/photos/projects/netr-g-3465/14.jpg",
      "/photos/projects/netr-g-3465/15.jpg",
      "/photos/projects/netr-g-3465/16.jpg",
      "/photos/projects/netr-g-3465/17.jpg",
      "/photos/projects/netr-g-3465/18.jpg",
      "/photos/projects/netr-g-3465/19.jpg",
      "/photos/projects/netr-g-3465/20.jpg",
      "/photos/projects/netr-g-3465/21.jpg",
      "/photos/projects/netr-g-3465/22.jpg",
      "/photos/projects/netr-g-3465/23.jpg",
      "/photos/projects/netr-g-3465/24.jpg",
      "/photos/projects/netr-g-3465/25.jpg",
      "/photos/projects/netr-g-3465/26.jpg",
      "/photos/projects/netr-g-3465/27.jpg",
      "/photos/projects/netr-g-3465/28.jpg",
      "/photos/projects/netr-g-3465/29.jpg",
      "/photos/projects/netr-g-3465/30.jpg",
      "/photos/projects/netr-g-3465/31.jpg",
      "/photos/projects/netr-g-3465/32.jpg",
      "/photos/projects/netr-g-3465/33.jpg",
      "/photos/projects/netr-g-3465/34.jpg",
      "/photos/projects/netr-g-3465/35.jpg",
      "/photos/projects/netr-g-3465/36.jpg",
      "/photos/projects/netr-g-3465/37.jpg",
      "/photos/projects/netr-g-3465/38.jpg",
      "/photos/projects/netr-g-3465/39.jpg",
      "/photos/projects/netr-g-3465/40.jpg",
      "/photos/projects/netr-g-3465/41.jpg",
      "/photos/projects/netr-g-3465/42.jpg",
      "/photos/projects/netr-g-3465/43.jpg",
    ],
  },
  {
    slug: "netr-g-3157",
    title: "NETR G-3157",
    location: "Newfield, Maine",
    homeSlug: "netr-g-3157",
    summary:
      "A NETR G-3157 double-section NERTO delivered and set on a cleared wooded lot, with a full-width covered front porch added to the plan.",
    photos: [
      "/photos/projects/netr-g-3157/01.jpg",
      "/photos/projects/netr-g-3157/02.jpg",
      "/photos/projects/netr-g-3157/03.jpg",
      "/photos/projects/netr-g-3157/04.jpg",
      "/photos/projects/netr-g-3157/05.jpg",
      "/photos/projects/netr-g-3157/06.jpg",
      "/photos/projects/netr-g-3157/07.jpg",
      "/photos/projects/netr-g-3157/08.jpg",
      "/photos/projects/netr-g-3157/09.jpg",
      "/photos/projects/netr-g-3157/10.jpg",
      "/photos/projects/netr-g-3157/11.jpg",
      "/photos/projects/netr-g-3157/12.jpg",
      "/photos/projects/netr-g-3157/13.jpg",
      "/photos/projects/netr-g-3157/14.jpg",
      "/photos/projects/netr-g-3157/15.jpg",
      "/photos/projects/netr-g-3157/16.jpg",
      "/photos/projects/netr-g-3157/17.jpg",
      "/photos/projects/netr-g-3157/18.jpg",
      "/photos/projects/netr-g-3157/19.jpg",
      "/photos/projects/netr-g-3157/20.jpg",
      "/photos/projects/netr-g-3157/21.jpg",
      "/photos/projects/netr-g-3157/22.jpg",
      "/photos/projects/netr-g-3157/23.jpg",
      "/photos/projects/netr-g-3157/24.jpg",
      "/photos/projects/netr-g-3157/25.jpg",
      "/photos/projects/netr-g-3157/26.jpg",
      "/photos/projects/netr-g-3157/27.jpg",
      "/photos/projects/netr-g-3157/28.jpg",
      "/photos/projects/netr-g-3157/29.jpg",
      "/photos/projects/netr-g-3157/30.jpg",
      "/photos/projects/netr-g-3157/31.jpg",
      "/photos/projects/netr-g-3157/32.jpg",
      "/photos/projects/netr-g-3157/33.jpg",
      "/photos/projects/netr-g-3157/34.jpg",
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

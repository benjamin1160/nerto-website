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
 * The communities
 *
 * Five real manufactured-home communities in the Knoxville and Maryville
 * market, all of them land-lease properties operated by YES! Communities.
 * Names, cities and the amenities listed below come from the operator's
 * own community pages, linked on each entry.
 *
 * Lot rents, homesite counts, vacancy and founding dates are NOT published
 * for these properties, so they are absent here rather than invented — the
 * community page hides a figure it does not have. Fill them in from the
 * operator's current rate sheet before quoting anyone.
 *
 * These communities are independently operated. Nothing here implies an
 * agency or exclusive-placement arrangement with them; the home-to-community
 * links in `lib/homes.ts` are illustrative for the template.
 * ------------------------------------------------------------------ */

export const communities: Community[] = [
  {
    slug: "amherst-ridge",
    name: "Amherst Ridge",
    city: "Knoxville",
    state: "TN",
    tenure: "Land-lease",
    operator: "YES! Communities",
    url: "https://www.yescommunities.com/community/amherst-ridge/",
    blurb:
      "An all-ages community on the north-west side, about fifteen minutes from downtown Knoxville and the closest of the five to the interstate. The most amenity-heavy property on this list — there is a lake in the middle of it.",
    amenities: [
      "All ages — no age restriction",
      "Swimming pool and clubhouse",
      "Playground and basketball courts",
      "Walking trails and a lake",
      "RV and boat storage",
      "Keyed mailboxes",
    ],
  },
  {
    slug: "farragut-park",
    name: "Farragut Park",
    city: "Knoxville",
    state: "TN",
    tenure: "Land-lease",
    operator: "YES! Communities",
    url: "https://www.yescommunities.com/community/farragut-park/",
    blurb:
      "West Knoxville, off Southfork Drive, with a pavilion and picnic ground that get used — the community runs resident events through the year rather than listing amenities nobody books.",
    amenities: [
      "Swimming pool",
      "Playground",
      "Walking trails",
      "Picnic areas and a pavilion",
      "RV and boat storage",
      "Regular resident events",
    ],
  },
  {
    slug: "little-river",
    name: "Little River",
    city: "Louisville",
    state: "TN",
    tenure: "Land-lease",
    operator: "YES! Communities",
    url: "https://www.yescommunities.com/community/little-river/",
    blurb:
      "Between Knoxville and Maryville near the mouth of the Little River, which puts the airport, Alcoa Highway and the Foothills Parkway all inside twenty minutes. Ask the office for the current amenity list and rate sheet — they do not publish either.",
  },
  {
    slug: "rockford-park",
    name: "Rockford Park",
    city: "Maryville",
    state: "TN",
    tenure: "Land-lease",
    operator: "YES! Communities",
    url: "https://www.yescommunities.com/community/rockford-park/",
    blurb:
      "Blount County, on the Maryville side of Rockford and the shortest run to our lot of any community here. Rents and homesite availability come straight from the community office.",
  },
  {
    slug: "willow-hill",
    name: "Willow Hill",
    city: "Maryville",
    state: "TN",
    tenure: "Land-lease",
    operator: "YES! Communities",
    url: "https://www.yescommunities.com/community/willow-hill/",
    blurb:
      "Off Big Springs Road on the south edge of Maryville — schools, the hospital and the Smokies gateway at Townsend all within a fifteen-minute drive.",
  },
];

export function getCommunity(slug: string): Community | undefined {
  return communities.find((c) => c.slug === slug);
}

/**
 * The questions buyers actually ask, and the answers this dealership stands
 * behind.
 *
 * They live here rather than in a page because two routes render them: the
 * `/faq` page in full, and the FAQ band at the foot of `/why-manufactured`.
 * One list, one set of answers, no chance of the two drifting apart.
 *
 * Answers are paragraphs of plain text — no markup — so this file stays free
 * of components, the same rule `lib/company.ts` follows. Add, cut and reorder
 * freely; an empty list hides the section and, with `pages.faq` off in
 * `lib/page-config.ts`, the route with it.
 *
 * Everything below is a claim about how these homes are built, financed and
 * titled. Check it against your own market before you ship it — wind zone,
 * snow load and titling are all state and county business.
 */

export type FaqItem = {
  question: string;
  /** One string per paragraph. */
  answer: string[];
};

export const faq: FaqItem[] = [
  {
    question: "Is a manufactured home the same as a mobile home?",
    answer: [
      "Legally, no. “Mobile home” refers to anything built before 15 June 1976, when the federal HUD Code took effect. Everything built after that date is a manufactured home, and the two are governed by completely different rules.",
      "In conversation people use the terms interchangeably, and we are not going to be precious about it. But if you are reading a loan document, an insurance policy or a zoning ordinance, that date is the line that matters.",
    ],
  },
  {
    question: "Can I get a normal mortgage?",
    answer: [
      "On land you own, with the home on a permanent foundation and titled as real property: yes. Conventional, FHA Title II, VA and USDA all lend on manufactured homes that meet those conditions. On a leased pad you are in chattel lending, which is a real loan with real underwriting — just more expensive. Which situation you are in is a decision you make, and we would rather you made it on purpose.",
    ],
  },
  {
    question: "How long do they actually last?",
    answer: [
      "The same as any other house: as long as the roof and the envelope are maintained. HUD-code homes from the early 1980s are still in service across the country. The structural failures people remember are almost entirely pre-1976 units, or post-1976 homes that were never properly anchored — which is a set-crew problem, not a construction problem.",
    ],
  },
  {
    question: "What about wind, snow and earthquakes?",
    answer: [
      "Every home is certified to a wind zone, a roof-load zone and a thermal zone printed on the data plate inside the kitchen cabinet. Ours are built to Wind Zone II and, with the mountain package, a 40 lb ground-snow roof. The anchoring system is engineered and torque-tested. In seismic events, a properly anchored home on engineered piers performs comparably to a site-built home on a stem wall.",
    ],
  },
  {
    question: "Can I put one on my own land?",
    answer: [
      "Usually. The constraints are zoning (some jurisdictions restrict manufactured housing by district), minimum square footage or roof-pitch covenants, access for a 14-foot-wide load, and utilities. We check all of it before you spend anything. Send us a parcel number and we will come back within two business days.",
    ],
  },
  {
    question: "Will my neighbours be able to tell?",
    answer: [
      "With a permanent foundation, a continuous perimeter, a site-built porch and a conventional roof pitch — generally not, from the street. The Sablewood exists specifically for buyers who want that. Whether that matters to you is a personal question, and it is a completely reasonable one.",
    ],
  },
  {
    question: "What does the price on a listing actually include?",
    answer: [
      "Transport within the radius we publish, the set, the marriage-line finish, skirting and utility connections to the stub. Site work — pad, drive, well, septic, power run — is quoted separately, because it is the one number that genuinely cannot be guessed from a distance. Nothing else appears later.",
    ],
  },
  {
    question: "How long from signing to keys?",
    answer: [
      "Eleven weeks in the plant for a home that has to be built, and about a fortnight either side of that for site work and trim-out. A home already standing on the lot can be set in a matter of weeks, which is most of why we keep them there.",
    ],
  },
];

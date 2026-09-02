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
 *
 * The answers here are written for Central Maine and for NERTO specifically:
 * HUD Wind Zone I inland, a serious ground-snow load, and Maine's own
 * title-cancellation route onto real property (see `lib/market.ts`). Where an
 * answer would have to promise something NERTO does not publish — a lead
 * time, a price inclusion, a spec on a home that is not on the lot — it says
 * to ask instead. That is the honest answer, and it is also the one that
 * gets somebody to pick up the phone.
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
    question: "What is the difference between a manufactured home and a modular home?",
    answer: [
      "Both are built indoors and finished on your site, and that is where the similarity ends. A manufactured home is built to the federal HUD Code and carries a HUD certification label. A modular home is built to the same state building code as a house framed on site — in Maine, MUBEC — and once it is set, a code officer inspects it as a house.",
      "That difference decides financing, titling, appraisal and sometimes whether a town will permit it at all. We sell both, so ask us which one your parcel and your lender actually want before you fall in love with a floor plan.",
    ],
  },
  {
    question: "Can I get a normal mortgage?",
    answer: [
      "On land you own, with the home on a permanent foundation and titled as real property: yes. Conventional, FHA Title II, VA and USDA all lend on manufactured homes that meet those conditions, and a modular home is financed as an ordinary house from the start. On a leased pad you are in chattel lending, which is a real loan with real underwriting — just more expensive. Which situation you are in is a decision you make, and we would rather you made it on purpose.",
    ],
  },
  {
    question: "How does a home in Maine become real property?",
    answer: [
      "Maine issues a manufactured home its own certificate of title, the way it does a vehicle. Once the home is permanently affixed to land the owner also owns, that title is cancelled and the home is conveyed with the real estate from then on.",
      "That step is the one that puts the home on the same appreciation curve — and the same lending shelf — as the house next door. It is worth doing in the right order, and it is one of the first things we will ask you about.",
    ],
  },
  {
    question: "How long do they actually last?",
    answer: [
      "The same as any other house: as long as the roof and the envelope are maintained. HUD-code homes from the early 1980s are still in service across the country. The structural failures people remember are almost entirely pre-1976 units, or post-1976 homes that were never properly anchored — which is a set-crew problem, not a construction problem.",
    ],
  },
  {
    question: "What about wind and snow up here?",
    answer: [
      "Every home is certified to a wind zone, a roof-load zone and a thermal zone, printed on the data plate inside a kitchen cabinet. Inland Maine is HUD Wind Zone I; only the coast reaches Zone II. Snow is the number that actually matters here, and the roof-load rating on the plate is the one to read.",
      "Maine is also the coldest HUD insulation zone, which is why an envelope specified for a southern market is the wrong home to buy in Kennebec County. Ask us for the data plate on any home before you sign anything — it is a photograph, and it takes us a minute to send.",
    ],
  },
  {
    question: "Can I put one on my own land?",
    answer: [
      "Usually. The constraints are the town's zoning and any deed restrictions, minimum square footage or roof-pitch covenants, access for a wide load down the road you are on, frost-depth footings — 48 inches through most of Central Maine — and utilities. Send us the parcel and we will look at it with you before you spend anything.",
    ],
  },
  {
    question: "Will my neighbours be able to tell?",
    answer: [
      "With a permanent foundation, a continuous perimeter, a site-built porch and a conventional roof pitch — generally not, from the street. If that matters to you, say so early: it changes which homes are worth looking at and it changes the site work. It is a completely reasonable thing to care about.",
    ],
  },
  {
    question: "What does a quoted price include?",
    answer: [
      "What is on the quote, and we will go through it line by line with you. Transport distance, the set, skirting, utility connections and any options allowance are each either in a given quote or they are not, and we would rather tell you which than let a headline number do the talking.",
      "Land, site work, permits, taxes and title fees are quoted separately, because they genuinely vary parcel by parcel — the pad, the drive, the well, the septic and the power run are the one set of numbers nobody can guess from a distance.",
    ],
  },
  {
    question: "Do you do rent to own?",
    answer: [
      "On buildings, yes — that is where NERTO started, and it is still the only rent-to-own storage company of its kind in Maine. Sheds, wood sheds, horse runs and mini-camps go out on rent to own right across New England.",
      "Homes are a different product with different paperwork. Tell us your situation and we will tell you plainly which financing path is open to you rather than which one we would rather sell.",
    ],
  },
  {
    question: "Where do you deliver?",
    answer: [
      "The yard is at 65 River Road in Chelsea, and we work through Augusta, the Kennebec valley and down to Portland. Rent-to-own buildings go further than that — throughout New England.",
      "If you are not sure whether you are inside the radius, ring us. The answer is usually yes, and where it is not, we will tell you straight away rather than at the end.",
    ],
  },
  {
    question: "How long from signing to keys?",
    answer: [
      "It depends on whether the home has to be built and on how much site work the parcel needs — and site work, not the home, is nearly always the long pole. Permits, septic and power set the calendar.",
      "Ask us for a timeline on the specific home and the specific parcel and you will get a real one. A number quoted before anybody has looked at your ground is a number somebody made up.",
    ],
  },
];

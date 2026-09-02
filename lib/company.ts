/**
 * Claims the dealership makes about itself.
 *
 * Everything in here is a statement a *specific* business makes — how long
 * it has traded, who works there, what the price includes, what it warrants.
 * None of it is true of whoever deploys this template next, which is why it
 * lives in one file instead of being written into the pages.
 *
 * The rule is the same one `lib/communities.ts` and `lib/photos.ts` follow:
 * an absent value is hidden, never guessed at. Every field below is
 * optional, and every section that consumes one disappears when it is
 * missing — delete `team` and the About page has no team section; delete
 * `founded` and nothing anywhere claims a founding year. A shorter page is
 * always the correct outcome. Inventing a plausible-sounding number is not.
 *
 * So when you take this on for a real dealership: fill in what the business
 * already publishes about itself — its own site, its Google listing, its
 * paperwork — and delete the rest. Do not carry a value over because the
 * layout looks better with it.
 *
 * The values shipped here belong to Hearthline Home Co., the fictional
 * dealership the template demonstrates itself with (see `lib/site.ts`).
 * They are placeholders. `npm run check:placeholders` fails on any that
 * survive once `NEXT_PUBLIC_SITE_URL` points at a real domain.
 */

/** Icon keys from `components/ui.tsx`, referenced by name so this file stays free of components. */
export type PrincipleIcon = "Shield" | "Wrench" | "Truck" | "Bolt" | "Leaf" | "Plan" | "Pin";

export type TeamMember = {
  name: string;
  role: string;
  /** Year they joined. Omit if you don't know it — the card drops the line. */
  since?: string;
  body: string;
};

export type Principle = {
  icon: PrincipleIcon;
  title: string;
  body: string;
};

export type Company = {
  /** Year the business started trading. Drives the About hero, the story and the "Years" stat. */
  founded?: number;
  /** Homes sold or set to date, written out for prose, e.g. "four thousand".
      Becomes the first line of the About headline. */
  homesSoldWords?: string;
  /** Headcount, for the team section heading. Omit and the heading loses the count. */
  teamSize?: number;
  /** Homes standing open on the lot for walkthroughs. */
  homesOpenOnLot?: number;

  /** The founding story. Both halves are required together or the section is dropped. */
  story?: {
    eyebrow: string;
    heading: string;
    paragraphs: string[];
  };

  /** Operating rules the business will stand behind. Shipped empty is fine. */
  principles?: Principle[];

  /** Named staff. Portraits are wired through `page/about-team-N` in `lib/photos.ts`. */
  team?: TeamMember[];
  /** One-line note under the team grid, e.g. about how nobody works on commission. */
  teamNote?: string;

  /** Dealer licence number, where the state issues one and the business
      publishes it. Shown in the trust row under the hero and nowhere else.
      Omit it rather than inventing one — an unverifiable licence number is
      the single worst field on this list to guess at. */
  licenseId?: string;
  /** Short claims for the trust row under the hero, three or four at most.
      Every one is a promise the business has to keep, so write them from what
      it already advertises and delete the rest. */
  badges?: string[];
  /** Where the business's public reviews live — a Google Business Profile, a
      Facebook page, a Better Business Bureau listing. The testimonials band
      links to it so a sceptic can check the quotes against a source we do not
      control. Omit it and the band simply does not offer the link; do not
      point it at a profile with no reviews on it. */
  reviewsUrl?: string;
  /** What to call that source in the link — "Google", "Facebook". */
  reviewsLabel?: string;

  /** Structural warranty on a new home, in months. Omit to make no warranty claim. */
  warrantyMonths?: number;
  /** Transport included in the listed price, in miles from the lot. */
  transportIncludedMiles?: number;
  /** Deposit schedule for a cash purchase, as a sentence. */
  cashDepositSchedule?: string;
};

export const company: Company = {
  founded: 1994,
  licenseId: "TN-MHD-0000000",
  badges: ["Financing available", "Delivery and set included", "Own set crew"],
  /* Placeholder, like the rest of this file — point it at the real profile or
     delete both lines. `npm run check:placeholders` lists it. */
  reviewsUrl: "https://www.google.com/maps/search/?api=1&query=Hearthline+Home+Co",
  reviewsLabel: "Google",
  homesSoldWords: "four thousand",
  teamSize: 9,
  homesOpenOnLot: 4,

  story: {
    eyebrow: "How this started",
    heading: "She quit the plant because nobody believed the reports.",
    paragraphs: [
      "Ruth spent nine years signing off on HUD-code homes as a third-party plant inspector. She watched sections leave the line with tighter envelopes, straighter walls and better documentation than anything going up on the subdivisions across the highway — and then watched the same homes arrive at dealers who sold them on payment, not on merit, skirted them badly, and let the reputation stay exactly where it was.",
      "So in 1994 she opened a lot outside Maryville with one rule: everything we know about how the home was built, the buyer gets to know too. Inspection reports on request. The data plate and the anchoring torque log. The land conversation before the floor-plan conversation, even when the land conversation kills the sale.",
      "Thirty-two years and four thousand homes later, that is still the whole business plan. We sell Clayton-built plans because they are what we can stand behind at this price, and there are twenty of them on the lot — along with a straight answer about which ones can actually be set where you are putting them.",
    ],
  },

  principles: [
    {
      icon: "Shield",
      title: "Land conversation first",
      body: "Before the floor plan, before the finance application. If the ground doesn't work, nothing else matters and we would rather cost ourselves a sale than cost you fifteen years of equity.",
    },
    {
      icon: "Wrench",
      title: "Paper on request",
      body: "In-plant inspection reports, the blower-door result, the data plate, the anchoring torque log. If a dealer can't produce those inside a day, that tells you something.",
    },
    {
      icon: "Truck",
      title: "Our own set crew",
      body: "We do not subcontract the set. The people who put your home on its piers are on our payroll, and they are the same six people who have done it for eleven years.",
    },
    {
      icon: "Bolt",
      title: "One price",
      body: "The number on the listing includes transport within 150 miles, the set, the marriage-line finish, skirting and utility connections to the stub. Site work is quoted separately because it genuinely varies. Nothing else appears later.",
    },
  ],

  team: [
    {
      name: "Ruth Okonjo-Vance",
      role: "General manager",
      since: "1994",
      body: "Spent nine years as a HUD-code plant QA inspector before she came to the lot. Still reads every inspection report that comes through the door.",
    },
    {
      name: "Sam Petrosyan",
      role: "Set crew lead",
      since: "2013",
      body: "Has set 1,900 homes. Can tell you within about four inches where a pier stack is going to want to be, from the driveway, before anyone gets out of the truck.",
    },
    {
      name: "Marta Lindqvist",
      role: "Land & titling",
      since: "2016",
      body: "Handles parcel research, permits, and the real-property conversion paperwork that most dealers hand to the buyer and wish them luck with.",
    },
    {
      name: "Dev Raghunathan",
      role: "Financing liaison",
      since: "2019",
      body: "Keeps the current lender list and makes sure nobody spends six weeks with an originator who has never closed on a HUD tag.",
    },
  ],
  teamNote:
    "There is no commission structure here, which is why nobody will follow you around the lot.",

  warrantyMonths: 12,
  transportIncludedMiles: 150,
  cashDepositSchedule:
    "If you are paying cash, the deposit schedule is 10% at order, 40% at the start of the plant run, and the balance at set. We do not ask for a dollar before the site check is done.",
};

const SMALL_NUMBERS = [
  "zero", "one", "two", "three", "four", "five", "six",
  "seven", "eight", "nine", "ten", "eleven", "twelve",
];

/**
 * Small counts read better spelled out in display type — "Nine people", not
 * "9 people". Anything past twelve stays a numeral, which is also the house
 * style for the catalogue.
 */
export function spellCount(n: number): string {
  return SMALL_NUMBERS[n] ?? String(n);
}

/** Years trading, or undefined when no founding year is on record. */
export function yearsTrading(now = new Date().getFullYear()): number | undefined {
  return company.founded ? now - company.founded : undefined;
}

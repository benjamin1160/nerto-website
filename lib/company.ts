/**
 * Claims NERTO Homes makes about itself.
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
 * What is filled in below is what NERTO publishes about itself: the dealer
 * licence number and the two promises in its hero, the founding story and
 * the three service cards from its About page, and the Google place its
 * reviews live on. Everything the business does not publish — a founding
 * year, a headcount, named staff, a warranty term, a deposit schedule, a
 * mileage a delivery is included to — is absent rather than guessed at, and
 * the sections that read those fields hide themselves. Fill one in only from
 * something NERTO has actually put in writing.
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
  /* Shown in the trust row under the hero, exactly as NERTO publishes it. */
  licenseId: "452769500",
  badges: ["Financing available", "Delivery included"],
  /* The Google place NERTO's own site links its reviews to. */
  reviewsUrl: "https://search.google.com/local/reviews?placeid=ChIJLR4eJnwCskwRZU1grVk6HLk",
  reviewsLabel: "Google",

  story: {
    eyebrow: "Our story",
    heading: "The first rent-to-own storage company in Maine.",
    paragraphs: [
      "NERTO — New England Rent To Own — started as the first rent-to-own storage solution company located in Maine, and was the first to bring rent to own to the New England market. The mission was a plain one: deliver a real heavy-duty Maine-made building, with more durability and more storage area, to our own community.",
      "It started from the back of a truck. It now serves all of New England with a product that will outlast any shed built by a manufacturing plant or a regular shed builder, because the models are built with a new-home construction mentality — which is what makes them appeal to homeowners right across the region. We specialise in customised sheds, horse runs, wood sheds and mini-camps, and we sell mobile and modular homes out of the same yard on River Road.",
      "We are committed to a complete line of building structures above industry standards that will outperform the rest; all at a fair price and built the way it should be. Call and one of our sales staff will customise the right building — or the right home — for what you actually need.",
    ],
  },

  principles: [
    {
      icon: "Shield",
      title: "Quality homes",
      body: "We offer carefully selected manufactured homes built to the highest standards.",
    },
    {
      icon: "Plan",
      title: "Expert team",
      body: "Our knowledgeable team is here to guide you through every step of the home buying process.",
    },
    {
      icon: "Pin",
      title: "Always available",
      body: "Have questions? We're just a phone call away and ready to help.",
    },
  ],

  /* Deliberately absent, because NERTO does not publish them: `founded`,
     `homesSoldWords`, `teamSize`, `homesOpenOnLot`, `team`, `teamNote`,
     `warrantyMonths`, `transportIncludedMiles` and `cashDepositSchedule`.
     Each one hides its own section. Do not fill one in from a directory
     listing or an estimate — only from something the business has put in
     writing itself. */
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

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
 * the three service cards from its About page, the Google place its
 * reviews live on, and the team's own bios (which give the founding year).
 * Everything the business does not publish — a headcount, a warranty term,
 * a deposit schedule, a mileage a delivery is included to — is absent
 * rather than guessed at, and
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
  /** One paragraph, or several. */
  body: string | string[];
  /** An outside professional NERTO works alongside — a lender, an agent —
      rather than staff. Shown under "Trusted local partners". */
  partner?: boolean;
  /** Somewhere to read more about them — a brokerage profile, a lender page. */
  link?: { href: string; label: string };
};

export type Principle = {
  icon: PrincipleIcon;
  title: string;
  body: string;
};

export type Award = {
  /** As the issuer words it, e.g. "Best of 2026 — Mobile Home Dealer". */
  title: string;
  /** Who gave it, and where — the claim is only as good as its source. */
  issuer: string;
  /** The issuer's badge, a path under `public/`. */
  image: string;
};

/**
 * The loan officer the business refers buyers to. Every line is what the
 * lender publishes on their own page — copy it from there, never retype it
 * from memory, because an NMLS number is a licence and a wrong one is a
 * compliance problem rather than a typo.
 */
export type PreferredLender = {
  name: string;
  title: string;
  /** The officer's own NMLS ID. Required by law wherever they are advertised. */
  nmls: string;
  company: string;
  /** The lender's company NMLS ID, shown in the disclosure line. */
  companyNmls: string;
  phone: string;
  mobile?: string;
  email: string;
  /** Office address, one line. */
  office?: string;
  /** States the officer is licensed in, as they list them. */
  licensedIn?: string;
  /** Headshot under `public/`, from the lender's own profile. */
  photo?: string;
  /** Their profile page on the lender's site. */
  profileUrl: string;
  /** Their personal application link, so the file lands with them. */
  applyUrl?: string;
  /** Loan programs they offer, as the business wants them listed. */
  loanPrograms?: { name: string; note?: string }[];
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
  /** Awards the business has actually been given, shown as badges in the
      hero's trust row. Only ones it can show the certificate for. */
  awards?: Award[];

  /** Shown as its own section on `/financing`. Omit and the section goes. */
  preferredLender?: PreferredLender;

  /** Structural warranty on a new home, in months. Omit to make no warranty claim. */
  warrantyMonths?: number;
  /** Transport included in the listed price, in miles from the lot. */
  transportIncludedMiles?: number;
  /** Deposit schedule for a cash purchase, as a sentence. */
  cashDepositSchedule?: string;
};

export const company: Company = {
  /* Jeremy Turner's bio: NERTO Homes was "established in 2011". */
  founded: 2011,
  /* Shown in the trust row under the hero, exactly as NERTO publishes it. */
  licenseId: "452769500",
  badges: ["Financing available", "Delivery included"],
  /* The four models standing on River Road, open to walk through. Keep this
     in step with `onLot` in `lotState` (lib/homes.ts) — they are the same
     fact, and a visitor who finds them disagreeing will believe neither. */
  homesOpenOnLot: 4,
  /* The Google place NERTO's own site links its reviews to. */
  reviewsUrl: "https://search.google.com/local/reviews?placeid=ChIJLR4eJnwCskwRZU1grVk6HLk",
  reviewsLabel: "Google",
  /* BusinessRate's award, from Google reviews, as NERTO received it. */
  awards: [
    {
      title: "Best of 2026 — Mobile Home Dealer, Kennebec County",
      issuer: "BusinessRate, from Google reviews",
      image: "/awards/businessrate-best-of-2026.png",
    },
  ],

  /* As published on his Guild Mortgage profile page. */
  preferredLender: {
    name: "Brendan Fontaine",
    title: "Loan Officer",
    nmls: "102571",
    company: "Guild Mortgage Company LLC",
    companyNmls: "3274",
    phone: "(207) 808-4070",
    mobile: "(207) 272-9949",
    email: "brendan.fontaine@guildmortgage.net",
    office: "50 Depot Road, 1st Floor, Falmouth, ME 04105",
    licensedIn: "Maine, New Hampshire and Florida",
    photo: "/photos/lender/brendan-fontaine.jpg",
    profileUrl: "https://branches.guildmortgage.com/me/falmouth/brendan-fontaine-304-rgbfo.html",
    applyUrl: "https://myaccount.guildmortgage.com/officers/brendanfontaine/apply-online/?v=2",
    /* The list NERTO asked for. Construction loans are left off on purpose —
       NERTO would rather buyers did not go that way. */
    loanPrograms: [
      { name: "FHA" },
      {
        name: "FHA BOOL",
        note: "Can take care of the down payment for buyers who already own their land.",
      },
      { name: "VA" },
      { name: "USDA" },
      { name: "MaineHousing" },
    ],
  },

  /* From the team's own bio sheet, in their words. Staff first, then the
     two outside professionals NERTO works alongside, marked `partner` so the
     About page shows them apart from the people on payroll. Each portrait is
     `page/about-team-N` in `lib/photos.ts`, in this order. */
  team: [
    {
      name: "Jeremy Turner",
      role: "Co-owner · President, NERTO Homes · Vice President, Asset Development, Inc.",
      since: "2011",
      body: [
        "Jeremy Turner is the co-owner and co-founder of NERTO Homes, established in 2011 with a simple goal: to provide Maine families with an affordable, high-quality path to homeownership. Before NERTO Homes, Jeremy spent his career in the construction industry, gaining the hands-on experience and knowledge that continue to shape the way NERTO Homes operates today.",
        "That construction background allows Jeremy and his team to offer customers more than just a manufactured or modular home — they can provide a complete turnkey home-buying experience. Serving customers throughout Maine, NERTO Homes specializes in quality manufactured and modular homes with options designed to fit a wide range of needs and budgets. From selecting the right home, to site work, foundations, utilities, installation, and finishing, the goal is to make the process as straightforward and stress-free as possible.",
        "For Jeremy, NERTO Homes is about more than selling houses. It's about helping Maine families build a place they can call home while providing honest service, quality workmanship, and real value from start to finish.",
      ],
    },
    {
      name: "Jonathan Henderson",
      role: "General Manager",
      since: "2018",
      body: [
        "Jonathan Henderson joined the team in January 2018, beginning his career with the company in sales. He was promoted to Sales Manager in 2022 and General Manager in 2023.",
        "Jonathan and his wife have been married since 2010 and have two children. Their family also serves as foster parents, providing a caring home for children in need. Outside of work, the Henderson family enjoys hiking in New Hampshire, taking walks along the local rail trail, and spending time together. Family board game nights are a favorite in the Henderson household, and they tend to get a little competitive!",
      ],
    },
    {
      name: "Jordan Cloutier",
      role: "Sales Manager",
      since: "2025",
      body: [
        "Jordan joined NERTO Homes in January 2025, bringing more than 10 years of business development experience and a strong focus on customer relationships. As Sales Manager, he helps clients navigate the homebuying process, from choosing the right home and personalizing finishes to coordinating with lenders, realtors, and NERTO's project team.",
        "Whether clients already own land or are searching for the perfect homesite, Jordan helps bring the pieces together. He works closely with the people involved in each project to keep communication clear and help clients move confidently toward closing and getting their keys.",
        "Jordan also supports NERTO's marketing, community events, and professional partnerships. His approach is friendly, straightforward, and low pressure, with a commitment to helping every client feel informed, supported, and excited about their new home.",
      ],
    },
    {
      name: "Shawna Allen",
      role: "Project Manager",
      since: "2025",
      body: "I've been with NERTO since November 2025 and have enjoyed being part of the team and contributing to the work we do. Outside of NERTO, I enjoy home projects and design, spending time with my family and pets, and traveling whenever I get the chance. I'm always up for a new project, a new place to explore, or simply enjoying time with the people and animals who mean the most to me.",
    },
    {
      name: "Travis Turner",
      role: "Superintendent",
      body: [
        "Travis has been an integral part of the NERTO Homes team for six years. As Superintendent, he leads our set and finish crews, making sure every home comes together with care and attention to detail. Travis is the person behind those finishing touches that make walking through your new home for the first time truly breathtaking.",
        "His dedication and leadership help bring our clients' dreams to life, making him an essential part of what we do at NERTO.",
        "Outside of work, Travis enjoys boating, water sports, hiking, and snowmobiling. Whether he's on the water or out on the trails, he loves making the most of Maine's outdoors.",
      ],
    },
    {
      name: "Orion Poulin",
      role: "Earthwork Superintendent",
      body: "Orion has been with NERTO Homes for a year. He is in charge of our earthwork teams: he helps with site analysis, responds to any needed call backs, and coordinates projects for the earthwork team. Outside of work Orion is an avid poker player and likes to spend time with his family.",
    },
    {
      name: "Sandra Carpenter",
      role: "Admin Assistant",
      /* Her sheet said "a month ago", which would be wrong within a month of
         publishing; "recently" says the same thing and stays true longer. */
      body: "Hi, I'm Sandra Carpenter! I recently joined New England Rent to Own and am excited to get to know the team, learn new things, and grow in my role. Outside of work, I enjoy scrapbooking and crafting — creative outlets that let me add a personal touch and preserve special memories. I also love outdoor adventures with my three boys, exploring together and making memories along the way.",
    },
    {
      name: "Brendan Fontaine",
      role: "Loan Officer · Guild Mortgage · NMLS #102571",
      partner: true,
      body: "Brendan Fontaine is a Mortgage Loan Originator with Guild Mortgage, licensed in Maine and Florida. With over two decades of experience, he specializes in FHA, VA, USDA, Conventional, and MaineHousing loans, providing trusted guidance and personalized financing solutions. Brendan has been recognized as a Top Mortgage Originator by Scotsman Guide and Mortgage Executive Magazine for his outstanding production and commitment to serving homebuyers.",
      link: { href: "/financing#lender", label: "Talk to Brendan about financing" },
    },
    {
      name: "Anna Boucher",
      role: "Realtor · Summit Real Estate",
      partner: true,
      body: [
        "Anna has been working alongside NERTO Homes for several years, helping buyers navigate the process from finding the right piece of land all the way to getting the keys to their new home. Over the years, Anna and the NERTO team have worked together to fine tune the process, making the land, home, and closing pieces work as seamlessly as possible for their clients.",
        "With more than 20 years of real estate experience, Anna loves finding solutions, putting the pieces together and helping people realize that building a new home may be more attainable than they thought. Outside of real estate, you'll usually find Anna at the barn, on a horse, traveling to a sorting competition with her son Kenny, or spending time with her family. Her philosophy in work and life is pretty simple: We'll figure it out.",
      ],
      link: {
        href: "https://www.summitofmaine.com/realestate/agent/anna-boucher/",
        label: "Anna's Summit Real Estate profile",
      },
    },
  ],

  /* NERTO's own mission statement, as the business writes it today. It
     deliberately replaces the rent-to-own storage story the company started
     from: the homes side of the business is the business now, and the shed
     history was reading as the headline. Every sentence below is NERTO's own
     words — do not embroider it. */
  story: {
    eyebrow: "Our mission",
    heading: "Built on hard work. Focused on Maine families.",
    paragraphs: [
      "At NERTO Homes, our mission is to make quality homeownership more attainable for families throughout Maine. We understand that purchasing and building a new home can feel complicated and overwhelming, especially when trying to coordinate land, financing, permits, site work and multiple contractors.",
      "That is why we provide a complete turnkey homebuilding experience. Whether you already own property or need help finding the right piece of land, our team will help guide you through the entire process. We coordinate permitting, code requirements, surveys, septic design, earthwork, driveways, foundations or slabs, wells, septic systems, electrical work, utility connections, home delivery, setup and finishing work.",
      "Our customers do not have to figure everything out on their own. We work closely with lenders, real estate professionals, town officials, manufacturers, and trusted contractors to bring every part of the project together and keep it moving forward.",
      "Our company is built on hard work, determination, quality, and a commitment to doing everything we can to help our customers succeed. When challenges arise, we work to find solutions, overcome obstacles, and help families reach the finish line.",
      "At NERTO Homes, we are not just delivering houses. We are helping Maine families navigate the entire journey and create a place they can proudly call home.",
    ],
  },

  /* Drawn from the mission above rather than written fresh, so the page says
     one thing in two lengths instead of two things. */
  principles: [
    {
      icon: "Plan",
      title: "Turnkey, start to finish",
      body: "Permitting, code requirements, surveys, septic design, earthwork, driveways, foundations, wells, utilities, delivery and setup — coordinated by us, not handed to you as a list of contractors to chase.",
    },
    {
      icon: "Pin",
      title: "With land or without",
      body: "Already own property, or still looking for the right piece? Either way our team guides you through the whole process from where you actually are.",
    },
    {
      icon: "Wrench",
      title: "We keep it moving",
      body: "We work closely with lenders, real estate professionals, town officials, manufacturers and trusted contractors to bring every part of a project together and keep it going forward.",
    },
    {
      icon: "Shield",
      title: "We get you to the finish line",
      body: "When challenges arise we work to find solutions and overcome obstacles. Hard work, determination and quality are what this company is built on.",
    },
  ],

  /* Deliberately absent, because NERTO does not publish them:
     `homesSoldWords`, `teamSize`, `teamNote`, `warrantyMonths`, `transportIncludedMiles` and `cashDepositSchedule`.
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

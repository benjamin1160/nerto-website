/**
 * Which sections the landing page renders, and which pages exist at all.
 *
 * The template used to hard-wire both: every deployment got the same eleven
 * bands down the home page and exactly the routes that happened to be in
 * `app/`. That is fine for one site and wrong for a dealership that has no
 * team to introduce, no promotion running, and no blog it will ever write.
 *
 * So the landing page is now a list of sections rendered in a fixed order,
 * each behind a switch, and the optional pages are a second list of switches.
 * A section turned off is not rendered. A page turned off redirects to `/`
 * rather than 404ing, so a stale link — a Google Business Profile, a printed
 * card, an old ad — still lands somewhere useful.
 *
 * The order below is the order the sections appear in. Changing a `true` to
 * a `false` is the supported way to shorten the page; deleting the section
 * from `components/landing.tsx` is not, because the next deployment wants it
 * back.
 *
 * Two of the sections are data-gated as well as switched: `meetTeam` needs
 * `company.team` to hold somebody, and `videoShowcase` needs `videoShowcase`
 * below to hold a URL. A switch turned on with nothing behind it stays
 * hidden — same rule as everywhere else in this template. An absent fact is
 * a shorter page, never an invented one.
 */

export type LandingSection =
  | "hero"
  | "promotion"
  | "valueProp"
  | "socialProof"
  | "howItWorks"
  | "listings"
  | "homeOnLand"
  | "meetTeam"
  | "videoShowcase"
  | "ticker"
  | "numbers"
  | "myth"
  | "cutaway"
  | "communities"
  | "contact"
  | "locationHours";

/** Landing-page bands, in render order. */
export const sections: Record<LandingSection, boolean> = {
  /* ---- The conversion path, in the order a stranger meets it ----------
     This is the short arrangement: eight bands, one scroll, and a phone
     number or a form never more than half a screen away. It is what a lot
     selling homes wants. The long editorial read is still here — see the
     block below — and is four `true`s away.                              */

  /** Opening scene: the headline, the two calls to action, the licence and
      promises row, and the quote form, all in one band. */
  hero: true,
  /** Current offer, drawn from `lib/promotions.ts`. Hidden when none is live. */
  promotion: true,
  /** One photograph the width of the screen, and one sentence over it. */
  valueProp: true,
  /** What buyers said afterwards, and a link to where they said it. */
  socialProof: true,
  /** Three steps, numbered. */
  howItWorks: true,
  /** The catalogue, entered by size. */
  listings: true,
  /** Closing band: the call on one side, the enquiry form on the other. */
  contact: true,
  /** Where the lot is, when it is open, and how to reach it. */
  locationHours: true,

  /* ---- Everything else -------------------------------------------------
     Written, styled and switched off. Each is one `true` from appearing,
     and the numbered eyebrows renumber themselves around whatever
     survives, so the sequence stays contiguous either way.               */

  /** The three routes onto ground for a buyer who has none. */
  homeOnLand: false,
  /** Named staff from `lib/company.ts`. Needs somebody in `company.team`. */
  meetTeam: false,
  /** A single video band. Needs a URL in `videoShowcase` below. */
  videoShowcase: false,
  /** Communities we place homes into. */
  communities: false,
  /** The scrolling band of build facts. */
  ticker: false,
  /** Industry-wide cost and volume figures. */
  numbers: false,
  /** The six objections, answered. */
  myth: false,
  /** The cutaway diagram of how a section is built. */
  cutaway: false,
};

export type OptionalPage =
  | "listings"
  | "communities"
  | "landDeals"
  | "startHere"
  | "financing"
  | "whyManufactured"
  | "about"
  | "contact"
  | "saved"
  | "faq"
  | "blog"
  | "promotions"
  | "prequalify"
  | "buildAHome"
  | "address";

/**
 * Standalone routes. A `false` here makes the route redirect to `/` and drops
 * it from the header, the footer and the sitemap — the page stops existing as
 * far as the site is concerned.
 *
 * `/privacy-policy` and `/terms` are deliberately absent: legal pages are not
 * optional and have no switch.
 */
export const pages: Record<OptionalPage, boolean> = {
  listings: true,
  communities: true,
  landDeals: true,
  startHere: true,
  financing: true,
  whyManufactured: true,
  about: true,
  contact: true,
  saved: true,
  faq: true,
  /** No posts ship with the template, so the blog is off until one is written. */
  blog: false,
  /** Hidden until `lib/promotions.ts` holds a live offer. */
  promotions: true,
  prequalify: true,
  buildAHome: true,
  address: true,
};

/**
 * The video band on the landing page. `url` is the only required field — set
 * it to a file under `public/` or an embeddable URL and the section appears.
 * Left null, `sections.videoShowcase` has nothing to render and stays hidden.
 */
export const videoShowcase: {
  url: string;
  mobileUrl?: string;
  headline: string;
  subheadline?: string;
  ctaText?: string;
  ctaHref?: string;
} | null = null;

/**
 * A floating call button, bottom right, on every page. It is the one piece of
 * chrome that follows a visitor around; turn it off for a quieter site.
 */
export const floatingCall = true;

/**
 * The phone strip above the header — the number, the hours and the licence,
 * in the first line of the document.
 *
 * It is the loudest thing a dealership site can do about its telephone, which
 * is why it has a switch: a business whose leads all arrive by form gets a
 * quieter header without it. Turning it off also collapses `--callbar-h`, so
 * every offset against the fixed chrome follows automatically — see
 * `components/call-bar.tsx`.
 */
export const callBar = true;

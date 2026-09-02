/**
 * The site's link structure, in one place.
 *
 * The header bar carries the primary routes; everything else lives in the
 * mobile drawer and the footer. Both lists are filtered through `pages` in
 * `lib/page-config.ts`, so turning a page off removes its links as well as
 * making the route redirect — a link to a page that bounces you home is worse
 * than no link at all.
 *
 * Add a route here rather than writing an anchor into a component, and the
 * header, the drawer and the footer all pick it up together.
 */

import { pages, type OptionalPage } from "./page-config";

/**
 * The icon beside a link in the header bar. Names index `Icon` in
 * `components/ui.tsx`; the bar draws nothing where a link names none.
 */
export type NavIcon =
  | "House"
  | "Info"
  | "Mail"
  | "Grid"
  | "Pin"
  | "Dollar"
  | "Plan"
  | "Shield";

export type NavItem = {
  href: string;
  label: string;
  /** The switch in `lib/page-config.ts` that governs this link. */
  page: OptionalPage;
  icon?: NavIcon;
};

/* Five, and short ones. The bar is a single row beside a logo and a phone
   button, and a sixth item is what makes it wrap on a 1280-wide laptop.
   Everything else lives in `SECONDARY` and reaches the drawer. */
const PRIMARY: NavItem[] = [
  { href: "/listings", label: "Homes", page: "listings", icon: "House" },
  { href: "/land-deals", label: "Land", page: "landDeals", icon: "Pin" },
  { href: "/financing", label: "Financing", page: "financing", icon: "Dollar" },
  { href: "/about", label: "About us", page: "about", icon: "Info" },
  { href: "/contact", label: "Contact us", page: "contact", icon: "Mail" },
];

/** Drawer and footer only — the bar has no room, and these are second visits. */
const SECONDARY: NavItem[] = [
  { href: "/new-home", label: "Build a home", page: "buildAHome", icon: "Plan" },
  { href: "/communities", label: "Communities", page: "communities", icon: "Grid" },
  { href: "/start-here", label: "No land? Start here", page: "startHere" },
  { href: "/why-manufactured", label: "Why manufactured", page: "whyManufactured" },
  { href: "/faq", label: "Questions", page: "faq" },
  { href: "/prequalify", label: "Get pre-approved", page: "prequalify" },
  { href: "/promotions", label: "Offers", page: "promotions" },
  { href: "/blog", label: "Notes", page: "blog" },
  { href: "/address", label: "Find us", page: "address" },
];

const enabled = (items: NavItem[]) => items.filter((item) => pages[item.page]);

export const primaryNav = enabled(PRIMARY);
export const secondaryNav = enabled(SECONDARY);
/** The mobile drawer lists both, in that order. */
export const drawerNav = [...primaryNav, ...secondaryNav];

/** Legal links, in the footer's bottom row. Neither has a switch. */
export const legalNav = [
  { href: "/privacy-policy", label: "Privacy policy" },
  { href: "/terms", label: "Terms & conditions" },
];

/**
 * Business identity for NERTO Homes.
 *
 * Every value below is published by the business itself — on
 * newenglandrenttoown.com, on its Google listing, or on its Kennebec Valley
 * Chamber profile. Nothing here is inferred. If a detail changes, change it
 * here: this file feeds the header, footer, contact page, metadata, JSON-LD,
 * sitemap and the OG image, and no page hard-codes a number or an address.
 */
export const site = {
  name: "NERTO Homes",
  short: "NERTO",
  tagline: "Mobile and modular homes in Central Maine",
  description:
    "NERTO Homes — New England Rent To Own, LLC — sells mobile and modular homes from 65 River Road in Chelsea, Maine, with financing, delivery and setup handled for you. Serving Chelsea, Augusta, Portland and Central Maine.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.newenglandrenttoown.com",
  phone: "(207) 620-2627",
  phoneHref: "tel:+12076202627",
  email: "jordan@newenglandrenttoown.com",
  address: {
    street: "65 River Road",
    city: "Chelsea",
    region: "ME",
    postalCode: "04330",
    country: "US",
  },
  /** The state spelled out, for prose and the terms. `address.region` stays
      the postal abbreviation because schema.org and the postal service want
      that one. */
  stateName: "Maine",
  hours: "Mon–Sat, 8:30am–6pm · Closed Sunday",
  /**
   * The same opening hours, day by day, for the table on `/address` and the
   * landing page's location band. It has to agree with `hours` above — the
   * two are the same fact written twice, and a visitor who finds them
   * disagreeing will believe neither.
   *
   * Delete this and both places fall back to the one-line `hours`, which is
   * a perfectly good answer for a lot that keeps the same hours all week.
   */
  hoursByDay: [
    { day: "Monday", hours: "8:30 AM – 6:00 PM" },
    { day: "Tuesday", hours: "8:30 AM – 6:00 PM" },
    { day: "Wednesday", hours: "8:30 AM – 6:00 PM" },
    { day: "Thursday", hours: "8:30 AM – 6:00 PM" },
    { day: "Friday", hours: "8:30 AM – 6:00 PM" },
    { day: "Saturday", hours: "8:30 AM – 6:00 PM" },
    { day: "Sunday", hours: "Closed" },
  ] as { day: string; hours: string }[] | undefined,
} as const;

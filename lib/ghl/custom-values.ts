/**
 * Location-level **custom values**, which are not the same thing as the
 * contact **custom fields** in `./fields.ts`.
 *
 *   custom FIELD  — a slot on a contact. Different for every lead.
 *                   `{{contact.land_status}}`
 *   custom VALUE  — one string for the whole sub-account, written once and
 *                   read by every email, SMS and workflow.
 *                   `{{custom_values.nerto_phone}}`
 *
 * Everything below is a fact this site already publishes, which means the
 * site and the CRM's templates can stop disagreeing: change the phone number
 * in `lib/site.ts`, re-run `scripts/ghl-setup.mjs values`, and the number in
 * every automated text follows.
 *
 * Dependency-free on purpose — `scripts/ghl-setup.mjs` imports this file
 * directly under Node's type stripping, so it takes the site as an argument
 * rather than importing it. See the header of `./fields.ts`.
 */

export type SiteFacts = {
  name: string;
  short: string;
  tagline: string;
  url: string;
  phone: string;
  email: string;
  hours: string;
  address: {
    street: string;
    city: string;
    region: string;
    postalCode: string;
  };
};

export type CustomValueDef = {
  /** The name GHL stores. Its `fieldKey` is derived from this, once. */
  name: string;
  value: string;
  note: string;
};

/**
 * The values to write, given the site's own identity. Anything that comes out
 * empty is skipped by the setup script rather than written blank — an absent
 * fact stays absent here exactly as it does on the site.
 */
export function customValues(site: SiteFacts): CustomValueDef[] {
  const addr = `${site.address.street}, ${site.address.city}, ${site.address.region} ${site.address.postalCode}`;
  const url = site.url.replace(/\/$/, "");
  return [
    {
      name: "NERTO Business Name",
      value: site.name,
      note: "Trading name, as the site says it.",
    },
    {
      name: "NERTO Legal Name",
      value: "New England Rent To Own, LLC",
      note: "The registered entity, for anything contractual.",
    },
    {
      name: "NERTO Tagline",
      value: site.tagline,
      note: "One line, for email headers and SMS sign-offs.",
    },
    {
      name: "NERTO Phone",
      value: site.phone,
      note: "The number as a human reads it.",
    },
    {
      name: "NERTO Email",
      value: site.email,
      note: "The inbox the site publishes.",
    },
    {
      name: "NERTO Lot Address",
      value: addr,
      note: "Where a walkthrough happens.",
    },
    {
      name: "NERTO Hours",
      value: site.hours,
      note: "Opening hours, in one line.",
    },
    {
      name: "NERTO Website",
      value: url,
      note: "Canonical site URL.",
    },
    {
      name: "NERTO Catalogue URL",
      value: `${url}/listings`,
      note: "The home catalogue — the link to send when somebody asks what you have.",
    },
    {
      name: "NERTO Prequalify URL",
      value: `${url}/prequalify`,
      note: "The pre-approval form, for nurture sequences.",
    },
    {
      name: "NERTO Directions URL",
      value: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`,
      note: "Directions to the lot, for the confirmation text before a walkthrough.",
    },
  ].filter((v) => v.value.trim().length > 0);
}

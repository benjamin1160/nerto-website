/**
 * The GoHighLevel field catalogue — every piece of data this site knows about
 * a lead, and the name it goes into the CRM under.
 *
 * This file is the ONE source of truth for the integration, and it is read
 * from two places that cannot import each other's world:
 *
 *   - `lib/ghl/client.ts`, at request time, to turn a lead into an upsert
 *     payload — it resolves each entry below to the field's GHL id.
 *   - `scripts/ghl-setup.mjs`, once per deployment, to CREATE these fields in
 *     a sub-account. Node strips the types and imports this file directly, so
 *     keep it dependency-free: no imports, no `enum`, plain data only.
 *
 * Adding a field is therefore one edit here plus one line in
 * `lib/ghl/client.ts` that says where its value comes from. Renaming one is
 * not free: GHL derives a field's `fieldKey` from its name at creation time
 * and never changes it afterwards, so a rename leaves the old field standing
 * with the old key. Rename in GHL's UI as well, or accept two fields.
 *
 * `dataType` values are GHL's own. The ones used here: TEXT, LARGE_TEXT,
 * DATE, SINGLE_OPTIONS (a dropdown). GHL also has NUMERICAL, MONETORY,
 * CHECKBOX, MULTIPLE_OPTIONS, RADIO, FILE_UPLOAD, SIGNATURE, TEXTBOX_LIST.
 */

export type GhlDataType =
  | "TEXT"
  | "LARGE_TEXT"
  | "NUMERICAL"
  | "MONETORY"
  | "PHONE"
  | "DATE"
  | "SINGLE_OPTIONS"
  | "MULTIPLE_OPTIONS"
  | "RADIO"
  | "CHECKBOX";

export type GhlFieldDef = {
  /**
   * How this site refers to the field. Not sent to GHL — it is the key the
   * client keys its payload by, and what the setup script prints.
   */
  id: string;
  /** The label the field wears in GHL. This is what a rename would break. */
  name: string;
  /**
   * The `fieldKey` GHL derives from `name` — lowercased, spaces to
   * underscores, punctuation dropped. Recorded so the client can resolve a
   * field by key as well as by name, and so the setup script can tell an
   * existing field from a new one after somebody has renamed it in the UI.
   */
  fieldKey: string;
  dataType: GhlDataType;
  placeholder?: string;
  /**
   * For the dropdowns: the label GHL stores, keyed by the value this site's
   * own `<select>` submits. The site posts slugs (`under-50k`); a CRM is read
   * by people, so the label goes in ("Under $50,000"). A value not listed
   * here is passed through verbatim rather than dropped — a form gaining an
   * option must not lose the lead that chose it.
   */
  options?: { value: string; label: string }[];
  /** What fills it, for the humans reading this file and the setup script. */
  note: string;
};

/** GHL prefixes every contact field key with `contact.`. */
export const FIELD_KEY_PREFIX = "contact.";

export const CONTACT_FIELDS: GhlFieldDef[] = [
  /* ---- Which form, and what it asked ------------------------------------ */
  {
    id: "leadForm",
    name: "Website Lead Form",
    fieldKey: "website_lead_form",
    dataType: "SINGLE_OPTIONS",
    note: "Which form on the site captured the lead. Every form names itself.",
    options: [
      { value: "landing-quote", label: "Hero quote card" },
      { value: "landing-contact", label: "Closing enquiry band" },
      { value: "prequalify-page", label: "Pre-approval page" },
      { value: "land-deals-map", label: "Land map pre-approval" },
      { value: "walkthrough-request", label: "Walkthrough request" },
      { value: "chat-widget", label: "Chat widget" },
    ],
  },
  {
    id: "landStatus",
    name: "Land Status",
    fieldKey: "land_status",
    dataType: "SINGLE_OPTIONS",
    note: "Whether they have ground yet — the first question every home-on-land conversation turns on.",
    options: [
      { value: "own", label: "Owns the land" },
      { value: "under-contract", label: "Under contract on a parcel" },
      { value: "found", label: "Found a parcel they like" },
      { value: "looking", label: "Still looking" },
      { value: "no-idea", label: "No idea where to start" },
    ],
  },
  {
    id: "budgetRange",
    name: "Budget Range",
    fieldKey: "budget_range",
    dataType: "SINGLE_OPTIONS",
    note: "All-in price band, from the hero card and the closing band.",
    options: [
      { value: "under-50k", label: "Under $50,000" },
      { value: "50-100k", label: "$50,000 – $100,000" },
      { value: "100-150k", label: "$100,000 – $150,000" },
      { value: "150-200k", label: "$150,000 – $200,000" },
      { value: "200k-plus", label: "$200,000+" },
    ],
  },
  {
    id: "monthlyPayment",
    name: "Comfortable Monthly Payment",
    fieldKey: "comfortable_monthly_payment",
    dataType: "TEXT",
    placeholder: "$1,500",
    note: "Free text, from the pre-approval form. Kept apart from Budget Range because they are different questions: a band is a price, this is a payment.",
  },
  {
    id: "buyerType",
    name: "Buyer Type",
    fieldKey: "buyer_type",
    dataType: "SINGLE_OPTIONS",
    note: "How they described themselves on the hero card.",
    options: [
      { value: "self", label: "Buying for themselves" },
      { value: "land-owner", label: "Land owner" },
      { value: "investor", label: "Investor" },
      { value: "exploring", label: "Just exploring" },
    ],
  },

  /* ---- Where they want to live ------------------------------------------ */
  {
    id: "county",
    name: "County",
    fieldKey: "county",
    dataType: "TEXT",
    placeholder: "Kennebec",
    note: "Chosen from the priced delivery radius in `lib/land/areas.ts`. Stored as the county's name, not its slug.",
  },
  {
    id: "desiredLocation",
    name: "Desired Location",
    fieldKey: "desired_location",
    dataType: "TEXT",
    placeholder: "City, state or county",
    note: "Free text — asked before anybody knows whether we deliver there.",
  },

  /* ---- Which home ------------------------------------------------------- */
  {
    id: "homeOfInterest",
    name: "Home of Interest",
    fieldKey: "home_of_interest",
    dataType: "TEXT",
    note: "The plan they were looking at, by name and model code.",
  },
  {
    id: "homeUrl",
    name: "Home Page URL",
    fieldKey: "home_page_url",
    dataType: "TEXT",
    note: "A link straight back to that listing, so whoever calls can see what they saw.",
  },
  {
    id: "savedHomes",
    name: "Saved Homes",
    fieldKey: "saved_homes",
    dataType: "LARGE_TEXT",
    note: "Their shortlist — the hearts they tapped, which the site keeps in the browser. Often longer and more honest than the one home they filled a form about.",
  },

  /* ---- The walkthrough -------------------------------------------------- */
  {
    id: "walkthroughDate",
    name: "Walkthrough Date",
    fieldKey: "walkthrough_date",
    dataType: "DATE",
    note: "The day they asked for on a listing page or the contact page.",
  },
  {
    id: "walkthroughTime",
    name: "Walkthrough Time",
    fieldKey: "walkthrough_time",
    dataType: "SINGLE_OPTIONS",
    note: "The window they asked for.",
    options: [
      { value: "Morning (9–12)", label: "Morning (9–12)" },
      { value: "Midday (12–3)", label: "Midday (12–3)" },
      { value: "Afternoon (3–6)", label: "Afternoon (3–6)" },
      { value: "Weekend only", label: "Weekend only" },
    ],
  },
  {
    id: "callFirst",
    name: "Call Before Visiting",
    fieldKey: "call_before_visiting",
    dataType: "SINGLE_OPTIONS",
    note: "They asked to be phoned before driving out.",
    options: [
      { value: "yes", label: "Yes — call first" },
      { value: "no", label: "No — happy to just arrive" },
    ],
  },

  /* ---- What they actually said ------------------------------------------ */
  {
    id: "notes",
    name: "Website Notes",
    fieldKey: "website_notes",
    dataType: "LARGE_TEXT",
    note: "Whatever they typed into the free-text box. Also written to the contact as a Note, because a note is what a salesperson reads.",
  },
  {
    id: "chatTranscript",
    name: "Chat Transcript",
    fieldKey: "chat_transcript",
    dataType: "LARGE_TEXT",
    note: "The whole chat-widget conversation, turn by turn.",
  },

  /* ---- Attribution ------------------------------------------------------
     GHL fills its own attribution fields from ITS forms and funnels. These
     come off this site's own pages, which it has no way to see, so they are
     captured here and posted with the lead. First touch is remembered for
     the session, so a lead that arrives from an ad and converts three pages
     later still carries the ad.                                            */
  {
    id: "landingPage",
    name: "Landing Page",
    fieldKey: "landing_page",
    dataType: "TEXT",
    note: "The first page of the visit.",
  },
  {
    id: "conversionPage",
    name: "Conversion Page",
    fieldKey: "conversion_page",
    dataType: "TEXT",
    note: "The page the form or chat was actually submitted from.",
  },
  {
    id: "referrer",
    name: "Referrer",
    fieldKey: "referrer",
    dataType: "TEXT",
    note: "Where they came from, when the browser says.",
  },
  {
    id: "utmSource",
    name: "UTM Source",
    fieldKey: "utm_source",
    dataType: "TEXT",
    note: "First-touch `utm_source`.",
  },
  {
    id: "utmMedium",
    name: "UTM Medium",
    fieldKey: "utm_medium",
    dataType: "TEXT",
    note: "First-touch `utm_medium`.",
  },
  {
    id: "utmCampaign",
    name: "UTM Campaign",
    fieldKey: "utm_campaign",
    dataType: "TEXT",
    note: "First-touch `utm_campaign`.",
  },
  {
    id: "utmTerm",
    name: "UTM Term",
    fieldKey: "utm_term",
    dataType: "TEXT",
    note: "First-touch `utm_term`.",
  },
  {
    id: "utmContent",
    name: "UTM Content",
    fieldKey: "utm_content",
    dataType: "TEXT",
    note: "First-touch `utm_content`.",
  },
  {
    id: "gclid",
    name: "Google Click ID",
    fieldKey: "google_click_id",
    dataType: "TEXT",
    note: "`gclid`, for Google Ads offline conversion import.",
  },
  {
    id: "fbclid",
    name: "Facebook Click ID",
    fieldKey: "facebook_click_id",
    dataType: "TEXT",
    note: "`fbclid`, for Meta's conversions API.",
  },
];

/** The site's field id → the definition, for the client's lookups. */
export const FIELD_BY_ID: Record<string, GhlFieldDef> = Object.fromEntries(
  CONTACT_FIELDS.map((f) => [f.id, f]),
);

/**
 * The CRM label for a value this site's forms submit. Unknown values pass
 * through: an option added to a form must not vanish on its way to the CRM.
 */
export function optionLabel(fieldId: string, value: string): string {
  const found = FIELD_BY_ID[fieldId]?.options?.find((o) => o.value === value);
  return found ? found.label : value;
}

/** Is this one of the price bands, as against a free-text monthly payment? */
export function isBudgetRange(value: string): boolean {
  return !!FIELD_BY_ID.budgetRange.options?.some((o) => o.value === value);
}

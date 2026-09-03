/**
 * The shape of a lead as this site knows it, and the attribution that travels
 * with it.
 *
 * Deliberately free of both worlds: the forms and the chat widget are client
 * components and must not import `./client.ts` (which reads the API token),
 * while the setup script must not import React. Everything shared lives here.
 */

/** Every place on the site a lead can come from. */
export const LEAD_FORMS = [
  "landing-quote",
  "landing-contact",
  "prequalify-page",
  "land-deals-map",
  "walkthrough-request",
  "chat-widget",
] as const;

export type LeadForm = (typeof LEAD_FORMS)[number];

/** What each form is called in the CRM's tags and in the note's first line. */
export const LEAD_FORM_LABEL: Record<LeadForm, string> = {
  "landing-quote": "Hero quote card",
  "landing-contact": "Closing enquiry band",
  "prequalify-page": "Pre-approval page",
  "land-deals-map": "Land map pre-approval",
  "walkthrough-request": "Walkthrough request",
  "chat-widget": "Chat widget",
};

/**
 * First-touch attribution, captured in the browser and posted with the lead.
 * Every field optional: a visitor who typed the domain in has none of it, and
 * an absent fact is left absent rather than guessed at.
 */
export type Attribution = {
  landingPage?: string;
  conversionPage?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  gclid?: string;
  fbclid?: string;
};

/** The union of everything any form on the site asks. */
export type SiteLead = {
  form: LeadForm;
  name: string;
  phone?: string;
  email?: string;
  /** The county's name, not its slug — resolved before it gets here. */
  county?: string;
  /** Free text: where they want to live. */
  location?: string;
  /**
   * One select, two vocabularies. The pre-approval forms ask about land
   * (`own`, `looking`…); the hero card asks who they are (`investor`…).
   * `mapLead` sends each to the field whose options list it belongs to.
   */
  landStatus?: string;
  /** A price band slug from a `<select>`, or a typed monthly payment. */
  budget?: string;
  homeName?: string;
  homeUrl?: string;
  /** Slugs of the homes they hearted, from the browser's shortlist. */
  savedHomes?: string[];
  walkthroughDate?: string;
  walkthroughSlot?: string;
  callFirst?: boolean;
  notes?: string;
  /** The chat conversation, already rendered turn by turn. */
  chatTranscript?: string;
  attribution?: Attribution;
};

export type LeadResult = {
  ok: boolean;
  /** GHL's contact id, when the contact reached GHL. */
  contactId?: string;
  /** Which sinks took it — for the server log, never for the visitor. */
  delivered: string[];
};

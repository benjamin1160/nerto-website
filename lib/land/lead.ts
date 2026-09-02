/**
 * Shape of the pre-approval form's action state.
 *
 * This lives outside `app/land-deals/actions.ts` on purpose: a `"use server"` module may
 * only export async functions, so the initial-state constant cannot live there.
 */

/**
 * Where a lead was captured. Every form that posts to `requestPreApproval`
 * names itself with one of these so the CRM can tell them apart; anything
 * else is rejected back to the default rather than trusted.
 */
export const LEAD_SOURCES = [
  "land-deals-map",
  "landing-quote",
  "landing-contact",
  "prequalify-page",
] as const;

export type LeadSource = (typeof LEAD_SOURCES)[number];

export const LEAD_FIELDS = [
  "name",
  "phone",
  "email",
  "county",
  /* Free text, and deliberately not `county`: the landing page's contact band
     asks where somebody wants to live before they know whether we serve it,
     and a select would make them answer a question about our delivery radius
     instead of about themselves. */
  "location",
  "landStatus",
  "budget",
  "notes",
] as const;

export type LeadField = (typeof LEAD_FIELDS)[number];

export type LeadState = {
  status: "idle" | "ok" | "error";
  message: string;
  fieldErrors?: Partial<Record<LeadField, string>>;
  /** Echoed back so a rejected submission does not wipe what was typed. */
  values?: Partial<Record<LeadField, string>>;
};

export const EMPTY_LEAD_STATE: LeadState = { status: "idle", message: "" };

"use server";

import { redirect } from "next/navigation";
import { AREAS } from "@/lib/land/areas";
import { LEAD_SOURCES, type LeadField, type LeadSource, type LeadState } from "@/lib/land/lead";
import { parseAttribution } from "@/lib/attribution";
import { submitLead } from "@/lib/ghl/submit";
import type { LeadForm } from "@/lib/ghl/lead";

const digits = (s: string) => s.replace(/\D/g, "");
const clean = (v: FormDataEntryValue | null, max = 200) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

/**
 * Takes a pre-approval request from the landing page.
 *
 * Server Functions are reachable by direct POST, so everything here is
 * validated and length-capped rather than trusted. Delivery is
 * `lib/ghl/submit.ts`: GoHighLevel when a token is configured, the
 * `LEAD_WEBHOOK_URL` webhook when one is set, and the server log when
 * neither, so nothing is lost while the integration is being wired up.
 */
export async function requestPreApproval(
  _prev: LeadState,
  formData: FormData
): Promise<LeadState> {
  // Honeypot: real people leave this hidden field empty.
  if (clean(formData.get("company"))) {
    return { status: "ok", message: "Thanks — we'll be in touch shortly." };
  }

  const lead = {
    name: clean(formData.get("name"), 80),
    phone: clean(formData.get("phone"), 32),
    email: clean(formData.get("email"), 120),
    county: clean(formData.get("county"), 40),
    location: clean(formData.get("location"), 80),
    landStatus: clean(formData.get("landStatus"), 40),
    budget: clean(formData.get("budget"), 20),
    notes: clean(formData.get("notes"), 1000),
  };

  const fieldErrors: Partial<Record<LeadField, string>> = {};
  if (lead.name.length < 2) fieldErrors.name = "Tell us your name.";
  if (digits(lead.phone).length < 10)
    fieldErrors.phone = "A 10-digit phone number, please.";
  if (lead.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email))
    fieldErrors.email = "That email doesn't look right.";
  if (lead.county && !AREAS.some((a) => a.slug === lead.county))
    fieldErrors.county = "Pick a county from the list.";

  /* Which form the lead came off, so the CRM can tell the map's pre-approval
     request from the landing page's quote band. Allowlisted rather than
     echoed: this arrives from the client like everything else here. */
  const submitted = clean(formData.get("source"), 40);
  const source = LEAD_SOURCES.includes(submitted as LeadSource)
    ? submitted
    : "land-deals-map";

  /* The two landing-page forms feed the new-lead text NERTO's GHL workflow
     sends, which reads email, budget and location — so those forms require
     them, and the hero card its "What best describes you?" as well. Checked
     here as well as in the browser, which is only a courtesy. */
  if (source === "landing-quote" || source === "landing-contact") {
    if (!lead.email) fieldErrors.email = "An email, please.";
    if (!lead.budget) fieldErrors.budget = "Pick a budget range.";
    if (lead.location.length < 2) fieldErrors.location = "Where are you looking?";
  }
  if (source === "landing-quote" && !lead.landStatus)
    fieldErrors.landStatus = "Pick the one that fits best.";

  if (Object.keys(fieldErrors).length > 0) {
    // React resets an uncontrolled form after every action, so hand the
    // values back for the inputs to re-seed themselves from.
    return {
      status: "error",
      message: "Almost — fix the highlighted fields.",
      fieldErrors,
      values: lead,
    };
  }

  const result = await submitLead({
    /* The two vocabularies agree: every `LeadSource` is also a `LeadForm`. */
    form: source as LeadForm,
    ...lead,
    /* The county's name rather than its slug — nobody reading a CRM record
       wants `kennebec`. */
    county: AREAS.find((a) => a.slug === lead.county)?.county ?? lead.county,
    savedHomes: clean(formData.get("savedHomes"), 600)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    attribution: parseAttribution(formData.get("attribution")),
  });

  if (!result.ok) {
    return {
      status: "error",
      message:
        "Something broke on our end. Call or text us and we'll take it from there.",
      values: lead,
    };
  }

  /* Outside any try: `redirect` throws by design. The thank-you page is the
     conversion URL Google Ads and GA count. */
  redirect(`/thank-you?form=${source}`);
}

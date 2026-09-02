"use server";

import { AREAS } from "@/lib/land/areas";
import { LEAD_SOURCES, type LeadField, type LeadSource, type LeadState } from "@/lib/land/lead";

const digits = (s: string) => s.replace(/\D/g, "");
const clean = (v: FormDataEntryValue | null, max = 200) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

/**
 * Takes a pre-approval request from the landing page.
 *
 * Server Functions are reachable by direct POST, so everything here is
 * validated and length-capped rather than trusted. Set `LEAD_WEBHOOK_URL` to
 * forward leads to your CRM; without it the lead is logged so nothing is lost
 * while the integration is being wired up.
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

  /* Which form the lead came off, so the CRM can tell the map's pre-approval
     request from the landing page's quote band. Allowlisted rather than
     echoed: this arrives from the client like everything else here. */
  const submitted = clean(formData.get("source"), 40);
  const source = LEAD_SOURCES.includes(submitted as LeadSource)
    ? submitted
    : "land-deals-map";

  const payload = {
    ...lead,
    county:
      AREAS.find((a) => a.slug === lead.county)?.county ?? lead.county ?? "",
    source,
    submittedAt: new Date().toISOString(),
  };

  const webhook = process.env.LEAD_WEBHOOK_URL;
  if (webhook) {
    try {
      const res = await fetch(webhook, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`webhook responded ${res.status}`);
    } catch (err) {
      console.error("[lead] failed to forward to webhook", err);
      return {
        status: "error",
        message:
          "Something broke on our end. Call or text us and we'll take it from there.",
        values: lead,
      };
    }
  } else {
    console.info("[lead] LEAD_WEBHOOK_URL unset, logging instead:", payload);
  }

  return {
    status: "ok",
    message: `Got it, ${payload.name.split(" ")[0]}. We'll call you with a pre-approval range — usually same day.`,
  };
}

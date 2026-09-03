"use server";

import { listings } from "@/lib/homes";
import { site } from "@/lib/site";
import { parseAttribution } from "@/lib/attribution";
import { submitLead } from "@/lib/ghl/submit";
import { TIME_SLOTS, type WalkthroughField, type WalkthroughState } from "@/lib/walkthrough";

const digits = (s: string) => s.replace(/\D/g, "");
const clean = (v: FormDataEntryValue | null, max = 200) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

/**
 * Takes a walkthrough request — `components/inquiry-form.tsx`, on the contact
 * page and at the foot of every listing.
 *
 * It used to resolve locally and go nowhere, which was fine for a template
 * and a quiet way to lose a lead on a live site. It now goes where every
 * other form goes: `lib/ghl/submit.ts`.
 *
 * Validation mirrors what the form checked in the browser, because a Server
 * Function is reachable by direct POST and the browser's checks are a
 * courtesy rather than a guard.
 */
export async function requestWalkthrough(
  _prev: WalkthroughState,
  formData: FormData,
): Promise<WalkthroughState> {
  // Honeypot: real people leave this hidden field empty.
  if (clean(formData.get("company"))) {
    return { status: "ok", message: "Thanks — we'll be in touch shortly." };
  }

  const values = {
    name: clean(formData.get("name"), 80),
    email: clean(formData.get("email"), 120),
    phone: clean(formData.get("phone"), 32),
    home: clean(formData.get("home"), 80),
    date: clean(formData.get("date"), 20),
    slot: clean(formData.get("slot"), 40),
    message: clean(formData.get("message"), 1000),
  };
  const callFirst = !!clean(formData.get("callFirst"));

  const fieldErrors: Partial<Record<WalkthroughField, string>> = {};
  if (values.name.length < 2) fieldErrors.name = "Tell us what to call you.";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(values.email))
    fieldErrors.email = "That email doesn't look right.";
  if (values.phone && digits(values.phone).length < 10)
    fieldErrors.phone = "Ten digits, or leave it blank.";
  if (values.date && new Date(values.date) < new Date(new Date().toDateString()))
    fieldErrors.date = "Pick a date that hasn't happened yet.";

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: "Almost — fix the highlighted fields.",
      fieldErrors,
      values,
      callFirst,
    };
  }

  /* The select posts a slug. What the CRM wants is the home's name, its model
     code and a link straight back to the page they were reading. */
  const listing = listings.find((l) => l.slug === values.home);
  const homeName = listing
    ? [listing.name, listing.model].filter(Boolean).join(" · ")
    : undefined;

  const result = await submitLead({
    form: "walkthrough-request",
    name: values.name,
    email: values.email,
    phone: values.phone || undefined,
    homeName,
    homeUrl: listing ? `${site.url.replace(/\/$/, "")}/listings/${listing.slug}` : undefined,
    savedHomes: clean(formData.get("savedHomes"), 600)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    walkthroughDate: values.date || undefined,
    /* Allowlisted rather than echoed — it arrives from the client. */
    walkthroughSlot: (TIME_SLOTS as readonly string[]).includes(values.slot)
      ? values.slot
      : undefined,
    callFirst,
    notes: values.message || undefined,
    attribution: parseAttribution(formData.get("attribution")),
  });

  if (!result.ok) {
    return {
      status: "error",
      message: `Something broke on our end. Call us on ${site.phone} and we'll book it by hand.`,
      values,
      callFirst,
    };
  }

  return {
    status: "ok",
    message: "That's booked on our side.",
  };
}

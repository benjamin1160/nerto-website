/**
 * Turning a `SiteLead` into a GHL contact.
 *
 * Kept apart from `./client.ts` so the mapping — which is the interesting,
 * opinionated part — can be read without the HTTP around it.
 */
import { FIELD_BY_ID, isBudgetRange, optionLabel } from "./fields";
import { LEAD_FORM_LABEL, type SiteLead } from "./lead";
import type { GhlContact, FieldValues } from "./client";

/** Values GHL shows in a dropdown are labels, so slugs are translated. */
const label = (fieldId: string, value?: string) =>
  value ? optionLabel(fieldId, value) : undefined;

/**
 * The hero card and the pre-approval forms share one `<select>` name and mean
 * different things by it — see `SiteLead.landStatus`. Each value goes to the
 * field that actually lists it, so "investor" lands in Buyer Type and
 * "under-contract" in Land Status rather than both muddling one column.
 */
function routeChoice(value?: string): { landStatus?: string; buyerType?: string } {
  if (!value) return {};
  const isLand = FIELD_BY_ID.landStatus.options?.some((o) => o.value === value);
  if (isLand) return { landStatus: optionLabel("landStatus", value) };
  const isBuyer = FIELD_BY_ID.buyerType.options?.some((o) => o.value === value);
  if (isBuyer) return { buyerType: optionLabel("buyerType", value) };
  /* Unknown to both — a form gained an option this file has not met yet.
     Land Status is where it was asked, so that is where it goes. */
  return { landStatus: value };
}

/**
 * A budget is either a band picked from a list or a monthly figure typed in.
 * They are different questions and get different columns; which one this is
 * is decided by whether the value is one of the bands.
 */
function routeBudget(value?: string): { budgetRange?: string; monthlyPayment?: string } {
  if (!value) return {};
  return isBudgetRange(value)
    ? { budgetRange: optionLabel("budgetRange", value) }
    : { monthlyPayment: value };
}

export function fieldValues(lead: SiteLead): FieldValues {
  const a = lead.attribution ?? {};
  return {
    leadForm: label("leadForm", lead.form),
    ...routeChoice(lead.landStatus),
    ...routeBudget(lead.budget),
    county: lead.county,
    desiredLocation: lead.location,
    homeOfInterest: lead.homeName,
    homeUrl: lead.homeUrl,
    savedHomes: lead.savedHomes?.length ? lead.savedHomes.join(", ") : undefined,
    walkthroughDate: lead.walkthroughDate,
    walkthroughTime: label("walkthroughTime", lead.walkthroughSlot),
    callFirst:
      lead.callFirst === undefined
        ? undefined
        : optionLabel("callFirst", lead.callFirst ? "yes" : "no"),
    notes: lead.notes,
    chatTranscript: lead.chatTranscript,
    landingPage: a.landingPage,
    conversionPage: a.conversionPage,
    referrer: a.referrer,
    utmSource: a.utmSource,
    utmMedium: a.utmMedium,
    utmCampaign: a.utmCampaign,
    utmTerm: a.utmTerm,
    utmContent: a.utmContent,
    gclid: a.gclid,
    fbclid: a.fbclid,
  };
}

/**
 * The note. A salesperson opening a contact reads this, not a column of
 * custom fields, so it is written as prose in the order a phone call would
 * want it: what they asked for, then how to talk to them, then where they
 * came from.
 */
function noteBody(lead: SiteLead, values: FieldValues): string {
  const lines: string[] = [`Website lead — ${LEAD_FORM_LABEL[lead.form]}`, ""];
  const row = (k: string, v?: string) => {
    if (v) lines.push(`${k}: ${v}`);
  };

  row("Name", lead.name);
  row("Phone", lead.phone);
  row("Email", lead.email);
  row("Land", values.landStatus);
  row("Buyer type", values.buyerType);
  row("Budget", values.budgetRange);
  row("Monthly payment", values.monthlyPayment);
  row("County", lead.county);
  row("Location wanted", lead.location);
  row("Home of interest", lead.homeName);
  row("Listing", lead.homeUrl);
  row("Shortlist", values.savedHomes);
  row("Walkthrough", [values.walkthroughDate, values.walkthroughTime].filter(Boolean).join(" · "));
  row("Call first", values.callFirst);

  if (lead.notes) lines.push("", "What they said:", lead.notes);
  if (lead.chatTranscript) lines.push("", "Chat:", lead.chatTranscript);

  const attribution = [
    values.utmSource && `source ${values.utmSource}`,
    values.utmMedium && `medium ${values.utmMedium}`,
    values.utmCampaign && `campaign ${values.utmCampaign}`,
    values.referrer && `referrer ${values.referrer}`,
    values.landingPage && `landed on ${values.landingPage}`,
  ].filter(Boolean);
  if (attribution.length) lines.push("", `Attribution: ${attribution.join(", ")}`);

  return lines.join("\n");
}

/** Tags: one that says it came off the website, one that says which form. */
function tags(lead: SiteLead): string[] {
  return ["website", `website-${lead.form}`];
}

export function mapLead(lead: SiteLead): GhlContact {
  const values = fieldValues(lead);
  return {
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    source: `Website — ${LEAD_FORM_LABEL[lead.form]}`,
    tags: tags(lead),
    fields: values,
    note: noteBody(lead, values),
    opportunityName: lead.homeName
      ? `${lead.name} — ${lead.homeName}`
      : `${lead.name} — ${LEAD_FORM_LABEL[lead.form]}`,
  };
}

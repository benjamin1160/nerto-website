/**
 * The one place a lead leaves this site.
 *
 * Three sinks, tried in order, and a lead only fails if every sink that is
 * configured fails:
 *
 *   1. GoHighLevel, when `GHL_API_TOKEN` and `GHL_LOCATION_ID` are set. The
 *      contact is upserted with its custom fields, tagged, noted, and — if a
 *      pipeline is configured — given an opportunity.
 *   2. `LEAD_WEBHOOK_URL`, unchanged from before this integration existed.
 *      Keep it pointed at an inbound GHL webhook and you have a second copy;
 *      keep it pointed anywhere else and you have a backup.
 *   3. The server log, when neither is set — so a site deployed before the
 *      CRM is wired up still loses nothing.
 *
 * Deliberately never throws. The caller wants a boolean, and a visitor who
 * has just typed their phone number should be told something true either way.
 *
 * Server only — Server Actions and the chat route handler. Nothing here is
 * exported to the browser, and the token it depends on is not a
 * `NEXT_PUBLIC_` variable, so it does not exist in a client bundle even by
 * accident.
 */
import { mapLead } from "./map";
import { upsertContact, ghlConfigured } from "./client";
import type { LeadResult, SiteLead } from "./lead";

export async function submitLead(lead: SiteLead): Promise<LeadResult> {
  const delivered: string[] = [];
  const failures: string[] = [];

  if (ghlConfigured()) {
    try {
      const contactId = await upsertContact(mapLead(lead));
      delivered.push("ghl");
      if (contactId) {
        return await alsoWebhook(lead, { ok: true, contactId, delivered }, failures);
      }
    } catch (err) {
      failures.push("ghl");
      console.error("[lead] GHL upsert failed", err);
    }
  }

  return await alsoWebhook(lead, { ok: delivered.length > 0, delivered }, failures);
}

/**
 * The webhook runs whether or not GHL did. Two sinks is the point: a webhook
 * into a spreadsheet or an inbox is how a dealership notices that the CRM
 * stopped accepting leads, and it costs one request.
 */
async function alsoWebhook(
  lead: SiteLead,
  result: LeadResult,
  failures: string[],
): Promise<LeadResult> {
  const webhook = process.env.LEAD_WEBHOOK_URL;

  if (webhook) {
    try {
      const res = await fetch(webhook, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...lead, submittedAt: new Date().toISOString() }),
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) throw new Error(`webhook responded ${res.status}`);
      result.delivered.push("webhook");
      result.ok = true;
    } catch (err) {
      failures.push("webhook");
      console.error("[lead] failed to forward to webhook", err);
    }
  }

  if (!webhook && !ghlConfigured()) {
    console.info(
      "[lead] neither GHL_API_TOKEN nor LEAD_WEBHOOK_URL is set, logging instead:",
      { ...lead, submittedAt: new Date().toISOString() },
    );
    result.delivered.push("log");
    result.ok = true;
  }

  if (!result.ok) {
    console.error(`[lead] every sink failed (${failures.join(", ")}) — lead lost:`, lead);
  }
  return result;
}

/**
 * The GoHighLevel side of the site — one contact upsert, one note, one
 * optional opportunity, and nothing else.
 *
 * Server only. It reads a token out of the environment and must never be
 * imported into a client component; `lib/ghl/lead.ts` holds the types the
 * forms and the chat widget share, precisely so they never have to reach in
 * here for one.
 *
 * Configuration, all of it optional:
 *
 *   GHL_API_TOKEN       Private Integration Token (starts `pit-`) or a
 *                       sub-account OAuth access token.
 *   GHL_LOCATION_ID     The sub-account. Required alongside the token.
 *   GHL_API_VERSION     Defaults to `2021-07-28`. Set `v3` if the token is
 *                       issued against v3 — see the note on the payload
 *                       shape below.
 *   GHL_PIPELINE_ID     Set both of these and every lead also opens an
 *   GHL_PIPELINE_STAGE_ID   opportunity in that stage.
 *   GHL_DEFAULT_TAGS    Comma-separated, added to every contact on top of
 *                       the per-form tag.
 *   GHL_LEAD_TAG        The tag that marks a website lead, cycled on every
 *                       submission — see `cycleLeadTag` below. Defaults to
 *                       `MHG_WEBSITE_LEAD`; set it empty to switch the
 *                       behaviour off.
 *   GHL_API_BASE        Where to send all of it. Only ever set this to point
 *                       a staging deployment at a stub — it exists so the
 *                       integration can be exercised without a live account.
 *
 * With no token set nothing here fires and `submitLead` falls through to
 * `LEAD_WEBHOOK_URL` and then to the server log — the same behaviour the
 * template shipped with, so the site works before the CRM is wired up and
 * loses nothing while it is being wired.
 */
import { CONTACT_FIELDS, FIELD_KEY_PREFIX, type GhlFieldDef } from "./fields";

const BASE = process.env.GHL_API_BASE ?? "https://services.leadconnectorhq.com";

/**
 * GHL renamed the custom-field value key between API versions: `field_value`
 * under `2021-07-28`, `fieldValue` under `v3`. Sending the wrong one is the
 * quiet failure mode of this whole integration — the contact is created, the
 * custom fields silently are not — so the version and the key it implies are
 * decided in one place.
 */
const VERSION = process.env.GHL_API_VERSION?.trim() || "2021-07-28";
const VALUE_KEY = VERSION === "v3" ? "fieldValue" : "field_value";

export function ghlConfigured(): boolean {
  return !!(process.env.GHL_API_TOKEN && process.env.GHL_LOCATION_ID);
}

function headers(): HeadersInit {
  return {
    Authorization: `Bearer ${process.env.GHL_API_TOKEN}`,
    Version: VERSION,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

type Json = Record<string, unknown>;

async function call(path: string, init: RequestInit & { method: string }): Promise<Json> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { ...headers(), ...(init.headers ?? {}) },
    /* Leads are not worth a hung request. Long enough for a cold lambda at
       GHL's end, short enough that the visitor still gets an answer. */
    signal: AbortSignal.timeout(10_000),
    cache: "no-store",
  });
  const text = await res.text();
  const body = text ? (JSON.parse(text) as Json) : {};
  if (!res.ok) {
    throw new Error(
      `GHL ${init.method} ${path} → ${res.status} ${text.slice(0, 500)}`,
    );
  }
  return body;
}

/* ------------------------------------------------------------------ *
 * Resolving field ids
 * ------------------------------------------------------------------ */

type RemoteField = { id: string; name?: string; fieldKey?: string };

/**
 * GHL wants a custom field's **id**, not its key, and ids are per
 * sub-account, so they have to be looked up. The lookup is cached for the
 * life of the server process: a field's id never changes, and a lead should
 * not pay for a second round trip.
 *
 * Cached as the promise rather than its result, so ten simultaneous leads on
 * a cold server make one request between them. A failed lookup is not cached
 * — the next lead retries.
 */
let fieldMap: Promise<Map<string, string>> | null = null;

async function loadFieldIds(): Promise<Map<string, string>> {
  const body = await call(
    `/locations/${process.env.GHL_LOCATION_ID}/customFields?model=contact`,
    { method: "GET" },
  );
  const remote = (body.customFields ?? []) as RemoteField[];

  const byKey = new Map<string, string>();
  const byName = new Map<string, string>();
  for (const f of remote) {
    if (!f.id) continue;
    if (f.fieldKey) byKey.set(f.fieldKey.toLowerCase(), f.id);
    if (f.name) byName.set(f.name.trim().toLowerCase(), f.id);
  }

  const map = new Map<string, string>();
  const missing: string[] = [];
  for (const def of CONTACT_FIELDS) {
    /* Key first, name second: a field renamed in GHL's UI keeps the key it
       was created with, and that key is the more durable handle. */
    const id =
      byKey.get(`${FIELD_KEY_PREFIX}${def.fieldKey}`) ??
      byKey.get(def.fieldKey) ??
      byName.get(def.name.toLowerCase());
    if (id) map.set(def.id, id);
    else missing.push(def.name);
  }

  if (missing.length) {
    /* Not fatal. The contact, its tags and its note are worth more than the
       fields that are missing, and this is exactly what the setup script
       exists to fix. */
    console.warn(
      `[ghl] ${missing.length} custom field(s) not found in this location — run \`npm run ghl:setup\`: ${missing.join(", ")}`,
    );
  }
  return map;
}

function fieldIds(): Promise<Map<string, string>> {
  if (!fieldMap) {
    fieldMap = loadFieldIds().catch((err) => {
      fieldMap = null;
      throw err;
    });
  }
  return fieldMap;
}

/* ------------------------------------------------------------------ *
 * Upserting the lead
 * ------------------------------------------------------------------ */

/** A lead's custom-field values, keyed by `id` in `./fields.ts`. */
export type FieldValues = Partial<Record<string, string>>;

export type GhlContact = {
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  /** GHL's own attribution `source` on the contact record. */
  source?: string;
  tags?: string[];
  fields?: FieldValues;
  /** Written as a Note on the contact, which is what a salesperson reads. */
  note?: string;
  /** Opportunity title, when a pipeline is configured. */
  opportunityName?: string;
  /**
   * Whether to cycle the lead tag on this submission. Default true. The chat
   * widget sets it false on its closing post, because its opening post
   * already tagged the same person a minute earlier and one conversation is
   * one inbound, not two.
   */
  retag?: boolean;
};

/**
 * Splits a typed-in name the way a CRM needs it. Everything after the first
 * space is the surname, which is wrong for some names and right for most; the
 * whole string is also sent as `name` so nothing is lost either way.
 */
function splitName(full: string): { firstName: string; lastName?: string } {
  const parts = full.trim().split(/\s+/);
  const firstName = parts.shift() ?? "";
  return parts.length ? { firstName, lastName: parts.join(" ") } : { firstName };
}

/** GHL wants E.164. Ten digits is a US number; eleven starting with 1 too. */
export function e164(phone: string): string | undefined {
  const d = phone.replace(/\D/g, "");
  if (d.length === 10) return `+1${d}`;
  if (d.length === 11 && d.startsWith("1")) return `+${d}`;
  if (d.length > 11) return `+${d}`;
  return undefined;
}

function customFieldPayload(
  values: FieldValues,
  ids: Map<string, string>,
): Json[] {
  const out: Json[] = [];
  for (const def of CONTACT_FIELDS as GhlFieldDef[]) {
    const value = values[def.id];
    if (value === undefined || value === null || value === "") continue;
    const id = ids.get(def.id);
    if (!id) continue;
    out.push({ id, [VALUE_KEY]: value });
  }
  return out;
}

const defaultTags = () =>
  (process.env.GHL_DEFAULT_TAGS ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

/**
 * The tag that means "this person came off the website", and the one tag not
 * sent with the upsert — it is applied afterwards, on its own, so that the
 * order of operations is ours. See `cycleLeadTag`.
 */
const leadTag = () =>
  process.env.GHL_LEAD_TAG === undefined
    ? "MHG_WEBSITE_LEAD"
    : process.env.GHL_LEAD_TAG.trim();

/**
 * Creates or updates the contact, then hangs the note and the opportunity off
 * it. Deduplication is GHL's: `/contacts/upsert` matches on phone and email
 * and respects the sub-account's own duplicate setting, so a visitor who
 * fills in the hero card and then chats does not become two people.
 *
 * Throws on failure. The caller decides what to tell the visitor — see
 * `./submit.ts`, which keeps the webhook and the log as the fallbacks.
 */
export async function upsertContact(contact: GhlContact): Promise<string | undefined> {
  const ids = await fieldIds();

  const phone = contact.phone ? e164(contact.phone) : undefined;
  const named = contact.name ? splitName(contact.name) : {};

  const payload: Json = {
    locationId: process.env.GHL_LOCATION_ID,
    ...named,
    ...(contact.name ? { name: contact.name } : {}),
    ...(contact.email ? { email: contact.email } : {}),
    ...(phone ? { phone } : {}),
    ...(contact.city ? { city: contact.city } : {}),
    ...(contact.state ? { state: contact.state } : {}),
    source: contact.source ?? "Website",
    tags: [...new Set([...(contact.tags ?? []), ...defaultTags()])],
    customFields: customFieldPayload(contact.fields ?? {}, ids),
  };

  const body = await call("/contacts/upsert", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const created = (body.contact ?? {}) as { id?: string; tags?: string[] };
  const contactId = created.id;
  if (!contactId) return undefined;

  /* All three of these are extras: a lead that landed but whose note failed
     is still a lead, so none of them is allowed to fail the submission. */
  if (contact.retag !== false) {
    await cycleLeadTag(contactId, body.new === true, created.tags ?? []).catch((err) =>
      console.error("[ghl] lead tag failed", err),
    );
  }
  if (contact.note) {
    await addNote(contactId, contact.note).catch((err) =>
      console.error("[ghl] note failed", err),
    );
  }
  await maybeOpenOpportunity(contactId, contact).catch((err) =>
    console.error("[ghl] opportunity failed", err),
  );

  return contactId;
}

/**
 * Puts the lead tag on the contact — and, if it is already there, takes it
 * off first.
 *
 * The removal looks pointless and is the entire point. GHL fires its "Contact
 * Tag Added" trigger on the transition, not on the state, so a returning
 * visitor who is already tagged would otherwise start no workflow at all: the
 * tag is present, nothing changed, nobody is told. Removing and re-adding
 * makes the second enquiry fire the same automation as the first.
 *
 * It is therefore a real edit to a contact's tags, and the window between the
 * two calls is a window in which the tag is genuinely absent. That is why the
 * remove is skipped for a contact that does not have the tag, why the add is
 * the call that is allowed to matter, and why a failed remove does not stop
 * the add — the failure mode to avoid is a lead left untagged.
 *
 * GHL stores tags lowercased, so what comes back is `mhg_website_lead`
 * whatever case it went in as. Comparison is case-insensitive to match.
 */
async function cycleLeadTag(contactId: string, isNew: boolean, existing: string[]) {
  const tag = leadTag();
  if (!tag) return;

  /* A contact GHL just created cannot already carry it. For an existing one,
     trust the tags the upsert echoed back; with none echoed, assume it may be
     there and remove first — a remove of a tag that is absent is a no-op at
     GHL's end and cheaper than being wrong in the other direction. */
  const mayHaveIt =
    !isNew && (existing.length === 0 || existing.some((t) => t.toLowerCase() === tag.toLowerCase()));

  if (mayHaveIt) {
    await removeTags(contactId, [tag]).catch((err) =>
      console.warn("[ghl] could not remove the lead tag before re-adding it", err),
    );
  }
  await addTags(contactId, [tag]);
}

export async function addTags(contactId: string, tags: string[]): Promise<void> {
  await call(`/contacts/${contactId}/tags`, {
    method: "POST",
    body: JSON.stringify({ tags }),
  });
}

export async function removeTags(contactId: string, tags: string[]): Promise<void> {
  await call(`/contacts/${contactId}/tags`, {
    method: "DELETE",
    body: JSON.stringify({ tags }),
  });
}

export async function addNote(contactId: string, body: string): Promise<void> {
  await call(`/contacts/${contactId}/notes`, {
    method: "POST",
    body: JSON.stringify({ body: body.slice(0, 5000) }),
  });
}

async function maybeOpenOpportunity(contactId: string, contact: GhlContact) {
  const pipelineId = process.env.GHL_PIPELINE_ID;
  const pipelineStageId = process.env.GHL_PIPELINE_STAGE_ID;
  if (!pipelineId || !pipelineStageId) return;

  await call("/opportunities/", {
    method: "POST",
    body: JSON.stringify({
      pipelineId,
      pipelineStageId,
      locationId: process.env.GHL_LOCATION_ID,
      contactId,
      name: contact.opportunityName ?? contact.name ?? "Website lead",
      status: "open",
    }),
  });
}

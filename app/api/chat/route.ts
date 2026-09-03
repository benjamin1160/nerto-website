import { parseAttribution } from "@/lib/attribution";
import { submitLead } from "@/lib/ghl/submit";

/**
 * Where the chat widget's lead lands.
 *
 * A route handler rather than a Server Action because the widget posts twice:
 * once the moment a name and a number exist — so somebody who closes the tab
 * three questions in is still a lead — and again when the conversation
 * finishes, with the rest of it. The second post updates the same contact,
 * because `/contacts/upsert` matches on the phone number.
 *
 * Everything below arrives from the browser, so it is parsed rather than
 * trusted: known keys, strings only, capped, and a bad body is a 400 rather
 * than a lead with 40kB of notes on it.
 */

/** The lead is not worth caching, and this must never be statically built. */
export const dynamic = "force-dynamic";

const CAPS = {
  name: 80,
  phone: 32,
  email: 120,
  topic: 120,
  landStatus: 40,
  notes: 1000,
  transcript: 4000,
  page: 300,
  savedHomes: 600,
} as const;

const str = (v: unknown, max: number) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

const digits = (s: string) => s.replace(/\D/g, "");

/**
 * A crude per-instance throttle: enough to stop somebody holding the button
 * down, not a substitute for a WAF. It is per server instance and forgets
 * everything on restart, which is the right trade for a lead form — a real
 * visitor rate-limited into silence is worse than a duplicate contact.
 */
const RATE_LIMIT = { windowMs: 60_000, max: 12 };
const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimited(key: string): boolean {
  const now = Date.now();
  const seen = hits.get(key);
  if (!seen || now > seen.resetAt) {
    hits.set(key, { count: 1, resetAt: now + RATE_LIMIT.windowMs });
    /* Keep the map from growing without bound on a long-lived instance. */
    if (hits.size > 5000) {
      for (const [k, v] of hits) if (now > v.resetAt) hits.delete(k);
    }
    return false;
  }
  seen.count += 1;
  return seen.count > RATE_LIMIT.max;
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  if (rateLimited(ip)) {
    return Response.json({ ok: false, error: "rate-limited" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "bad-json" }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return Response.json({ ok: false, error: "bad-body" }, { status: 400 });
  }
  const input = body as Record<string, unknown>;

  // Honeypot, same as every form on the site.
  if (str(input.company, 50)) return Response.json({ ok: true });

  const name = str(input.name, CAPS.name);
  const phone = str(input.phone, CAPS.phone);
  const email = str(input.email, CAPS.email);

  /* A name and a way to reach them is the whole point; without either there
     is nothing to send. */
  if (name.length < 2 || (digits(phone).length < 10 && !email)) {
    return Response.json({ ok: false, error: "incomplete" }, { status: 400 });
  }

  const topic = str(input.topic, CAPS.topic);
  const notes = str(input.notes, CAPS.notes);

  const result = await submitLead({
    form: "chat-widget",
    name,
    phone: digits(phone).length >= 10 ? phone : undefined,
    email: email || undefined,
    landStatus: str(input.landStatus, CAPS.landStatus) || undefined,
    /* The topic is what they clicked; the notes are what they typed. Both
       matter, and a note reading "Financing and rent to own — asked about a
       repo she saw" is worth more than either alone. */
    notes: [topic, notes].filter(Boolean).join(" — ") || undefined,
    chatTranscript: str(input.transcript, CAPS.transcript) || undefined,
    savedHomes: str(input.savedHomes, CAPS.savedHomes)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    attribution: parseAttribution(input.attribution),
  });

  return Response.json({ ok: result.ok }, { status: result.ok ? 200 : 502 });
}

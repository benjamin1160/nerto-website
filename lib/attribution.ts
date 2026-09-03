/**
 * First-touch attribution, captured in the browser.
 *
 * GHL fills its own attribution fields from its own forms and funnels. This
 * site's forms are not those, so the campaign that paid for the visit is
 * invisible to the CRM unless the site carries it across — which is all this
 * does: read the query string and the referrer once, remember them for the
 * session, and post them with whatever the visitor eventually fills in.
 *
 * First touch, not last: somebody who arrives on an ad, reads four pages and
 * then fills in the contact band arrived on the ad. The landing page and
 * referrer are frozen at the first page of the session; the conversion page
 * is whatever page the form was actually submitted from.
 *
 * Session storage rather than a cookie: it is not needed on the server, it
 * expires with the tab, and it means the site still sets no cookies at all.
 */
import type { Attribution } from "./ghl/lead";

const KEY = "nerto:attribution";

/** Query parameters worth keeping, and the field each becomes. */
const PARAMS: [param: string, field: keyof Attribution][] = [
  ["utm_source", "utmSource"],
  ["utm_medium", "utmMedium"],
  ["utm_campaign", "utmCampaign"],
  ["utm_term", "utmTerm"],
  ["utm_content", "utmContent"],
  ["gclid", "gclid"],
  ["fbclid", "fbclid"],
];

/** Long enough for a real campaign name, short enough to not be a payload. */
const CAP = 200;
const cap = (v: string) => v.trim().slice(0, CAP);

function firstTouch(): Attribution {
  try {
    const stored = window.sessionStorage.getItem(KEY);
    if (stored) return JSON.parse(stored) as Attribution;
  } catch {
    /* Private mode, or a blocked store. Fall through and recompute — the
       lead still gets this visit's attribution, just not the session's. */
  }

  const url = new URL(window.location.href);
  const found: Attribution = {
    landingPage: cap(url.origin + url.pathname),
    /* An internal referrer is this site's own last page, which says nothing
       about where the visitor came from. */
    referrer:
      document.referrer && !document.referrer.startsWith(url.origin)
        ? cap(document.referrer)
        : undefined,
  };
  for (const [param, field] of PARAMS) {
    const value = url.searchParams.get(param);
    if (value) found[field] = cap(value);
  }

  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(found));
  } catch {
    /* Nothing to do — the values above are still returned for this lead. */
  }
  return found;
}

/**
 * The session's attribution plus the page this call is made from. Browser
 * only: call it from an effect or an event handler, never during render.
 */
export function attribution(): Attribution {
  if (typeof window === "undefined") return {};
  const url = new URL(window.location.href);
  return { ...firstTouch(), conversionPage: cap(url.origin + url.pathname) };
}

/** The same, as the string the hidden field in every form carries. */
export function attributionField(): string {
  const found = attribution();
  return Object.keys(found).length ? JSON.stringify(found) : "";
}

/**
 * The server's side of that field. Everything arriving here was typed by the
 * client, so it is parsed defensively: known keys only, strings only, capped,
 * and any failure is simply no attribution rather than a failed lead.
 *
 * Takes either the JSON string a form posts or the object the chat widget
 * posts — one parser, two callers, no chance of them diverging.
 */
export function parseAttribution(raw: unknown): Attribution {
  let parsed: unknown = raw;
  if (typeof raw === "string") {
    if (raw.length === 0 || raw.length > 2000) return {};
    try {
      parsed = JSON.parse(raw);
    } catch {
      return {};
    }
  }
  if (!parsed || typeof parsed !== "object") return {};

  const allowed: (keyof Attribution)[] = [
    "landingPage",
    "conversionPage",
    "referrer",
    ...PARAMS.map(([, field]) => field),
  ];
  const out: Attribution = {};
  for (const key of allowed) {
    const value = (parsed as Record<string, unknown>)[key];
    if (typeof value === "string" && value.trim()) out[key] = value.trim().slice(0, CAP);
  }
  return out;
}

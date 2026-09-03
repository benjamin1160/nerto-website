/**
 * GoHighLevel's own chat widget, from the `CHAT_WIDGET` environment variable.
 *
 * GHL hands you an embed snippet to paste into a site:
 *
 *   <script src="https://widgets.leadconnectorhq.com/loader.js"
 *           data-resources-url="https://widgets.leadconnectorhq.com/chat-widget/loader.js"
 *           data-widget-id="6a999ff739356933b8e45932"></script>
 *
 * Put that whole snippet — or just the widget id — in `CHAT_WIDGET` and the
 * site loads GHL's widget instead of its own. Set nothing and the built-in
 * widget stays. **Never both**: two chat bubbles in one corner is the worst
 * of both, and `app/layout.tsx` picks one.
 *
 * The trade is worth knowing before you choose:
 *
 *   GHL's widget      Real two-way conversation into the GHL inbox, live
 *                     chat and SMS follow-up, styled in GHL. Its leads are
 *                     GHL's own, so they arrive with GHL's fields — not the
 *                     custom fields in `./fields.ts`, not the shortlist, and
 *                     not this site's first-touch attribution.
 *   The built-in one  A guided intake that fills every field in `./fields.ts`
 *                     and posts the transcript, but nobody is typing back.
 *
 * A snippet is executable code, and this one arrives from configuration, so
 * it is parsed rather than injected: the `src` and the `data-*` attributes
 * are read out and re-rendered as a real script tag, everything else is
 * dropped, and a `src` that is not HTTPS on leadconnectorhq.com is refused
 * outright. A mistyped variable turns the widget off; it never turns the
 * site into somebody else's script host.
 */

/** GHL's own CDN, and the only host this will load a script from. */
const ALLOWED_HOST = "leadconnectorhq.com";
const LOADER = "https://widgets.leadconnectorhq.com/loader.js";
const RESOURCES = "https://widgets.leadconnectorhq.com/chat-widget/loader.js";

export type ChatEmbed = {
  src: string;
  /** `data-*` attributes, spread onto the script tag. */
  attributes: Record<string, string>;
};

function allowed(src: string): boolean {
  try {
    const url = new URL(src);
    return (
      url.protocol === "https:" &&
      (url.hostname === ALLOWED_HOST || url.hostname.endsWith(`.${ALLOWED_HOST}`))
    );
  } catch {
    return false;
  }
}

/**
 * Reads `CHAT_WIDGET` and returns what to render, or `null` for "render the
 * site's own widget instead".
 *
 * Server only, and read wherever the page is rendered — which for this site
 * is mostly at build time, so the variable has to be set for the build, not
 * just for the running server.
 */
export function chatEmbed(): ChatEmbed | null {
  const raw = process.env.CHAT_WIDGET?.trim();
  if (!raw) return null;

  /* A bare widget id — the useful half of the snippet — is enough. */
  if (/^[A-Za-z0-9]{12,64}$/.test(raw)) {
    return {
      src: LOADER,
      attributes: { "data-resources-url": RESOURCES, "data-widget-id": raw },
    };
  }

  const src = raw.match(/\bsrc\s*=\s*["']([^"']+)["']/i)?.[1];
  if (!src) {
    console.error("[chat] CHAT_WIDGET is set but carries no src — ignoring it.");
    return null;
  }
  if (!allowed(src)) {
    console.error(
      `[chat] CHAT_WIDGET points at ${src}, which is not HTTPS on ${ALLOWED_HOST} — ignoring it.`,
    );
    return null;
  }

  /* Only `data-*` attributes survive. An `onload`, an `integrity`, a
     `nonce` — anything else the snippet carries — is dropped rather than
     forwarded into the page. */
  const attributes: Record<string, string> = {};
  for (const [, name, value] of raw.matchAll(
    /\b(data-[a-z0-9-]+)\s*=\s*["']([^"']*)["']/gi,
  )) {
    attributes[name.toLowerCase()] = value;
  }

  if (!attributes["data-widget-id"]) {
    console.warn("[chat] CHAT_WIDGET has no data-widget-id — GHL will not know which widget to load.");
  }

  return { src, attributes };
}

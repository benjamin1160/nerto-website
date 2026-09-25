/**
 * Pull this site's lot state from the platform's inventory feed.
 *
 *   node scripts/sync-listings.mjs          fetch, check, download photos, write
 *   node scripts/sync-listings.mjs check    fetch and check only — writes nothing
 *
 * Runs as `prebuild`, so every deploy builds from what the platform says now.
 * The contract — the JSON the platform sends — is in `PLATFORM.md`; the shape
 * this writes is `Inventory` in `lib/inventory.ts`.
 *
 * Environment:
 *
 *   LISTINGS_FEED_URL    The feed for this site. Unset: do nothing, and the
 *                        site keeps building from `lotState` in lib/homes.ts.
 *                        `file:///abs/path.json` reads a local file, for
 *                        trying a payload before the platform serves it.
 *   LISTINGS_FEED_TOKEN  Optional. Sent as `Authorization: Bearer <token>`.
 *
 * Failure policy. With a feed configured, a feed that cannot be fetched or is
 * not the shape in PLATFORM.md FAILS THE BUILD. That is deliberate: a failed
 * deploy leaves the last good one serving, whereas carrying on would publish
 * a site whose lot state quietly fell back to whatever this repo last said.
 * Anything smaller — one malformed home, one photo that will not download —
 * is dropped with a warning and the rest goes live.
 */
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";

const ROOT = new URL("../", import.meta.url);
const OUT = new URL("lib/inventory.generated.ts", ROOT);
const PHOTO_DIR = new URL("public/photos/feed/", ROOT);

const FEED_VERSION = 1;
const MAX_PHOTO_BYTES = 15 * 1024 * 1024;

/* The vocabularies below mirror the types in lib/homes.ts. A value outside
   them is dropped rather than passed through, because the page would render
   whatever arrived. */
const STATUSES = ["available", "to-order", "pending", "sold", "coming-soon"];
const SECTIONS = ["single", "double", "triple"];
const CONSTRUCTION = ["manufactured", "modular"];
const STYLES = ["farmhouse", "craftsman", "modern", "coastal", "lodge", "ranch"];
const SCENES = ["exterior", "living", "kitchen", "bedroom", "bath", "porch"];
const IMAGE_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const mode = process.argv[2] ?? "sync";
const url = process.env.LISTINGS_FEED_URL?.trim();
const token = process.env.LISTINGS_FEED_TOKEN?.trim();

if (!url) {
  console.log("sync-listings — LISTINGS_FEED_URL not set; lot state comes from lib/homes.ts.");
  process.exit(0);
}

const fail = (msg) => {
  console.error(`sync-listings — ${msg}`);
  console.error("  The build stops here so the last good deploy stays live.");
  process.exit(1);
};
const warnings = [];
const warn = (msg) => void warnings.push(msg);

/* ---------------------------------------------------------------- *
 * Fetch
 * ---------------------------------------------------------------- */

/** Local hosts may be plain http, for testing against a platform in dev. */
function allowedRemote(raw) {
  try {
    const u = new URL(raw);
    if (u.protocol === "https:") return u;
    if (u.protocol === "http:" && ["localhost", "127.0.0.1"].includes(u.hostname)) return u;
  } catch {}
  return undefined;
}

async function fetchWithRetry(target, init, attempts = 3) {
  let last;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(target, { ...init, signal: AbortSignal.timeout(20_000) });
      if (res.status < 500 && res.status !== 429) return res;
      last = new Error(`HTTP ${res.status}`);
    } catch (err) {
      last = err;
    }
    await new Promise((r) => setTimeout(r, 1000 * 2 ** i));
  }
  throw last;
}

let payload;
let source;
if (url.startsWith("file://")) {
  source = "local file";
  try {
    payload = JSON.parse(await readFile(new URL(url), "utf8"));
  } catch (err) {
    fail(`could not read ${url}: ${err.message}`);
  }
} else {
  const feedUrl = allowedRemote(url);
  if (!feedUrl) fail("LISTINGS_FEED_URL must be an https:// URL (or http://localhost for testing).");
  source = feedUrl.host;
  let res;
  try {
    res = await fetchWithRetry(feedUrl, {
      headers: {
        accept: "application/json",
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
    });
  } catch (err) {
    fail(`could not reach ${source}: ${err.message}`);
  }
  if (!res.ok) fail(`${source} answered HTTP ${res.status}.`);
  try {
    payload = await res.json();
  } catch {
    fail(`${source} did not send JSON.`);
  }
}

/* ---------------------------------------------------------------- *
 * Check
 * ---------------------------------------------------------------- */

if (!payload || typeof payload !== "object") fail("the feed is not a JSON object.");
if (payload.version !== FEED_VERSION) {
  fail(`the feed says version ${JSON.stringify(payload.version)}; this site reads version ${FEED_VERSION}.`);
}
if (!Array.isArray(payload.listings)) fail("the feed has no `listings` array.");

const catalogue = await readFile(new URL("lib/catalogue.generated.ts", ROOT), "utf8");
const planSlugs = new Set([...catalogue.matchAll(/^\s{4}slug: "([^"]+)",$/gm)].map((m) => m[1]));

const str = (v, max) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : undefined);
const num = (v, min = 0) => (typeof v === "number" && Number.isFinite(v) && v >= min ? v : undefined);
const oneOf = (v, list) => (list.includes(v) ? v : undefined);
const bool = (v) => (typeof v === "boolean" ? v : undefined);
const strings = (v, max, count) =>
  Array.isArray(v) ? v.map((s) => str(s, max)).filter(Boolean).slice(0, count) : undefined;
const httpsUrl = (v) => {
  const u = typeof v === "string" && allowedRemote(v);
  return u ? u.href : undefined;
};

/** Known keys only, each checked; everything else is dropped. */
function clean(raw) {
  const out = {
    slug: raw.slug,
    status: oneOf(raw.status, STATUSES),
    onLot: bool(raw.onLot),
    featured: bool(raw.featured),
    price: num(raw.price, 1),
    wasPrice: num(raw.wasPrice, 1),
    daysListed: num(raw.daysListed),
    tourUrl: httpsUrl(raw.tourUrl),
    name: str(raw.name, 120),
    builder: str(raw.builder, 120),
    construction: oneOf(raw.construction, CONSTRUCTION),
    series: str(raw.series, 80),
    model: str(raw.model, 80),
    beds: num(raw.beds),
    baths: num(raw.baths),
    sqft: num(raw.sqft, 1),
    sections: oneOf(raw.sections, SECTIONS),
    widthFt: num(raw.widthFt, 1),
    lengthFt: num(raw.lengthFt, 1),
    dimensions: str(raw.dimensions, 60),
    year: num(raw.year, 1900),
    style: oneOf(raw.style, STYLES),
    hers: num(raw.hers),
    tagline: str(raw.tagline, 200),
    story: strings(raw.story, 2000, 10),
    highlights: strings(raw.highlights, 200, 12),
  };
  for (const key of Object.keys(out)) if (out[key] === undefined) delete out[key];

  for (const [key, value] of Object.entries(raw)) {
    if (key === "photos" || key === "slug") continue;
    if (value !== undefined && value !== null && !(key in out)) {
      warn(`${raw.slug}: dropped \`${key}\` — ${JSON.stringify(value).slice(0, 60)} is not a value this site accepts.`);
    }
  }
  if (out.wasPrice !== undefined && (out.price === undefined || out.wasPrice <= out.price)) {
    warn(`${raw.slug}: dropped \`wasPrice\` — it must sit above \`price\`.`);
    delete out.wasPrice;
  }

  const photos = [];
  const seenKinds = new Set();
  for (const p of Array.isArray(raw.photos) ? raw.photos : []) {
    const kind = oneOf(p?.kind, SCENES);
    const src = httpsUrl(p?.url);
    if (!kind || !src) {
      warn(`${raw.slug}: dropped a photo — needs \`kind\` (${SCENES.join(", ")}) and an https \`url\`.`);
      continue;
    }
    if (seenKinds.has(kind)) {
      warn(`${raw.slug}: dropped a second \`${kind}\` photo — one per kind.`);
      continue;
    }
    seenKinds.add(kind);
    photos.push({ kind, url: src, caption: str(p.caption, 200) });
  }
  return { listing: out, photos };
}

const seen = new Set();
const accepted = [];
for (const raw of payload.listings) {
  if (!raw || typeof raw !== "object" || typeof raw.slug !== "string" || !SLUG.test(raw.slug) || raw.slug.length > 80) {
    warn(`dropped an entry with no usable slug: ${JSON.stringify(raw?.slug ?? raw).slice(0, 60)}`);
    continue;
  }
  if (seen.has(raw.slug)) {
    warn(`${raw.slug}: appears twice; kept the first.`);
    continue;
  }
  seen.add(raw.slug);
  const entry = clean(raw);

  /* A slug the catalogue does not have is a home in its own right, and
     there is no plan behind it to supply the basics. */
  if (!planSlugs.has(raw.slug)) {
    const missing = ["name", "beds", "baths", "sqft"].filter((k) => entry.listing[k] === undefined);
    if (missing.length) {
      warn(
        `${raw.slug}: not a catalogue plan, so it needs ${missing.join(", ")} to be listed on its own. Dropped.`,
      );
      continue;
    }
  }
  accepted.push(entry);
}

const report = (photoCount) => {
  for (const w of warnings) console.warn(`  ! ${w}`);
  const overlays = accepted.filter((e) => planSlugs.has(e.listing.slug)).length;
  console.log(
    `sync-listings — ${source}: ${accepted.length} homes (${overlays} catalogue plans, ` +
      `${accepted.length - overlays} of its own), ${photoCount} photos, ${warnings.length} warnings.`,
  );
};

if (mode === "check") {
  report(accepted.reduce((n, e) => n + e.photos.length, 0));
  process.exit(0);
}

/* ---------------------------------------------------------------- *
 * Photographs — downloaded, so the site serves its own files and
 * next/image never has to be told about the platform's storage host.
 * ---------------------------------------------------------------- */

await rm(PHOTO_DIR, { recursive: true, force: true });

async function download({ slug }, photo) {
  let res;
  try {
    res = await fetchWithRetry(photo.url, {}, 2);
  } catch (err) {
    return warn(`${slug}/${photo.kind}: photo did not download (${err.message}).`);
  }
  const type = res.headers.get("content-type")?.split(";")[0].trim();
  const ext = IMAGE_TYPES[type];
  if (!res.ok || !ext) {
    return warn(`${slug}/${photo.kind}: photo skipped — HTTP ${res.status}, ${type ?? "no content type"}.`);
  }
  const body = Buffer.from(await res.arrayBuffer());
  if (body.length > MAX_PHOTO_BYTES) {
    return warn(`${slug}/${photo.kind}: photo skipped — over ${MAX_PHOTO_BYTES / 1024 / 1024} MB.`);
  }
  const dir = new URL(`${slug}/`, PHOTO_DIR);
  await mkdir(dir, { recursive: true });
  await writeFile(new URL(`${photo.kind}.${ext}`, dir), body);
  return { kind: photo.kind, src: `/photos/feed/${slug}/${photo.kind}.${ext}`, caption: photo.caption };
}

/* Six at a time: enough to be quick, few enough not to trip a rate limit. */
const jobs = accepted.flatMap((e) => e.photos.map((p) => () => download(e.listing, p)));
const results = new Array(jobs.length);
let next = 0;
await Promise.all(
  Array.from({ length: Math.min(6, jobs.length) }, async () => {
    while (next < jobs.length) {
      const i = next++;
      results[i] = await jobs[i]();
    }
  }),
);

let cursor = 0;
const listings = accepted.map(({ listing, photos }) => {
  const saved = photos
    .map(() => results[cursor++])
    .filter(Boolean)
    .map(({ caption, ...p }) => (caption ? { ...p, caption } : p));
  return saved.length ? { ...listing, photos: saved } : listing;
});

/* ---------------------------------------------------------------- *
 * Write
 * ---------------------------------------------------------------- */

const inventory = {
  source,
  fetchedAt: new Date().toISOString(),
  ...(str(payload.updatedAt, 40) ? { updatedAt: str(payload.updatedAt, 40) } : {}),
  listings,
};

await writeFile(
  OUT,
  `/**
 * THE PLATFORM'S INVENTORY FEED — GENERATED FILE, DO NOT EDIT BY HAND.
 *
 * Written by \`node scripts/sync-listings.mjs\` from ${source}. While this
 * holds a feed, \`lotState\` in \`lib/homes.ts\` is ignored.
 *
 * Commit it as \`null\`. A local sync rewrites it; \`git checkout\` it after.
 */
import type { Inventory } from "./inventory";

export const inventory: Inventory | null = ${JSON.stringify(inventory, null, 2)};
`,
);

report(listings.reduce((n, l) => n + (l.photos?.length ?? 0), 0));

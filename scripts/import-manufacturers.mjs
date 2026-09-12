/**
 * Import the catalogue from the two manufacturers NERTO retails.
 *
 *   node scripts/import-manufacturers.mjs fetch    # cache the source JSON
 *   node scripts/import-manufacturers.mjs homes    # write lib/catalogue.generated.ts
 *   node scripts/import-manufacturers.mjs photos   # download + resize model imagery
 *   node scripts/import-manufacturers.mjs manifest # write lib/photos.generated.ts
 *
 * Add `--sheets` to `photos` to also cache every gallery shoot small, which
 * is what you read when re-tagging scenes by eye.
 *
 * Both sites are Squarespace, so every collection answers `?format=json` with
 * structured records rather than markup. That is what this reads: the model
 * code is the item title, the specs are in the excerpt, and the width class,
 * bedroom count and footprint band are Squarespace categories.
 *
 * Sources
 *   Pine Grove Homes (Pine Grove, PA) — HUD-code manufactured homes, four
 *   collections: ranch, community, single-section and multi-family. The NETR
 *   line ("Northeast True Ranch") is the one specified for the northern New
 *   England states, Maine included.
 *
 *   Pleasant Valley Homes (Pine Grove, PA) — state-code modular homes, one
 *   collection. The Lake Series is excluded on NERTO's instruction.
 *
 * What the sources do NOT carry, and this script therefore never invents:
 * price, section count for the modulars, year, HERS index, floor-plan
 * geometry, or prose beyond what the manufacturer itself wrote. Those stay
 * undefined and the site renders around them.
 *
 * Imagery differs by source and is treated differently because of it:
 *   Pine Grove leads each model with its floor-plan DRAWING. That is imported
 *   as `planImage` — a labelled drawing, never passed off as a photograph.
 *   Pleasant Valley leads each model with an exterior RENDERING. That is
 *   imported as the home's exterior scene. A rendering is a drawing of a
 *   house that has not been built yet, and the site says so in its footer.
 *   Its floor-plan drawing, where the model page publishes one as an image,
 *   is read off that page and imported as `planImage` as well — see
 *   `pvPlans` below, which takes a drawing only when the filename says it is
 *   one, and reports the models that publish a PDF instead.
 *   Real PHOTOGRAPHS exist only in Pine Grove's per-model gallery pages —
 *   about 150 of them, of which 88 belong to plans still in the catalogue.
 *   Those are matched, verified against the model number in their own
 *   filenames, and scene-tagged; see `galleries` at the foot of this file.
 *
 * Which leaves most of the catalogue with a drawing and no photograph, and
 * that is fine: `components/artwork/scene.tsx` falls back to the drawing,
 * captioned as one, exactly as Pine Grove's own model pages do.
 */
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const CACHE = ".cache/manufacturers";
const OUT_PHOTOS = "public/photos/homes";
const OUT_PLANS = "public/photos/plans";
const OUT_TS = "lib/catalogue.generated.ts";

/** `photos --sheets` also caches each shoot small, for hand re-tagging. */
const WANT_SHEETS = process.argv.includes("--sheets");

/** Every source collection, and what is true of every home in it. */
const SOURCES = [
  {
    key: "pg-ranch",
    url: "https://www.pinegrovehomes.com/ranch-homes",
    builder: "Pine Grove Homes",
    construction: "manufactured",
    sections: "double",
    collection: "Ranch",
  },
  {
    key: "pg-community",
    url: "https://www.pinegrovehomes.com/community-homes",
    builder: "Pine Grove Homes",
    construction: "manufactured",
    sections: "double",
    collection: "Community",
  },
  {
    key: "pg-single",
    url: "https://www.pinegrovehomes.com/single-section-homes",
    builder: "Pine Grove Homes",
    construction: "manufactured",
    sections: "single",
    collection: "Single-Section",
  },
  {
    key: "pg-multifamily",
    url: "https://www.pinegrovehomes.com/multifamily-homes",
    builder: "Pine Grove Homes",
    construction: "manufactured",
    sections: "double",
    collection: "Multi-Family",
  },
  {
    key: "pv",
    url: "https://pleasantvalleymodularhomes.com/homes",
    builder: "Pleasant Valley Homes",
    construction: "modular",
    /* Pleasant Valley does not publish a section count per plan, so none is
       written. The modular size bucket is driven by `construction`, not by
       `sections`, precisely so this can stay honestly absent. */
    sections: undefined,
    collection: "Modular",
  },
];

/**
 * Excluded on NERTO's instruction: it does not carry the Lake Series. Matched
 * on the name prefix, which is how Pleasant Valley names the line — every one
 * of them is "Lake <something>".
 */
const isLakeSeries = (title) => /^lake\s/i.test(title);

/**
 * Pine Grove photographs its model homes and publishes each shoot as its own
 * gallery page — around 150 of them, one per model, some with a shoot per
 * show year. These are the only real photographs in the import; the rest of
 * the catalogue carries a drawing or a rendering, and says so.
 *
 * They are Pine Grove's photographs of that model, not photographs of the
 * particular house standing on River Road, so captions stay generic and the
 * photography note in `components/site-footer.tsx` still applies. Replace
 * them with NERTO's own shots of its own homes when there are some.
 *
 * Galleries are discovered from Pine Grove's sitemap rather than listed here,
 * because the naming is not consistent enough to construct: `g3002-gallery`,
 * `g-1883-gallery`, `netr-g3157-gallery`, `netrg3465-gallery-2025` and
 * `netr3157-gallery-2025` are all real. `galleryKey` below normalises both
 * sides of the match; `verifyGallery` then checks the photographs actually
 * belong to the model before any of them is used.
 */
const SITEMAP = "https://www.pinegrovehomes.com/sitemap.xml";

/**
 * A comparable key for a gallery slug or a listing slug.
 *
 * Returns `{ netr, prefix, digits }`. The NETR flag is kept separate and is
 * never ignored: `g3465-gallery` and `netrg3465-gallery-2025` are two
 * different houses, and conflating them would put one model's photographs on
 * the other's page.
 *
 * Only the `-gallery…` tail is stripped, and that removes the show year with
 * it, because every year suffix Pine Grove uses sits after it
 * (`netrg3465-gallery-2025`). Do NOT also strip a trailing `-19xx`/`-20xx`:
 * a great many model codes ARE those numbers — G-1941, G-2088, GH-2017 — and
 * treating them as years silently erases the model.
 */
function galleryKey(slug) {
  const bare = slug.replace(/-gallery.*$/, "").toLowerCase();
  const netr = /netr/.test(bare);
  const rest = bare.replace(/netr/, "");
  /* Every digit run, joined: Pine Grove writes the same model as `G-16-624`
     in its catalogue and `g16624` in its gallery slug, so reading only the
     first run would compare "16" against "16624" and match nothing. */
  const digits = (rest.match(/\d+/g) ?? []).join("");
  if (!digits) return undefined;
  return { netr, prefix: rest.match(/[a-z]+/)?.[0] ?? "", digits };
}

/** The show year in a gallery slug, for preferring the most recent shoot. */
function galleryYear(slug) {
  return Number(slug.match(/-((?:19|20)\d{2})\d*(?:-gallery)?/)?.[1] ?? 0);
}

/**
 * Does this gallery's own filenames agree that it is the model we matched it
 * to?
 *
 * Many of Pine Grove's photographs are named after the model — `3463-01.JPG`,
 * `G-3002 Kitchen.JPG` — which is a free check on the slug matching above. If
 * the filenames name a *different* model number, the match is rejected; if
 * they name no model at all (`DSC_0015.JPG`), there is nothing to contradict
 * and the match stands on the slug alone.
 *
 * Camera date stamps are stripped first. Plenty of these shoots are named
 * `2013-03-21 14.24.24.jpg`, and reading "2013" as a model number rejects a
 * perfectly good gallery — which it did, for four of them, until this did.
 */
function modelNumbersIn(alt) {
  const withoutTimestamps = alt
    .replace(/\b(?:19|20)\d{2}[-_.]\d{2}[-_.]\d{2}\b/g, " ")
    .replace(/\b\d{2}[.:_-]\d{2}[.:_-]\d{2}\b/g, " ");
  return [...withoutTimestamps.matchAll(/\b(\d{3,5})\b/g)].map((m) => m[1]);
}

/**
 * `digits` is every digit run in the model code joined up — G-16-630 becomes
 * "16630" — while a filename may carry only part of it (`16-630-01.JPG`
 * yields "630"). So the comparison is containment either way, which still
 * rejects a genuinely different model (3465 neither contains nor is contained
 * by 3557) without rejecting a model written with a separator.
 */
function verifyGallery(images, digits) {
  const named = images.flatMap((i) => modelNumbersIn(i.alt));
  if (named.length === 0) return true;
  return named.some((n) => digits.includes(n) || n.includes(digits));
}

/**
 * Which scene a photograph is of, read from its filename.
 *
 * Pine Grove's better shoots name the room — `03-Living Room.jpg`,
 * `G-3002 Kitchen.JPG` — and those are classified exactly. The rest are
 * camera filenames (`DSC_0015.JPG`) carrying nothing, and get no scene: for
 * those galleries only the first photograph is used, as an exterior, because
 * every shoot in this catalogue opens on the front of the house.
 */
const SCENE_PATTERNS = [
  ["exterior", /\b(front|exterior|elevation|ext)\b/i],
  ["porch", /\b(porch|deck|patio)\b/i],
  ["kitchen", /\b(kitchen|dining)\b/i],
  ["living", /\b(living|family|great ?room|entry|foyer)\b/i],
  ["bedroom", /\b(bed ?room|bedroom|master|primary suite)\b/i],
  ["bath", /\b(bath|shower|vanity|ensuite|en-suite)\b/i],
];

function sceneOf(alt) {
  return SCENE_PATTERNS.find(([, re]) => re.test(alt))?.[0];
}

/**
 * Hand-tagged scenes, which beat anything derived from a filename.
 *
 * Indices are into the gallery's ordered image list and were read off the
 * contact sheets `photos` writes into `.cache/`. These three galleries carry
 * camera filenames with no room in them, and they are the homes standing on
 * the lot, so they were worth tagging by eye. ZK-1100's exterior is index 2 —
 * a plain photograph of the home — in preference to the dusk shot at index 0,
 * which is a rendering.
 */
const ON_LOT_SCENES = {
  "netr-g-3157": { exterior: 0, living: 4, kitchen: 8, bath: 12 },
  "zk-1100": { exterior: 2, living: 7, kitchen: 5, bedroom: 10, bath: 11 },
  "g-3002": { exterior: 0, living: 3, kitchen: 1 },
};

/** Scene order on a listing, so the gallery reads the way a walkthrough goes. */
const SCENE_ORDER = ["exterior", "living", "kitchen", "bedroom", "bath", "porch"];

const SCENE_CAPTIONS = {
  exterior: "Front elevation",
  living: "Living room",
  kitchen: "Kitchen",
  bedroom: "Primary bedroom",
  bath: "Primary bath",
  porch: "Covered porch",
};

/* ------------------------------------------------------------------ *
 * Fetching
 * ------------------------------------------------------------------ */

async function cached(name, fetcher) {
  const file = path.join(CACHE, name);
  if (existsSync(file)) return JSON.parse(await readFile(file, "utf8"));
  const data = await fetcher();
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(data));
  return data;
}

async function collection(source) {
  return cached(`${source.key}.json`, async () => {
    const res = await fetch(`${source.url}?format=json`);
    if (!res.ok) throw new Error(`${source.url}: HTTP ${res.status}`);
    const body = await res.json();
    return body.items ?? [];
  });
}

/* ------------------------------------------------------------------ *
 * Parsing
 *
 * The excerpt is one line of manufacturer copy carrying every spec:
 *   Pine Grove   27'4" x 52' | 3 Bed 2.5 Bath | 1,496 sq. ft.
 *   Pleasant Vy  2 Bedrooms | 1 Bath | 1,042 sq. ft.
 * Everything below reads that line and the Squarespace categories, and
 * returns undefined for anything it cannot read rather than guessing.
 * ------------------------------------------------------------------ */

const strip = (html) =>
  (html ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, " ")
    .trim();

const int = (s) => (s === undefined ? undefined : Number(String(s).replace(/,/g, "")));

function parseSpecs(text) {
  const sqft = int(text.match(/([\d,]+)\s*sq\.?\s*ft/i)?.[1]);
  const beds = int(text.match(/(\d+)\s*Bed(?:room)?s?\b/i)?.[1]);
  const baths = Number(text.match(/([\d.]+)\s*Bath(?:room)?s?\b/i)?.[1]);
  return {
    sqft,
    beds,
    baths: Number.isFinite(baths) ? baths : undefined,
  };
}

/** Feet-and-inches to a decimal number of feet: `26'8"` → 26.667. */
function feet(ft, inches) {
  return Number(ft) + (inches ? Number(inches) / 12 : 0);
}

/**
 * The manufacturer's own dimension string and a numeric footprint from it.
 *
 * Pine Grove writes real box dimensions (`26'8" x 52'`), which are always a
 * few inches under the nominal width everyone actually says — a 26'8" home is
 * a 27-wide, a 27'4" home is a 28-wide. So the exact string is kept verbatim
 * for display and the numeric width is taken from the site's own width
 * category, which carries the nominal figure. Where a length is given as a
 * range (`52'/40'`) the longer figure is used and the string keeps both.
 */
function parseDimensions(text, categories) {
  const m = text.match(
    /(\d+)\s*(?:'\s*(\d+)\s*")?\s*[x×]\s*(\d+)\s*(?:'\s*(\d+)\s*")?\s*'?(?:\s*\/\s*(\d+))?/,
  );
  if (!m) return {};

  const rawWidth = feet(m[1], m[2]);
  const rawLength = feet(m[3], m[4]);
  const altLength = m[5] ? Number(m[5]) : undefined;

  const nominal = (categories ?? [])
    .map((c) => c.match(/(\d+)-Wide/i)?.[1])
    .find(Boolean);

  const widthFt = nominal ? Number(nominal) : Math.round(rawWidth);
  const lengthFt = Math.round(Math.max(rawLength, altLength ?? 0));

  /* Rebuilt rather than sliced out of the excerpt so it reads consistently
     whichever of the source's several notations the model used. */
  const asFeet = (v) => {
    const f = Math.floor(v + 1e-9);
    const i = Math.round((v - f) * 12);
    return i ? `${f}'${i}"` : `${f}'`;
  };
  const dimensions =
    `${asFeet(rawWidth)} × ${asFeet(rawLength)}` + (altLength ? `/${altLength}'` : "");

  return { widthFt, lengthFt, dimensions };
}

/* Pleasant Valley files every plan under an architectural collection. The
   first match wins, so the specific lines beat the generic shapes. */
const PV_SERIES = [
  "Main Street",
  "Cabin/Chalet",
  "Galley-Hearth",
  "L-Hearth",
  "Coastal",
  "Leisure",
  "Two-Story",
  "Cape",
  "Ranch",
  "Multi",
];

const PV_STYLE = {
  Ranch: "ranch",
  Cape: "farmhouse",
  Coastal: "coastal",
  "Cabin/Chalet": "lodge",
  Leisure: "lodge",
  "Two-Story": "farmhouse",
};

function seriesFor(source, item) {
  if (source.key === "pv") {
    const cats = item.categories ?? [];
    if (cats.includes("adu")) return "ADU";
    const hit = PV_SERIES.find((s) => cats.includes(s));
    return hit === "Multi" ? "Multi-Family" : hit;
  }
  /* NETR is Pine Grove's northern-states specification and the one that
     matters in Maine, so it is a series in its own right rather than a prefix
     buried in the model code. */
  if (/^NETR\b/i.test(item.title)) return "NETR";
  return source.collection;
}

function styleFor(source, item) {
  if (source.key === "pv") {
    const hit = PV_SERIES.find((s) => (item.categories ?? []).includes(s));
    return PV_STYLE[hit];
  }
  return source.collection === "Ranch" ? "ranch" : undefined;
}

/**
 * The image URL to actually download for an item.
 *
 * Squarespace gives some products an `assetUrl` on `static1.squarespace.com`
 * with no filename on the end. That URL resolves — with a 200, which is the
 * trap — to a blank white placeholder rather than the product image, and it
 * silently produced 89 empty floor plans before this existed. The real file
 * is on `images.squarespace-cdn.com`, either as the main asset or on the
 * item's first child.
 */
function pickAsset(item) {
  const cdn = (u) => typeof u === "string" && u.includes("images.squarespace-cdn.com");
  if (cdn(item.assetUrl)) return item.assetUrl;
  return (item.items ?? []).map((i) => i.assetUrl).find(cdn) ?? item.assetUrl;
}

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** One source record to one catalogue entry, or null when it cannot be read. */
function toEntry(source, item) {
  const text = strip(item.excerpt);
  const specs = parseSpecs(text);

  /* A listing with no bedroom count, bathroom count or footprint is not a
     listing. Rather than filling the hole, the home is skipped and reported. */
  if (!specs.sqft || !specs.beds || specs.baths === undefined) return null;

  const dims = parseDimensions(text, item.categories);
  const title = strip(item.title);

  /* The manufacturer's own prose, where there is any. Pleasant Valley writes a
     paragraph per plan; Pine Grove writes only the spec line, which is already
     rendered as specs and would read as filler repeated back as a story. */
  const prose = text
    .replace(/\[?\s*(floor plan pdf|home sales sheet)\s*\(?pdf\)?\s*\]?/gi, "")
    .replace(/^[^|]*\|[^|]*\|[^|]*(sq\.?\s*ft\.?)/i, "")
    .trim();

  return {
    slug: slugify(title),
    name: title,
    builder: source.builder,
    construction: source.construction,
    series: seriesFor(source, item),
    model: source.key === "pv" ? undefined : title,
    beds: specs.beds,
    baths: specs.baths,
    sqft: specs.sqft,
    sections: source.sections,
    widthFt: dims.widthFt,
    lengthFt: dims.lengthFt,
    dimensions: dims.dimensions,
    style: styleFor(source, item),
    story: prose.length > 80 ? [prose] : undefined,
    sourceUrl: new URL(item.fullUrl, source.url).href,
    /* Carried for the photos command, stripped before the file is written. */
    _asset: pickAsset(item),
    _sourceKey: source.key,
  };
}

async function entries() {
  const out = [];
  const skipped = [];
  for (const source of SOURCES) {
    for (const item of await collection(source)) {
      if (source.key === "pv" && isLakeSeries(item.title)) continue;
      const entry = toEntry(source, item);
      if (entry) out.push(entry);
      else skipped.push(`${source.key}: ${strip(item.title)}`);
    }
  }

  /* Two collections can carry the same model code. Keep the first and report
     the clash rather than writing a duplicate slug the router cannot resolve. */
  const seen = new Map();
  const unique = [];
  for (const e of out) {
    if (seen.has(e.slug)) {
      skipped.push(`duplicate slug ${e.slug} (${e.name})`);
      continue;
    }
    seen.set(e.slug, e);
    unique.push(e);
  }
  return { entries: unique, skipped };
}

/* ------------------------------------------------------------------ *
 * Writing the catalogue
 * ------------------------------------------------------------------ */

const lit = (v) => JSON.stringify(v);

/**
 * The scenes a listing declares, read from the photographs really on disk.
 *
 * Derived rather than declared, because a scene without a photograph behind
 * it renders as the "photograph to come" plate — so declaring five scenes for
 * a home with one picture would print four apologies. A home with no
 * photographs at all still declares a single exterior, which is that one
 * honest plate.
 */
function scenesFor(entry) {
  const dir = path.join(OUT_PHOTOS, entry.slug);
  const found = existsSync(dir)
    ? SCENE_ORDER.filter((kind) => existsSync(path.join(dir, `${kind}.webp`)))
    : [];

  if (found.length === 0) {
    return [{ kind: "exterior", caption: `${entry.name} — front elevation` }];
  }
  return found.map((kind) => ({ kind, caption: SCENE_CAPTIONS[kind] }));
}

function serialise(e, hasPlan) {
  const rows = [
    `slug: ${lit(e.slug)}`,
    `name: ${lit(e.name)}`,
    `builder: ${lit(e.builder)}`,
    `construction: ${lit(e.construction)}`,
    e.series && `series: ${lit(e.series)}`,
    e.model && `model: ${lit(e.model)}`,
    `beds: ${e.beds}`,
    `baths: ${e.baths}`,
    `sqft: ${e.sqft}`,
    e.sections && `sections: ${lit(e.sections)}`,
    e.widthFt && `widthFt: ${e.widthFt}`,
    e.lengthFt && `lengthFt: ${e.lengthFt}`,
    e.dimensions && `dimensions: ${lit(e.dimensions)}`,
    e.style && `style: ${lit(e.style)}`,
    hasPlan && `planImage: ${lit(`/photos/plans/${e.slug}.webp`)}`,
    e.story && `story: [${e.story.map(lit).join(", ")}]`,
    `scenes: [${scenesFor(e)
      .map((s) => `{ kind: ${lit(s.kind)}, caption: ${lit(s.caption)} }`)
      .join(", ")}]`,
    `sourceUrl: ${lit(e.sourceUrl)}`,
  ].filter(Boolean);
  return `  {\n${rows.map((r) => `    ${r},`).join("\n")}\n  },`;
}

async function writeHomes() {
  const { entries: list, skipped } = await entries();

  const header = `/**
 * THE IMPORTED CATALOGUE — GENERATED FILE, DO NOT EDIT BY HAND.
 *
 * Written by \`node scripts/import-manufacturers.mjs homes\` from the two
 * manufacturers NERTO retails. Every figure below was read from the model
 * page named in its \`sourceUrl\` and can be checked against it in one click.
 *
 * Anything a human decides — what is standing on the lot, what is featured,
 * what is sold — is NOT in here. That lives in \`lotState\` in
 * \`lib/homes.ts\`, which is applied over this file, so re-running the import
 * never overwrites it.
 *
 * ${list.length} plans: ${SOURCES.map(
   (s) => `${list.filter((e) => e._sourceKey === s.key).length} ${s.key}`,
 ).join(", ")}.
 *
 * No prices. Neither manufacturer publishes one — a home is quoted on
 * options, site work and delivery distance — so the site says "call for
 * pricing" everywhere a price would go, rather than inventing a figure.
 */
import type { CatalogueEntry } from "./homes";

export const catalogue: CatalogueEntry[] = [
`;

  const body = list
    .map((e) =>
      /* A drawing is claimed when, and only when, the file is really on
         disk — true of Pine Grove's lead image and of whatever Pleasant
         Valley plan drawings `photos` could identify. */
      serialise(e, existsSync(path.join(OUT_PLANS, `${e.slug}.webp`))),
    )
    .join("\n");

  await writeFile(OUT_TS, `${header}${body}\n];\n`);
  console.log(`wrote ${OUT_TS}: ${list.length} plans`);
  if (skipped.length) console.log(`skipped ${skipped.length}:\n  ${skipped.join("\n  ")}`);
}

/* ------------------------------------------------------------------ *
 * Photos
 * ------------------------------------------------------------------ */

async function download(url) {
  const res = await fetch(`${url}?format=1500w`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

/** A rendering or photograph: cropped to the gallery's 4:3 and web-sized. */
async function writePhoto(buf, file) {
  await mkdir(path.dirname(file), { recursive: true });
  await sharp(buf).resize(1600, 1200, { fit: "cover" }).webp({ quality: 78 }).toFile(file);
}

/** A floor-plan drawing: never cropped, and kept on white rather than filled. */
async function writePlan(buf, file) {
  await mkdir(path.dirname(file), { recursive: true });
  await sharp(buf)
    .resize(1600, 1200, { fit: "contain", background: "#ffffff" })
    .flatten({ background: "#ffffff" })
    .webp({ quality: 82 })
    .toFile(file);
}

/**
 * Every photograph on a gallery page, in page order, with its filename.
 *
 * Squarespace emits each gallery image twice (once for the lightbox), so the
 * list is de-duplicated on URL while keeping first-seen order — order is the
 * only signal in a shoot whose filenames are camera serials.
 */
async function galleryImages(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();

  const seen = new Map();
  for (const m of html.matchAll(
    /<img\b[^>]*?(?:data-src|src)="(https:\/\/images\.squarespace-cdn\.com\/content\/v1\/[^"?]+)"[^>]*>/g,
  )) {
    const url = m[1];
    if (/favicon|logo/i.test(url)) continue;
    const alt = m[0].match(/\balt="([^"]*)"/)?.[1] ?? "";
    /* Keep the richer alt if the second copy of the image carries one. */
    if (!seen.has(url) || (!seen.get(url).alt && alt)) seen.set(url, { url, alt });
  }
  return [...seen.values()];
}

/** Gallery pages on Pine Grove's site, from its sitemap. */
async function galleryUrls() {
  return cached("galleries.json", async () => {
    const res = await fetch(SITEMAP);
    if (!res.ok) throw new Error(`sitemap: HTTP ${res.status}`);
    const xml = await res.text();
    return [...xml.matchAll(/<loc>([^<]*gallery[^<]*)<\/loc>/gi)].map((m) => m[1]);
  });
}

/**
 * Pair each Pine Grove listing with its gallery, newest shoot first.
 *
 * A gallery that matches no listing is ignored rather than forced onto the
 * nearest model — Pine Grove keeps shoots for plans it has since dropped, and
 * those are not homes NERTO can sell.
 */
async function matchGalleries(list) {
  const byKey = new Map();
  for (const url of await galleryUrls()) {
    const slug = url.split("/").pop();
    const key = galleryKey(slug);
    if (!key) continue;
    const id = `${key.netr}:${key.prefix}:${key.digits}`;
    const year = galleryYear(slug);
    if (!byKey.has(id) || byKey.get(id).year < year) byKey.set(id, { url, year });
  }

  const pairs = [];
  for (const entry of list) {
    if (entry._sourceKey === "pv") continue;
    const key = galleryKey(entry.slug);
    if (!key) continue;
    /* Exact prefix first; then allow a gallery that omitted the letter
       prefix ("netr3157" for "netr-g-3157"), which Pine Grove sometimes does.
       The NETR flag is never relaxed. */
    const hit =
      byKey.get(`${key.netr}:${key.prefix}:${key.digits}`) ??
      byKey.get(`${key.netr}::${key.digits}`);
    if (hit) pairs.push({ entry, url: hit.url, digits: key.digits });
  }
  return pairs;
}

/* ------------------------------------------------------------------ *
 * Pleasant Valley's floor-plan drawings
 *
 * Pleasant Valley leads each model with an exterior rendering, not with the
 * plan, so the plan — where the model page carries one — is further down the
 * page: another image in the item's gallery, or one dropped into the body
 * copy. The collection listing does not carry those, so each model page is
 * read on its own (and cached like everything else here).
 *
 * Which of those images IS the plan is decided by the filename and nothing
 * else. Squarespace keeps the uploaded filename in the URL, and Pleasant
 * Valley's drawings are named for what they are — "…-floor-plan.jpg",
 * "…-FP.png". An image that does not say so is left alone: publishing an
 * interior rendering captioned as a floor plan would be worse than
 * publishing no plan at all, which the listing page already handles.
 *
 * Some models publish the plan only as a PDF. Those are counted and reported,
 * never converted — a PDF is not an image and guessing at a page of one is
 * how you end up with a blank plate.
 * ------------------------------------------------------------------ */

const CDN = "images.squarespace-cdn.com";

/** Filenames that say, in the manufacturer's own words, "this is the plan". */
const PLAN_NAME = /floor[\s._%-]*plan|[-_/]fp[-_.\d]|[-_]fp$|[-_.]plan[-_.]/i;

const saysPlan = (image) =>
  PLAN_NAME.test(safeDecode(image.url)) || PLAN_NAME.test(image.alt ?? "");

function safeDecode(url) {
  try {
    return decodeURIComponent(url);
  } catch {
    return url;
  }
}

/** Every CDN image a model page record carries, in page order, de-duplicated. */
function itemImages(item) {
  const seen = new Map();
  const push = (url, alt) => {
    if (typeof url !== "string" || !url.includes(CDN)) return;
    const bare = url.split("?")[0];
    if (!seen.has(bare)) seen.set(bare, { url: bare, alt: alt ?? "" });
  };

  push(item.assetUrl, item.filename ?? item.title);
  for (const child of item.items ?? []) push(child.assetUrl, child.filename ?? child.title);
  for (const m of String(item.body ?? "").matchAll(
    /https:\/\/images\.squarespace-cdn\.com\/content\/v1\/[^"'?\s<>\\]+/g,
  )) {
    push(m[0], "");
  }
  return [...seen.values()];
}

/** The model page's own record, which carries the gallery the listing lacks. */
async function pvItem(entry) {
  return cached(`pv-model/${entry.slug}.json`, async () => {
    const res = await fetch(`${entry.sourceUrl}?format=json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = await res.json();
    return body.item ?? body;
  });
}

/** Does the page link a plan we cannot read — a PDF rather than an image? */
const linksPlanPdf = (item) =>
  [...String(item.body ?? "").matchAll(/href="([^"]+\.pdf)"/gi)].some(([, href]) =>
    PLAN_NAME.test(safeDecode(href)),
  );

/**
 * Import the plan drawing for every Pleasant Valley model that publishes one.
 *
 * Resumable in the same way as the rest of `photos`: a drawing already on
 * disk is never re-fetched, so delete the file to force a refresh.
 */
async function pvPlans(list) {
  const pv = list.filter((e) => e._sourceKey === "pv");
  let written = 0;
  let already = 0;
  let pdfOnly = 0;
  let none = 0;

  for (const entry of pv) {
    const file = path.join(OUT_PLANS, `${entry.slug}.webp`);
    if (existsSync(file)) {
      already++;
      continue;
    }
    try {
      const item = await pvItem(entry);
      const plan = itemImages(item).find(saysPlan);
      if (!plan) {
        if (linksPlanPdf(item)) pdfOnly++;
        else none++;
        continue;
      }
      await writePlan(await download(plan.url), file);
      written++;
    } catch (err) {
      console.warn(`  ! plan ${entry.slug}: ${err.message}`);
    }
  }

  console.log(
    `  Pleasant Valley plans: ${written} written, ${already} already on disk, ` +
      `${pdfOnly} published as PDF only, ${none} with no drawing on the page`,
  );
}

async function photos() {
  const { entries: list } = await entries();
  let plans = 0;
  let exteriors = 0;

  for (const e of list) {
    /* Resumable: an image already on disk is never re-fetched, so a run that
       dies half way through picks up where it stopped. Delete the file to
       force a refresh. */
    const target =
      e._sourceKey === "pv"
        ? path.join(OUT_PHOTOS, e.slug, "exterior.webp")
        : path.join(OUT_PLANS, `${e.slug}.webp`);
    if (existsSync(target)) {
      if (e._sourceKey === "pv") exteriors++;
      else plans++;
      continue;
    }
    try {
      const buf = await download(e._asset);
      if (e._sourceKey === "pv") {
        /* An exterior rendering — the home's cover image. */
        await writePhoto(buf, path.join(OUT_PHOTOS, e.slug, "exterior.webp"));
        exteriors++;
      } else {
        /* A floor-plan drawing — kept as a drawing, in its own directory. */
        await writePlan(buf, path.join(OUT_PLANS, `${e.slug}.webp`));
        plans++;
      }
    } catch (err) {
      console.warn(`  ! ${e.slug}: ${err.message}`);
    }
  }
  console.log(`${exteriors} exterior renderings, ${plans} floor-plan drawings`);

  await pvPlans(list);
  await galleries(list);
}

/**
 * Pine Grove's model-home photography, matched to the plans NERTO sells.
 *
 * Three grades of source, handled differently because they carry different
 * amounts of truth:
 *
 *   Hand-tagged (`ON_LOT_SCENES`) wins outright.
 *   Named rooms in the filename are classified exactly, one photograph per
 *   scene, first match wins so the opening shot of a room is the one used.
 *   Camera serials say nothing about the room, so only the first photograph
 *   is taken, as the exterior — every shoot in this catalogue opens on the
 *   front of the house, and inventing a caption for the rest would be
 *   labelling a picture we have not looked at.
 */
async function galleries(list) {
  const pairs = await matchGalleries(list);
  console.log(`${pairs.length} of ${list.length} plans have a Pine Grove gallery`);

  let tagged = 0;
  let firstOnly = 0;
  let rejected = 0;
  let written = 0;

  for (const { entry, url, digits } of pairs) {
    try {
      const images = await cached(
        `gallery/${entry.slug}.json`,
        async () => await galleryImages(url),
      );
      if (images.length === 0) continue;

      if (!verifyGallery(images, digits)) {
        console.warn(`  ! ${entry.slug}: ${url} pictures another model — skipped`);
        rejected++;
        continue;
      }

      /* Which image fills which scene. */
      const chosen = {};
      const manual = ON_LOT_SCENES[entry.slug];
      if (manual) {
        for (const [kind, i] of Object.entries(manual)) if (images[i]) chosen[kind] = images[i];
        tagged++;
      } else {
        for (const image of images) {
          const kind = sceneOf(image.alt);
          if (kind && !chosen[kind]) chosen[kind] = image;
        }
        if (Object.keys(chosen).length > 0) {
          tagged++;
        } else {
          chosen.exterior = images[0];
          firstOnly++;
        }
      }

      for (const [kind, image] of Object.entries(chosen)) {
        const file = path.join(OUT_PHOTOS, entry.slug, `${kind}.webp`);
        if (existsSync(file)) continue;
        await writePhoto(await download(image.url), file);
        written++;
      }

      /* The whole shoot, cached small, so a human can re-tag it by eye and
         write the result into ON_LOT_SCENES. Opt-in (`photos --sheets`)
         because it is another ~1,800 downloads for something only wanted
         when somebody is actually re-tagging. */
      if (WANT_SHEETS) {
        for (const [i, image] of images.slice(0, 24).entries()) {
          const file = path.join(
            CACHE,
            "gallery",
            entry.slug,
            `${String(i).padStart(2, "0")}.webp`,
          );
          if (existsSync(file)) continue;
          await mkdir(path.dirname(file), { recursive: true });
          await sharp(await download(image.url)).resize(900).webp({ quality: 70 }).toFile(file);
        }
      }
    } catch (err) {
      console.warn(`  ! gallery ${entry.slug}: ${err.message}`);
    }
  }

  console.log(
    `  ${tagged} galleries scene-tagged, ${firstOnly} exterior-only, ` +
      `${rejected} rejected as another model, ${written} photographs written`,
  );
}

/* ------------------------------------------------------------------ */

/**
 * The photo manifest for imported homes, read off what is actually on disk.
 *
 * Generated rather than hand-written because there are hundreds of keys and
 * because a key without a file behind it renders the "photograph to come"
 * plate — so the manifest must never claim more than `public/` holds. Page
 * heroes and one-offs stay hand-written in `lib/photos.ts`.
 */
async function writeManifest() {
  const { entries: list } = await entries();
  const rows = [];
  for (const e of list) {
    const dir = path.join(OUT_PHOTOS, e.slug);
    if (!existsSync(dir)) continue;
    for (const kind of SCENE_ORDER) {
      if (existsSync(path.join(dir, `${kind}.webp`)))
        rows.push(`  ${lit(`${e.slug}/${kind}`)}: ${lit(`/photos/homes/${e.slug}/${kind}.webp`)},`);
    }
  }
  const header = `/**
 * PHOTOGRAPHS OF IMPORTED HOMES — GENERATED FILE, DO NOT EDIT BY HAND.
 *
 * Written by \`node scripts/import-manufacturers.mjs manifest\` from what is
 * really in \`public/photos/homes/\`, so a key here always has a file behind
 * it. Page heroes and one-off images are hand-written in \`lib/photos.ts\`.
 *
 * ${rows.length} photographs. Two kinds, and they are not equally true:
 *
 *   Pleasant Valley's exterior RENDERINGS, one per modular plan. A rendering
 *   is a drawing of a house that has not been built on your lot yet.
 *
 *   Pine Grove's photographs of the four models NERTO keeps on its lot —
 *   photographs of that model at Pine Grove, not of the particular house on
 *   River Road.
 *
 * Neither is a photograph of NERTO's yard. Photograph the lot, drop the files
 * in over these, and delete the photography note in
 * \`components/site-footer.tsx\`.
 */

export const importedPhotos: Record<string, string> = {
`;
  await writeFile("lib/photos.generated.ts", `${header}${rows.join("\n")}\n};\n`);
  console.log(`wrote lib/photos.generated.ts: ${rows.length} photographs`);
}

const command = process.argv[2];
if (command === "fetch") {
  for (const s of SOURCES) console.log(s.key, (await collection(s)).length);
} else if (command === "homes") {
  await writeHomes();
} else if (command === "photos") {
  await photos();
} else if (command === "manifest") {
  await writeManifest();
} else {
  console.error("usage: import-manufacturers.mjs fetch|homes|photos|manifest");
  process.exit(1);
}

/**
 * Import the catalogue from the two manufacturers NERTO retails.
 *
 *   node scripts/import-manufacturers.mjs fetch    # cache the source JSON
 *   node scripts/import-manufacturers.mjs homes    # write lib/catalogue.generated.ts
 *   node scripts/import-manufacturers.mjs photos   # download + resize model imagery
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
 *   as `planImage` — a labelled drawing, never as a photograph.
 *   Pleasant Valley leads each model with an exterior RENDERING. That is
 *   imported as the home's exterior scene.
 *   Real photographs exist only in Pine Grove's per-model gallery pages, and
 *   only the homes standing on NERTO's own lot have those imported (see
 *   ON_LOT_GALLERIES) — a rendering is not a photograph of a house.
 */
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const CACHE = ".cache/manufacturers";
const OUT_PHOTOS = "public/photos/homes";
const OUT_PLANS = "public/photos/plans";
const OUT_TS = "lib/catalogue.generated.ts";

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
 * Pine Grove gallery pages for the homes standing on NERTO's lot. These are
 * the only real photographs in the import; every other model carries a
 * drawing or a rendering, and says so.
 *
 * They are Pine Grove's photographs of that model, not photographs of the
 * particular house on River Road, so the captions stay generic and the
 * photography note in `components/site-footer.tsx` still applies. Replace
 * them with NERTO's own shots of its own homes when there are some.
 *
 * NETR G-3465 is absent because Pine Grove publishes no gallery for it —
 * see the note beside `lotState` in `lib/homes.ts` about which 3465 this is.
 */
const ON_LOT_GALLERIES = {
  "netr-g-3157": "https://www.pinegrovehomes.com/netr-g3157-gallery",
  "zk-1100": "https://www.pinegrovehomes.com/zk1100-gallery",
  "g-3002": "https://www.pinegrovehomes.com/g3002-gallery",
};

/**
 * Which gallery image fills which scene, read off the contact sheets the
 * `photos` command writes into `.cache/`. Indices are into the ordered image
 * list for that gallery.
 *
 * A scene is listed only where a photograph of it exists: NETR G-3157's
 * gallery has no bedroom in it, so that home has no bedroom scene and the
 * site shows one fewer picture rather than a bedroom from another house.
 * ZK-1100's exterior is index 2 — a plain photograph of the home — in
 * preference to the dusk shot at index 0, which is a rendering.
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
  await mkdir(CACHE, { recursive: true });
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
    _asset: item.assetUrl,
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
 * The scenes a listing declares.
 *
 * A lot home declares the scenes its gallery actually has photographs for.
 * Everything else declares one exterior, which resolves to the "photograph to
 * come" plate — the honest state for a plan nobody has photographed yet.
 */
function scenesFor(entry, hasExterior) {
  const curated = ON_LOT_SCENES[entry.slug];
  if (curated) {
    return SCENE_ORDER.filter((k) => k in curated).map((kind) => ({
      kind,
      caption: SCENE_CAPTIONS[kind],
    }));
  }
  return [
    {
      kind: "exterior",
      caption: hasExterior ? "Front elevation" : `${entry.name} — front elevation`,
    },
  ];
}

function serialise(e, hasPlan, hasExterior) {
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
    `scenes: [${scenesFor(e, hasExterior)
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
      serialise(
        e,
        e._sourceKey !== "pv" && existsSync(path.join(OUT_PLANS, `${e.slug}.webp`)),
        e._sourceKey === "pv" && existsSync(path.join(OUT_PHOTOS, e.slug, "exterior.webp")),
      ),
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

async function galleryImages(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  return [
    ...new Set(
      [...html.matchAll(/https:\/\/images\.squarespace-cdn\.com\/content\/v1\/[^"?\s]+/g)]
        .map((m) => m[0])
        .filter((u) => !/favicon|logo/i.test(u)),
    ),
  ];
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

  /* The lot homes, whose galleries hold real photographs of the real house. */
  for (const [slug, url] of Object.entries(ON_LOT_GALLERIES)) {
    try {
      const images = await galleryImages(url);
      await mkdir(path.join(CACHE, "gallery"), { recursive: true });
      await writeFile(
        path.join(CACHE, "gallery", `${slug}.json`),
        JSON.stringify(images, null, 2),
      );
      for (const [i, img] of images.slice(0, 24).entries()) {
        const file = path.join(CACHE, "gallery", slug, `${String(i).padStart(2, "0")}.webp`);
        await mkdir(path.dirname(file), { recursive: true });
        if (!existsSync(file)) {
          await sharp(await download(img)).resize(900).webp({ quality: 70 }).toFile(file);
        }
      }
      console.log(`  gallery ${slug}: ${images.length} images cached for scene tagging`);

      /* Install the tagged scenes. Until a slug appears in ON_LOT_SCENES the
         cache is all that is written, which is what the tagging pass reads. */
      for (const [kind, index] of Object.entries(ON_LOT_SCENES[slug] ?? {})) {
        const source = images[index];
        if (!source) {
          console.warn(`  ! ${slug}/${kind}: no image at index ${index}`);
          continue;
        }
        await writePhoto(await download(source), path.join(OUT_PHOTOS, slug, `${kind}.webp`));
      }
    } catch (err) {
      console.warn(`  ! gallery ${slug}: ${err.message}`);
    }
  }
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

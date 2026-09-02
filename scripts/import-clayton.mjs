/**
 * Pull model photography from Clayton's own model pages onto the listings.
 *
 *   node scripts/import-clayton.mjs list             # what it will fetch, and from where
 *   node scripts/import-clayton.mjs sheets [offset] [slug,slug]
 *   node scripts/import-clayton.mjs photos           # download the chosen scenes
 *   node scripts/import-clayton.mjs register         # rewrite lib/photos.ts from disk
 *
 * Every listing in `lib/homes.ts` already carries the `sourceUrl` it was read
 * from, so nothing here needs a second list of URLs: this walks the catalogue,
 * fetches each source page, and collects the photographs on it.
 *
 * Which photograph is the kitchen is not something a script can know, so this
 * follows the same human-in-the-loop shape as the West Gate importer: `sheets`
 * writes a numbered contact sheet per home, you record the indices you want in
 * `scripts/clayton-selection.json`, and `photos` downloads exactly those.
 *
 *   { "elation": { "scenes": { "exterior": 0, "kitchen": 4, "bedroom": 7 } } }
 *
 * `register` needs no network at all: it rewrites the `photos` map in
 * `lib/photos.ts` from whatever is actually under `public/photos/`, so it also
 * wires up images you saved by hand.
 *
 * One caution the code cannot enforce: these are Clayton's photographs. Using
 * them on a dealership site is normally a matter of the retail agreement, and
 * a demonstration site is not that. Check before publishing.
 */
import { mkdir, readFile, writeFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const HOMES = "lib/homes.ts";
const PHOTOS_TS = "lib/photos.ts";
const OUT_PHOTOS = "public/photos/homes";
const OUT_SHEETS = ".cache/clayton-sheets";
const SELECTION_FILE = "scripts/clayton-selection.json";

/** Anything that is plainly furniture rather than a photograph of a home. */
const NOT_A_PHOTO = /logo|icon|sprite|favicon|placeholder|badge|avatar|pixel/i;

const selection = existsSync(SELECTION_FILE)
  ? JSON.parse(await readFile(SELECTION_FILE, "utf8"))
  : {};

/* ------------------------------------------------------------------ *
 * The catalogue, read out of the TypeScript rather than imported
 * ------------------------------------------------------------------ */

/** slug, name, sourceUrl and scene kinds for every listing. */
async function catalogue() {
  const src = await readFile(HOMES, "utf8");
  const body = src.slice(src.indexOf("export const listings"), src.indexOf("\n];", src.indexOf("export const listings")));
  return body
    .split(/\n  \{\n/)
    .slice(1)
    .map((block) => ({
      slug: block.match(/slug: "([^"]+)"/)?.[1],
      name: block.match(/name: "([^"]+)"/)?.[1],
      sourceUrl: block.match(/sourceUrl:\s*\n?\s*"([^"]+)"/)?.[1],
      kinds: [...block.matchAll(/\["(exterior|living|kitchen|bedroom|bath|porch)",/g)].map((m) => m[1]),
    }))
    .filter((l) => l.slug);
}

/** Photographs on a model page, in the order they appear. */
async function imagesOn(pageUrl) {
  const res = await fetch(pageUrl, { headers: { "user-agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(`${res.status} ${pageUrl}`);
  const html = await res.text();

  const seen = new Set();
  const images = [];
  /* Gallery URLs turn up in markup and in embedded JSON alike, so this reads
     the whole document rather than trying to parse a gallery component. */
  for (const raw of html.match(/https?:\\?\/\\?\/[^\s"'<>\\]+\.(?:jpe?g|png|webp)/gi) ?? []) {
    const url = raw.replace(/\\/g, "");
    if (NOT_A_PHOTO.test(url) || seen.has(url)) continue;
    seen.add(url);
    images.push(url);
  }
  return images;
}

async function fetchBuf(url) {
  const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

/* ------------------------------------------------------------------ *
 * Commands
 * ------------------------------------------------------------------ */

async function list() {
  for (const l of await catalogue()) {
    const chosen = Object.keys(selection[l.slug]?.scenes ?? {}).length;
    console.log(
      `${l.slug.padEnd(22)} ${String(chosen || "—").padStart(2)} chosen  ${l.sourceUrl ?? "(no source)"}`,
    );
  }
}

/** A numbered 4-wide contact sheet per home, so scenes can be tagged by eye. */
async function sheets(offset = 0, only = null) {
  await mkdir(OUT_SHEETS, { recursive: true });
  for (const home of await catalogue()) {
    if (only && !only.includes(home.slug)) continue;
    if (!home.sourceUrl) continue;

    let found;
    try {
      found = await imagesOn(home.sourceUrl);
    } catch (err) {
      console.warn(`skip ${home.slug}: ${err.message}`);
      continue;
    }
    const take = found.slice(offset, offset + 16);
    if (take.length === 0) {
      console.warn(`skip ${home.slug}: no photographs found on ${home.sourceUrl}`);
      continue;
    }

    const [cw, ch, cols] = [400, 284, 4];
    const tiles = [];
    for (const [i, url] of take.entries()) {
      const img = await sharp(await fetchBuf(url))
        .resize(cw, ch, { fit: "cover" })
        .composite([{
          input: Buffer.from(
            `<svg width="${cw}" height="${ch}"><rect x="0" y="0" width="76" height="52" fill="#000c"/>` +
            `<text x="14" y="38" font-family="monospace" font-size="34" fill="#fff">${String(i + offset).padStart(2, "0")}</text></svg>`,
          ),
          top: 0, left: 0,
        }])
        .toBuffer();
      tiles.push({ input: img, top: Math.floor(i / cols) * ch, left: (i % cols) * cw });
    }

    await sharp({
      create: { width: cw * cols, height: ch * Math.ceil(take.length / cols), channels: 3, background: "#111" },
    })
      .composite(tiles)
      .jpeg({ quality: 82 })
      .toFile(path.join(OUT_SHEETS, `${home.slug}${offset ? `-${offset}` : ""}.jpg`));
    console.log(`sheet ${home.slug} (${take.length} of ${found.length} from ${offset})`);
  }
  console.log(`\nSheets in ${OUT_SHEETS}. Record the indices you want in ${SELECTION_FILE}.`);
}

/** Download the selected scenes and write them at web size. */
async function photos() {
  const homes = await catalogue();
  let written = 0;

  for (const [slug, sel] of Object.entries(selection)) {
    const home = homes.find((h) => h.slug === slug);
    if (!home?.sourceUrl) {
      console.warn(`skip ${slug}: not in the catalogue, or it has no sourceUrl`);
      continue;
    }
    const found = await imagesOn(home.sourceUrl);
    const dir = path.join(OUT_PHOTOS, slug);
    await mkdir(dir, { recursive: true });

    for (const [kind, index] of Object.entries(sel.scenes ?? {})) {
      const url = found[index];
      if (!url) {
        console.warn(`skip ${slug}/${kind}: no image at index ${index}`);
        continue;
      }
      await sharp(await fetchBuf(url))
        .resize(1600, null, { withoutEnlargement: true })
        .webp({ quality: 76 })
        .toFile(path.join(dir, `${kind}.webp`));
      written++;
    }
    console.log(`photos ${slug} (${Object.keys(sel.scenes ?? {}).length})`);
  }

  console.log(`\n${written} images written. Run \`register\` to wire them into ${PHOTOS_TS}.`);
}

/** Rewrite the photos map from what is on disk. Needs no network, so it also
 *  picks up images dropped in by hand. */
async function register() {
  const entries = [];
  if (existsSync(OUT_PHOTOS)) {
    for (const slug of (await readdir(OUT_PHOTOS, { withFileTypes: true })).filter((d) => d.isDirectory())) {
      const files = (await readdir(path.join(OUT_PHOTOS, slug.name))).filter((f) => /\.(webp|jpe?g)$/.test(f));
      for (const file of files.sort()) {
        entries.push([`${slug.name}/${path.parse(file).name}`, `/photos/homes/${slug.name}/${file}`]);
      }
    }
  }

  const src = await readFile(PHOTOS_TS, "utf8");

  /* Page heroes and community images are set by hand and point wherever
     their author aimed them, so they are carried across rather than dropped
     — as long as the file behind them is still on disk. */
  for (const [, key, value] of src.matchAll(/"((?:page|community)\/[^"]+)":\s*"([^"]+)"/g)) {
    if (existsSync(path.join("public", value.replace(/^\//, "")))) entries.push([key, value]);
  }

  const map = entries.length
    ? `{\n${entries.map(([k, v]) => `  "${k}": "${v}",`).join("\n")}\n}`
    : "{}";
  const MAP_DECL = /export const photos: Record<string, string> = \{[\s\S]*?\n?\};/;
  if (!MAP_DECL.test(src)) {
    console.error(`Could not find the photos map in ${PHOTOS_TS}. Nothing written.`);
    process.exit(1);
  }
  const next = src.replace(MAP_DECL, `export const photos: Record<string, string> = ${map};`);
  await writeFile(PHOTOS_TS, next);
  console.log(`${entries.length} keys written to ${PHOTOS_TS}`);
}

const cmd = process.argv[2];
if (cmd === "list") await list();
else if (cmd === "sheets") await sheets(Number(process.argv[3] ?? 0), process.argv[4]?.split(","));
else if (cmd === "photos") await photos();
else if (cmd === "register") await register();
else console.log("usage: node scripts/import-clayton.mjs list|sheets|photos|register");

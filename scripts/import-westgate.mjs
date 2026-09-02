/**
 * Import listings from West Gate Home Center's WordPress site.
 *
 *   node scripts/import-westgate.mjs sheets   # contact sheets, for scene tagging
 *   node scripts/import-westgate.mjs photos   # download + resize the chosen photos
 *
 * Their site exposes the WP REST API, so this reads structured JSON rather
 * than scraping markup: every home is a `project` post whose title carries
 * the specs ("Annabelle 4 Bed / 3 Bath 2,027 sq ft") and whose Divi content
 * embeds the gallery image URLs.
 *
 * What the source does NOT carry, and this script therefore never invents:
 * price, transport dimensions, section count, year, HERS index, floor-plan
 * geometry, or any prose description. Those stay undefined on the listing
 * and the site renders around them.
 */
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const API = "https://westgatehomecenter.com/wp-json/wp/v2/project";
const CACHE = ".cache/westgate-projects.json";
const OUT_PHOTOS = "public/photos/homes";
const OUT_SHEETS = ".cache/sheets";

/** The homes to import, and which gallery image fills each scene.
 *  Indices are into the home's ordered image list; they were read off the
 *  contact sheets produced by the `sheets` command. */
const SELECTION = JSON.parse(
  await readFile(new URL("./westgate-selection.json", import.meta.url), "utf8"),
);

async function projects() {
  if (existsSync(CACHE)) return JSON.parse(await readFile(CACHE, "utf8"));
  const all = [];
  for (let page = 1; ; page++) {
    const res = await fetch(`${API}?per_page=100&page=${page}`);
    if (!res.ok) break;
    const batch = await res.json();
    if (!Array.isArray(batch) || batch.length === 0) break;
    all.push(...batch);
    if (batch.length < 100) break;
  }
  await mkdir(path.dirname(CACHE), { recursive: true });
  await writeFile(CACHE, JSON.stringify(all));
  return all;
}

const strip = (s) => s.replace(/<[^>]+>/g, "").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(n)).replace(/&amp;/g, "&").trim();

/** Title → name, beds, baths, sqft. Their "sq ft" and "sq. ft." both occur. */
export function parseTitle(title) {
  const m = strip(title).match(/^(.*?)\s+(\d+)\s*Bed\s*\/\s*([\d.]+)\s*Bath\s+([\d,]+)\s*sq\.?\s*ft\.?$/i);
  if (!m) return null;
  return {
    name: m[1].trim(),
    beds: Number(m[2]),
    baths: Number(m[3]),
    sqft: Number(m[4].replace(/,/g, "")),
  };
}

/** Full-size gallery images in page order, plus the Matterport tour. */
function assets(content) {
  const seen = new Set();
  const images = [];
  for (const url of content.match(/https:\/\/westgatehomecenter\.com\/wp-content\/uploads\/[^\s"'\])]+?\.(?:jpg|jpeg|png)/gi) ?? []) {
    const full = url.replace(/-\d+x\d+(\.\w+)$/, "$1");
    if (!seen.has(full)) { seen.add(full); images.push(full); }
  }
  const tour = content.match(/https:\/\/my\.matterport\.com\/show\/\?m=[A-Za-z0-9]+/)?.[0];
  return { images, tour };
}

export async function catalogue() {
  const rows = [];
  for (const p of await projects()) {
    const specs = parseTitle(p.title.rendered);
    if (!specs) continue;
    rows.push({ sourceSlug: p.slug, ...specs, ...assets(p.content.rendered) });
  }
  return rows;
}

const thumb = (url) => url.replace(/(\.\w+)$/, "-400x284$1");

async function fetchBuf(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

/** A numbered 4-wide contact sheet per home, so scenes can be tagged by eye.
 *  Pass an offset to page through homes with more than 16 images. */
async function sheets(offset = 0, only = null) {
  await mkdir(OUT_SHEETS, { recursive: true });
  const rows = await catalogue();
  for (const key of Object.keys(SELECTION)) {
    if (only && !only.includes(key)) continue;
    const home = rows.find((r) => r.sourceSlug === SELECTION[key].sourceSlug);
    const take = home.images.slice(offset, offset + 16);
    if (take.length === 0) continue;
    const [cw, ch, cols] = [400, 284, 4];
    const tiles = await Promise.all(
      take.map(async (url, i) => {
        const img = await sharp(await fetchBuf(thumb(url)).catch(() => fetchBuf(url)))
          .resize(cw, ch, { fit: "cover" })
          .composite([{
            input: Buffer.from(
              `<svg width="${cw}" height="${ch}"><rect x="0" y="0" width="76" height="52" fill="#000c"/>` +
              `<text x="14" y="38" font-family="monospace" font-size="34" fill="#fff">${String(i + offset).padStart(2, "0")}</text></svg>`,
            ),
            top: 0, left: 0,
          }])
          .toBuffer();
        return { input: img, top: Math.floor(i / cols) * ch, left: (i % cols) * cw };
      }),
    );
    const rowsN = Math.ceil(take.length / cols);
    await sharp({ create: { width: cw * cols, height: ch * rowsN, channels: 3, background: "#111" } })
      .composite(tiles)
      .jpeg({ quality: 82 })
      .toFile(path.join(OUT_SHEETS, `${key}${offset ? `-${offset}` : ""}.jpg`));
    console.log(`sheet ${key} (${take.length} images from ${offset})`);
  }
}

/** Download the selected scenes and write them at web size. */
async function photos() {
  const rows = await catalogue();
  const manifest = {};
  for (const [slug, sel] of Object.entries(SELECTION)) {
    const home = rows.find((r) => r.sourceSlug === sel.sourceSlug);
    const dir = path.join(OUT_PHOTOS, slug);
    await mkdir(dir, { recursive: true });
    for (const [kind, index] of Object.entries(sel.scenes)) {
      const out = path.join(dir, `${kind}.webp`);
      await sharp(await fetchBuf(home.images[index]))
        .resize(1600, null, { withoutEnlargement: true })
        .webp({ quality: 76 })
        .toFile(out);
      manifest[`${slug}/${kind}`] = `/${path.relative("public", out)}`;
    }
    console.log(`photos ${slug} (${Object.keys(sel.scenes).length})`);
  }
  await writeFile(".cache/photo-manifest.json", JSON.stringify(manifest, null, 2));
  console.log(`\nmanifest entries written to .cache/photo-manifest.json`);
}

const cmd = process.argv[2];
if (cmd === "sheets") await sheets(Number(process.argv[3] ?? 0), process.argv[4]?.split(","));
else if (cmd === "photos") await photos();
else console.log("usage: node scripts/import-westgate.mjs sheets|photos");

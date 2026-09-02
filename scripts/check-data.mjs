/**
 * Cross-file data checks that TypeScript cannot make.
 *
 * The catalogue is generated from two manufacturers' live sites, and the
 * hand-maintained files point into it by slug — `lotState` in `lib/homes.ts`
 * says which plans are standing on the lot, a project says which plan it set,
 * a custom page says which series it narrows to. A slug is just a string, so
 * a model code that changes upstream would silently stop matching and the
 * site would quietly drop a home from the lot rather than failing.
 *
 * This is what catches that. It runs as part of `npm run lint`.
 *
 * Reading the TypeScript directly rather than importing it: these are data
 * files with no runtime behaviour, and a regex over them costs nothing next
 * to standing up a TS loader in a lint script.
 */
import { readFile } from "node:fs/promises";

const read = (f) => readFile(new URL(`../${f}`, import.meta.url), "utf8");

const problems = [];

const catalogue = await read("lib/catalogue.generated.ts");
const slugs = new Set([...catalogue.matchAll(/^\s{4}slug: "([^"]+)",$/gm)].map((m) => m[1]));
const seriesInUse = new Set(
  [...catalogue.matchAll(/^\s{4}series: "([^"]+)",$/gm)].map((m) => m[1]),
);

if (slugs.size === 0) {
  problems.push(
    "lib/catalogue.generated.ts holds no plans. Run `node scripts/import-manufacturers.mjs homes`.",
  );
}

/* `lotState` — what NERTO says is standing on River Road. A key that matches
   nothing means a home the site believes is on the lot and silently is not. */
const homes = await read("lib/homes.ts");
const lotBlock = homes.match(/const lotState[^=]*= \{([\s\S]*?)\n\};/)?.[1] ?? "";
for (const [, slug] of lotBlock.matchAll(/^\s*"([^"]+)":/gm)) {
  if (!slugs.has(slug)) {
    problems.push(
      `lib/homes.ts: lotState has "${slug}", which is not a plan in the catalogue. ` +
        `The model code may have changed upstream — check the manufacturer's site.`,
    );
  }
}

/* A project pointing at a plan we no longer carry. */
const projects = await read("lib/projects.ts");
for (const [, slug] of projects.matchAll(/homeSlug: "([^"]+)"/g)) {
  if (!slugs.has(slug)) {
    problems.push(
      `lib/projects.ts: homeSlug "${slug}" is not a plan in the catalogue. ` +
        `Drop the field — a project outlives the plan it set.`,
    );
  }
}

/* A campaign page narrowed to a series that no home is in renders empty. */
const custom = await read("lib/custom-pages.ts");
for (const [, series] of custom.matchAll(/series: "([^"]+)"/g)) {
  if (!seriesInUse.has(series)) {
    problems.push(
      `lib/custom-pages.ts: series "${series}" matches no home, so its page would be empty.`,
    );
  }
}

/* Every photograph the manifest claims has to exist, or the site shows a
   "photograph to come" plate where it promised a picture. */
const manifest = await read("lib/photos.generated.ts");
const { existsSync } = await import("node:fs");
for (const [, path] of manifest.matchAll(/: "(\/photos\/[^"]+)"/g)) {
  if (!existsSync(new URL(`../public${path}`, import.meta.url))) {
    problems.push(`lib/photos.generated.ts points at ${path}, which is not in public/.`);
  }
}

if (problems.length > 0) {
  console.error("check:data — problems found:\n");
  for (const p of problems) console.error(`  • ${p}`);
  console.error("");
  process.exit(1);
}

console.log(`check:data — clean. ${slugs.size} plans, all cross-references resolve.`);

/**
 * Report how much of the site's writing is still the template's own words.
 *
 *   npm run check:boilerplate            # what's still verbatim
 *   npm run check:boilerplate -- --save  # re-record the baseline (maintainers)
 *
 * This is the other half of `check-placeholders.mjs`. That one catches claims
 * that are *false* for a new dealership — an invented founder, a warranty
 * nobody offers. This one catches copy that is merely *identical*: the HUD
 * Code history, the financing explainers, the buyer's order of operations.
 * None of it is wrong. It is just the same on every site built from this
 * template, which is a problem of a different kind — two dealers in one
 * market with the same paragraphs, and search engines picking one of them to
 * rank for it.
 *
 * So the baseline records a hash of every passage the template ships with,
 * and this reports which of them a given deployment has not rewritten yet.
 * The target is not zero: some passages are load-bearing fact (the 1976 HUD
 * date, the chattel rate spread) and should survive in substance. It is the
 * *phrasing* that has to become this dealership's own — see the `voice`
 * skill, which does that pass page by page.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { extractProse } from "./lib/prose.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const BASELINE = join(root, "scripts", "boilerplate-baseline.json");

/* The files carrying editorial copy. The landing page's own writing lives in
   `components/landing.tsx` — `/` and every `/p/<slug>` render it — so that is
   the file scored here rather than the two-line route that calls it.
   Data-driven pages (`/listings`, `/communities`) differ per deployment
   already, because the catalogue does. */
const PAGES = [
  "components/landing.tsx",
  "app/why-manufactured/page.tsx",
  "app/start-here/page.tsx",
  "app/land-deals/page.tsx",
  "app/financing/page.tsx",
  "app/contact/page.tsx",
  "components/quote-form.tsx",
  "components/contact-band.tsx",
  "components/location-hours.tsx",
  "lib/faq.ts",
];

const hash = (s) => createHash("sha256").update(s).digest("hex").slice(0, 16);

const current = Object.fromEntries(
  PAGES.map((f) => [f, extractProse(readFileSync(join(root, f), "utf8"))]),
);

if (process.argv.includes("--save")) {
  const baseline = Object.fromEntries(
    Object.entries(current).map(([f, passages]) => [
      f,
      { words: passages.reduce((n, p) => n + p.split(" ").length, 0), hashes: passages.map(hash) },
    ]),
  );
  writeFileSync(BASELINE, JSON.stringify(baseline, null, 2) + "\n");
  console.log(`Baseline written: ${Object.values(baseline).reduce((n, p) => n + p.hashes.length, 0)} passages.`);
  process.exit(0);
}

if (!existsSync(BASELINE)) {
  console.error("No baseline. Run: npm run check:boilerplate -- --save");
  process.exit(1);
}
const baseline = JSON.parse(readFileSync(BASELINE, "utf8"));

let totalWords = 0;
let sameWords = 0;
const rows = [];

for (const [file, passages] of Object.entries(current)) {
  const shipped = new Set(baseline[file]?.hashes ?? []);
  const words = passages.reduce((n, p) => n + p.split(" ").length, 0);
  const same = passages.filter((p) => shipped.has(hash(p)));
  const sw = same.reduce((n, p) => n + p.split(" ").length, 0);
  totalWords += words;
  sameWords += sw;
  rows.push({ file, words, sameCount: same.length, total: passages.length, sw });
}

const pct = totalWords ? Math.round((sameWords / totalWords) * 100) : 0;

console.log("\ncheck:boilerplate — how much of this site is still the template's words\n");
for (const r of rows) {
  const p = r.words ? Math.round((r.sw / r.words) * 100) : 0;
  const bar = "█".repeat(Math.round(p / 5)).padEnd(20, "·");
  console.log(
    `  ${bar} ${String(p).padStart(3)}%  ${r.file.replace(/^app\/?/, "").replace(/\/?page\.tsx$/, "") || "/"}` +
      `  (${r.sameCount}/${r.total} passages, ${r.sw} words)`,
  );
}
console.log(`\n  ${pct}% of ${totalWords} words of editorial copy is unchanged template text.\n`);

if (pct >= 90) {
  console.log(
    "This is the template as shipped. Before selling this site to a second\n" +
      "dealership in the same market, run the `voice` skill — it rewrites these\n" +
      "pages in the client's own voice and localises them, keeping the locked\n" +
      "facts intact. Sameness here is not a legal problem the way a false claim\n" +
      "is; it is a competitive and search one.\n",
  );
}
process.exit(0);

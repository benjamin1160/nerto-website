/**
 * Fail the build if the template's fictional business is still on the site.
 *
 *   npm run check:placeholders
 *
 * The template ships as Hearthline Home Co. — an invented dealership with an
 * invented founder, an invented set crew and invented warranty terms (see the
 * headers of `lib/site.ts` and `lib/company.ts`). Every one of those is a
 * statement about a business, and none of them is true of whoever deploys
 * this next. Published unchanged they are not merely generic; they are false
 * claims about staff, trading history and what a price includes.
 *
 * So this walks the two identity files looking for values the template
 * shipped with, and decides what to do about them from `NEXT_PUBLIC_SITE_URL`:
 *
 *   unset, or a *.example.com host  →  the demo. Report and exit 0.
 *   any other host                  →  a real deployment. Exit 1.
 *
 * Fixing a finding means one of two things, and never a third: replace the
 * value with the client's own, or delete the field. Everything in
 * `lib/company.ts` is optional and every section that reads one disappears
 * when it is missing, so deleting is always available and always correct
 * where the business does not publish the fact. Do not invent a replacement.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

/* Literals the template ships with, by file. A match means the field was
   never touched — a real dealership does not coincidentally employ Ruth
   Okonjo-Vance or trade from a reserved fictional phone exchange. */
const PLACEHOLDERS = {
  "lib/site.ts": [
    ["Hearthline", "the template's fictional business name"],
    ["example.com", "the reserved placeholder domain"],
    ["555-01", "a reserved fictional phone exchange"],
    ["4820 Foothills Works Road", "the fictional lot address"],
  ],
  "lib/market.ts": [
    ['regionName: "East Tennessee"', "the template's own market name"],
  ],
  "lib/company.ts": [
    ["TN-MHD-0000000", "an invented dealer licence number"],
    ["Ruth Okonjo-Vance", "an invented member of staff"],
    ["Sam Petrosyan", "an invented member of staff"],
    ["Marta Lindqvist", "an invented member of staff"],
    ["Dev Raghunathan", "an invented member of staff"],
    ["She quit the plant because nobody believed the reports.", "an invented founding story"],
    ["founded: 1994", "an invented founding year"],
    ["four thousand", "an invented sales figure"],
    ["We do not subcontract the set", "an operating promise the client may not make"],
    ["transport within 150 miles", "a price inclusion the client may not offer"],
    ["10% at order, 40%", "a deposit schedule the client may not use"],
    ["warrantyMonths: 12", "a warranty term the client may not offer"],
    ["query=Hearthline", "a reviews link pointing at the fictional business"],
  ],
};

/* The header comments explain the placeholders, so they contain the same
   strings the check is hunting for. Skip block comments. */
const stripComments = (src) => src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
const isDemo = !siteUrl || /(^|\.)example\.com(\/|$|:)/.test(siteUrl);

const findings = [];
for (const [file, entries] of Object.entries(PLACEHOLDERS)) {
  const src = stripComments(readFileSync(join(root, file), "utf8"));
  for (const [needle, why] of entries) {
    if (src.includes(needle)) findings.push({ file, needle, why });
  }
}

if (findings.length === 0) {
  console.log("check:placeholders — clean. No template placeholders remain.");
  process.exit(0);
}

const label = isDemo ? "NOTE" : "ERROR";
console.log(
  `\ncheck:placeholders — ${findings.length} placeholder${findings.length === 1 ? "" : "s"} still on the site:\n`,
);
for (const { file, needle, why } of findings) {
  console.log(`  ${label}  ${file}: "${needle}" — ${why}`);
}

if (isDemo) {
  console.log(
    "\nNEXT_PUBLIC_SITE_URL is unset or points at example.com, so this is the" +
      "\ntemplate demonstrating itself and the above is expected.\n" +
      "\nBefore this goes live for a real dealership, replace each value with" +
      "\ntheirs or delete the field. Deleting is not a downgrade: every field in" +
      "\nlib/company.ts is optional and its section hides when absent, so a" +
      "\nshorter page is the right answer wherever the business does not" +
      "\npublish the fact.\n",
  );
  process.exit(0);
}

console.error(
  `\nNEXT_PUBLIC_SITE_URL is ${siteUrl}, so this is a real deployment carrying` +
    "\nthe template's fictional business. Replace each value above with the" +
    "\nclient's own, or delete the field — every field in lib/company.ts is" +
    "\noptional and its section hides when absent. Do not invent a replacement.\n",
);
process.exit(1);

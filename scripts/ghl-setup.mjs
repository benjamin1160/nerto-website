/**
 * Creates this site's fields in a GoHighLevel sub-account.
 *
 *   node scripts/ghl-setup.mjs check     # what exists, what is missing
 *   node scripts/ghl-setup.mjs fields    # create the missing contact fields
 *   node scripts/ghl-setup.mjs values    # write the location's custom values
 *   node scripts/ghl-setup.mjs all       # both, after `check`
 *
 * It reads two variables and refuses to run without them:
 *
 *   GHL_API_TOKEN     A Private Integration Token (`pit-…`) or a sub-account
 *                     access token, with these scopes:
 *                       locations/customFields.readonly
 *                       locations/customFields.write
 *                       locations/customValues.readonly
 *                       locations/customValues.write
 *                     The site itself additionally wants contacts.write,
 *                     contacts.readonly and — only if you set a pipeline —
 *                     opportunities.write.
 *   GHL_LOCATION_ID   The sub-account these fields belong to.
 *
 * Everything it creates is defined in `lib/ghl/fields.ts` and
 * `lib/ghl/custom-values.ts` — this file is the hands, not the list.
 *
 * It is safe to run twice. A field whose key or name already exists is left
 * alone and reported as `kept`, never duplicated and never overwritten: the
 * CRM's copy is the live one and a script has no business editing a label
 * somebody changed on purpose. Custom VALUES are the exception — they are
 * this site's own facts, so a changed phone number is written over the old
 * one, which is the entire reason to run `values` a second time.
 */
import { CONTACT_FIELDS } from "../lib/ghl/fields.ts";
import { customValues } from "../lib/ghl/custom-values.ts";
import { site } from "../lib/site.ts";

const BASE = "https://services.leadconnectorhq.com";
const VERSION = process.env.GHL_API_VERSION?.trim() || "2021-07-28";
const TOKEN = process.env.GHL_API_TOKEN?.trim();
const LOCATION = process.env.GHL_LOCATION_ID?.trim();

const command = process.argv[2] ?? "check";
const DRY = process.argv.includes("--dry-run");

if (!TOKEN || !LOCATION) {
  console.error(
    "GHL_API_TOKEN and GHL_LOCATION_ID must both be set.\n" +
      "Put them in .env.local (see .env.example) and run with:\n" +
      "  set -a && . ./.env.local && set +a && node scripts/ghl-setup.mjs check",
  );
  process.exit(1);
}

async function api(path, init = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Version: VERSION,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  let body = {};
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = { raw: text };
  }
  if (!res.ok) {
    const err = new Error(`${res.status} ${text.slice(0, 400)}`);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body;
}

/* ------------------------------------------------------------------ *
 * Reading what is already there
 * ------------------------------------------------------------------ */

async function existingFields() {
  const body = await api(`/locations/${LOCATION}/customFields?model=contact`);
  return body.customFields ?? [];
}

async function existingValues() {
  const body = await api(`/locations/${LOCATION}/customValues`);
  return body.customValues ?? [];
}

/** A field already there, matched on its key first and its label second. */
function match(remote, def) {
  const key = def.fieldKey.toLowerCase();
  const byKey = remote.find(
    (f) => (f.fieldKey ?? "").toLowerCase().replace(/^contact\./, "") === key,
  );
  if (byKey) return byKey;
  return remote.find((f) => (f.name ?? "").trim().toLowerCase() === def.name.toLowerCase());
}

/* ------------------------------------------------------------------ *
 * Creating a field
 * ------------------------------------------------------------------ */

/**
 * GHL has moved the picklist's property name around between API versions —
 * `options` in the older shape, `picklistOptions` in the newer one — and a
 * dropdown created without its options is a field somebody has to go and fix
 * by hand. So a dropdown is attempted both ways before it is allowed to fail,
 * and what actually worked is printed.
 *
 * Each attempt is a complete body rather than a patch, because a rejected
 * create leaves nothing behind to patch.
 */
function attempts(def) {
  const base = {
    name: def.name,
    dataType: def.dataType,
    model: "contact",
    ...(def.placeholder ? { placeholder: def.placeholder } : {}),
  };
  if (!def.options) return [{ label: def.dataType, body: base }];

  const labels = [...new Set(def.options.map((o) => o.label))];
  return [
    { label: "options", body: { ...base, options: labels } },
    { label: "picklistOptions", body: { ...base, picklistOptions: labels } },
    { label: "options+picklistOptions", body: { ...base, options: labels, picklistOptions: labels } },
  ];
}

async function createField(def) {
  let lastError;
  for (const attempt of attempts(def)) {
    if (DRY) return { how: `${attempt.label} (dry run)`, id: "—" };
    try {
      const body = await api(`/locations/${LOCATION}/customFields`, {
        method: "POST",
        body: JSON.stringify(attempt.body),
      });
      const field = body.customField ?? body;
      return { how: attempt.label, id: field.id ?? "?", key: field.fieldKey };
    } catch (err) {
      lastError = err;
      /* A 4xx here means the shape was wrong, which is what the next attempt
         is for. Anything else — auth, rate limit, an outage — will fail the
         same way every time, so stop. */
      if (!err.status || err.status < 400 || err.status >= 500) throw err;
    }
  }
  throw lastError;
}

/* ------------------------------------------------------------------ *
 * The commands
 * ------------------------------------------------------------------ */

const pad = (s, n) => String(s).padEnd(n);

async function check() {
  const remote = await existingFields();
  console.log(
    `\nLocation ${LOCATION} — ${remote.length} contact custom field(s) already defined.\n`,
  );
  console.log(`${pad("SITE FIELD", 18)}${pad("GHL LABEL", 30)}${pad("STATUS", 10)}KEY`);
  let missing = 0;
  for (const def of CONTACT_FIELDS) {
    const found = match(remote, def);
    if (!found) missing += 1;
    console.log(
      pad(def.id, 18) +
        pad(def.name, 30) +
        pad(found ? "present" : "MISSING", 10) +
        (found?.fieldKey ?? `contact.${def.fieldKey}`),
    );
  }
  console.log(
    `\n${CONTACT_FIELDS.length - missing} present, ${missing} missing.` +
      (missing ? "  Run `node scripts/ghl-setup.mjs fields` to create them." : ""),
  );
  return missing;
}

async function fields() {
  const remote = await existingFields();
  let made = 0;
  let kept = 0;
  const failed = [];

  for (const def of CONTACT_FIELDS) {
    const found = match(remote, def);
    if (found) {
      kept += 1;
      console.log(`kept    ${pad(def.name, 30)} ${found.fieldKey ?? found.id}`);
      continue;
    }
    try {
      const made_ = await createField(def);
      made += 1;
      console.log(
        `created ${pad(def.name, 30)} ${made_.key ?? `contact.${def.fieldKey}`}  [${made_.how}]`,
      );
    } catch (err) {
      failed.push({ def, err });
      console.error(`FAILED  ${pad(def.name, 30)} ${err.message}`);
    }
  }

  console.log(`\n${made} created, ${kept} already there, ${failed.length} failed.`);
  if (failed.length) {
    console.error(
      "\nThe failures above are the API's own words. The usual causes:\n" +
        "  401/403 — the token lacks locations/customFields.write, or belongs\n" +
        "            to a different sub-account than GHL_LOCATION_ID.\n" +
        "  422     — the payload shape moved again. Create those few by hand\n" +
        "            in Settings → Custom Fields, using the exact labels above;\n" +
        "            the site resolves them by name as well as by key.",
    );
    process.exitCode = 1;
  }
}

async function values() {
  const wanted = customValues(site);
  const remote = await existingValues();
  let made = 0;
  let updated = 0;

  for (const def of wanted) {
    const found = remote.find(
      (v) => (v.name ?? "").trim().toLowerCase() === def.name.toLowerCase(),
    );
    if (DRY) {
      console.log(`${found ? "would update" : "would create"}  ${pad(def.name, 26)} ${def.value}`);
      continue;
    }
    try {
      if (found) {
        await api(`/locations/${LOCATION}/customValues/${found.id}`, {
          method: "PUT",
          body: JSON.stringify({ name: def.name, value: def.value }),
        });
        updated += 1;
        console.log(`updated ${pad(def.name, 26)} ${def.value}`);
      } else {
        const body = await api(`/locations/${LOCATION}/customValues`, {
          method: "POST",
          body: JSON.stringify({ name: def.name, value: def.value }),
        });
        const created = body.customValue ?? body;
        made += 1;
        console.log(
          `created ${pad(def.name, 26)} ${def.value}   {{custom_values.${
            (created.fieldKey ?? "").replace(/^custom_values\./, "") || "…"
          }}}`,
        );
      }
    } catch (err) {
      console.error(`FAILED  ${pad(def.name, 26)} ${err.message}`);
      process.exitCode = 1;
    }
  }
  if (!DRY) console.log(`\n${made} created, ${updated} updated.`);
}

try {
  if (command === "check") await check();
  else if (command === "fields") await fields();
  else if (command === "values") await values();
  else if (command === "all") {
    await check();
    console.log("");
    await fields();
    console.log("");
    await values();
  } else {
    console.error(`Unknown command "${command}". Use: check | fields | values | all`);
    process.exit(1);
  }
} catch (err) {
  console.error(`\nGHL request failed: ${err.message}`);
  if (err.status === 401 || err.status === 403) {
    console.error(
      "That is an auth failure. Check the token is a Private Integration Token\n" +
        "for THIS sub-account and carries the custom-field scopes listed at the\n" +
        "top of this file.",
    );
  }
  process.exit(1);
}

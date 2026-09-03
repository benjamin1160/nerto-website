---
name: crm
description: Edit the CRM integration — how leads reach GoHighLevel, which custom fields they fill in, the chat widget's script and behaviour, lead attribution, tags, pipelines, and the webhook fallback. Use for any request about GHL, HighLevel, the CRM, a custom field or custom value, the chat bubble, where leads go, or what a form sends.
---

# Leads, GoHighLevel, and the chat widget

Every lead capture on the site goes through one function. There is no second
path, and adding one is the mistake this file exists to prevent.

```
form or chat  →  server validation  →  submitLead()  →  GHL   (if configured)
                                                     →  webhook (if set)
                                                     →  server log (if neither)
```

## Where things live

| File | What it holds |
| --- | --- |
| `lib/ghl/fields.ts` | **The one list** of contact custom fields. Read at request time by the client and by the setup script |
| `lib/ghl/custom-values.ts` | Location-level custom values, derived from `lib/site.ts` |
| `lib/ghl/lead.ts` | `SiteLead` — the union of everything any form asks — and the form ids |
| `lib/ghl/map.ts` | Which answer lands in which field, the note's prose, the tags |
| `lib/ghl/client.ts` | HTTP: token, field-id resolution, `/contacts/upsert`, notes, opportunities |
| `lib/ghl/submit.ts` | The single door out. Never throws; returns whether anything took the lead |
| `lib/attribution.ts` | First-touch UTMs and referrer, and the defensive parser for them |
| `lib/chat.ts` | Every word the chat widget says |
| `components/chat-widget.tsx` | The widget. Holds no copy |
| `components/lead-context.tsx` | The two hidden inputs every form carries |
| `scripts/ghl-setup.mjs` | Creates the fields and values in a sub-account |

## Adding a field the site sends

Four edits, in this order, and none of them optional:

1. `lib/ghl/fields.ts` — a new entry. `fieldKey` must be what GHL will derive
   from `name`: lowercased, spaces to underscores, punctuation dropped.
2. `lib/ghl/lead.ts` — the property on `SiteLead`, if it is a new answer
   rather than a new home for an existing one.
3. `lib/ghl/map.ts` — one line in `fieldValues`, and a `row(...)` in the note
   if a salesperson would want to read it.
4. `npm run ghl:setup` against the live sub-account, so the field exists.

Skip step 4 and the site logs a warning naming the field and sends the lead
without it. That is deliberate: a missing field never costs a lead.

## Rules

- **The list is the contract.** A field the runtime sends and the script does
  not create is a field nobody sees. Both read `fields.ts`; keep it that way.
- **Never rename a field's `name` casually.** GHL derives `fieldKey` once, at
  creation, and never again. A rename here leaves the old field standing in
  the CRM under the old key. Rename in GHL's UI too, or accept two fields.
- **Dropdown values are labels.** The site's `<select>`s submit slugs
  (`under-50k`); GHL stores what a human reads (`Under $50,000`). `optionLabel`
  does the translation and passes unknown values through rather than dropping
  them.
- **Never throw at a visitor.** `submitLead` swallows everything and returns a
  boolean. A CRM outage shows a phone number, not a stack trace.
- **Never add a third-party script.** The chat widget is the site's own code
  for a reason: no CDN, no cookie, no iframe, and it matches the skin.
- **Never let the chat imply a human or an AI is answering.** It says what it
  is in its first message. Editing `CHAT_GREETING` to remove that is a
  misrepresentation, not a copy change.
- **Never invent a business fact in `custom-values.ts`.** It reads
  `lib/site.ts`; if the site does not publish it, the CRM does not get it.

## Environment

`.env.example` is the full list with the scopes spelled out. The short of it:
`GHL_API_TOKEN` (a `pit-` Private Integration Token) and `GHL_LOCATION_ID` turn
the integration on; `GHL_PIPELINE_ID` plus `GHL_PIPELINE_STAGE_ID` add an
opportunity per lead; `GHL_DEFAULT_TAGS` adds tags; `LEAD_WEBHOOK_URL` keeps a
second copy; `GHL_API_VERSION` exists only because GHL changed the
custom-field payload's shape between `2021-07-28` and `v3`.

## Checking it

```bash
npm run ghl:check     # lists every field, present or MISSING. Changes nothing
npm run ghl:setup     # creates what is missing, writes the custom values
npm run ghl:values    # just the custom values — run after editing lib/site.ts
```

`ghl:check` is safe against a live account and is the first thing to run when
a lead arrives with empty fields.

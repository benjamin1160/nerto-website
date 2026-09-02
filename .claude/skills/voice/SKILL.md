---
name: voice
description: Rewrite the site's editorial copy so a deployment does not read like every other site built from this template. Use when setting up a site for a new dealership, when two clients are in the same market, when asked to make the copy unique, differentiate it from a competitor, localise it, or change the voice of the writing.
---

# Making a deployment read like one dealership's site

## The problem this solves

`check-placeholders` catches copy that is **false** for a new dealership — an
invented founder, a warranty nobody offers. This is the other failure: copy
that is perfectly true and perfectly *identical*.

About 4,300 words across `/`, `/why-manufactured`, `/start-here`,
`/financing` and `/contact` are the template's own writing. Nothing is wrong
with them. But sell the template twice into one market and both dealerships
publish the same paragraphs — which a competitor will notice, a buyer
comparing two tabs will notice, and a search engine will resolve by picking
one site to rank and discounting the other.

Run `npm run check:boilerplate` to see where a deployment stands. A freshly
cloned template reports 100%.

## What to rewrite, and what must not move

Three tiers. Get these confused and you either leave the site generic or
introduce errors.

**Tier 1 — locked facts.** Rewrite the sentence; never the fact. These are
checkable and being wrong about them is worse than being generic:

| Fact | Value |
| --- | --- |
| National Mobile Home Construction and Safety Standards Act | 1974 |
| HUD Code takes effect | June 15, 1976 |
| Wind zones II/III + thermal zoning introduced | 1994, post-Hurricane Andrew |
| DOE energy standards phase in | 2021–2025 |
| Only federal residential building code in the US | the HUD Code |
| Chattel vs. real-property rate gap | roughly two percentage points |
| Chattel amortisation | 20–23 years, against 30 |
| Real property needs | permanent foundation + title conversion |

Anything numeric in `/financing` — rate bands, terms, down payments — is a
market rate, not a template opinion. Re-check it against what lenders are
actually quoting before it ships, and update it rather than paraphrasing it.

**Tier 2 — the argument, in new words.** The structure is the template's real
value: land before floor plan, pre-approval over pre-qualification, budget
the whole number, the honest section conceding where sceptics are right.
Keep every one of those beats. Rewrite the sentences that carry them —
different openings, different metaphors, a different order inside a section,
different examples. Do not thesaurus it: a synonym swap reads worse than the
original and still fingerprints as the same text.

**Tier 3 — market specifics.** `lib/market.ts` holds counties served, wind
zone, thermal zone, frost depth, the state's real-property conversion, and
any local USDA note. Fill it in for the client's market and let the copy use
it. This is the strongest differentiator available: a page that tells a buyer
what Wind Zone III means for their county is both unique and more useful than
the generic version, and no competitor's stock template says it.

## Doing the pass

Work one page at a time, and read the whole page before changing a line — the
copy cross-references itself (`/financing` points at `/start-here`, the
homepage summarises both).

1. Establish the voice first. Ask the client for two or three pages of their
   existing writing, or ask how they talk to buyers. Absent that, ask before
   inventing a personality — a wrong voice is worse than the template's.
2. Rewrite Tier 2 prose page by page. Keep the beats, keep the honesty, keep
   the reading level. The template's register is plain, concrete and willing
   to concede a point; a rewrite into marketing gloss is a downgrade even
   though it scores well on this check.
3. Fill in `lib/market.ts` and work the local facts into the copy where they
   help.
4. `npm run check:boilerplate`. Under 25% is a properly rewritten site. What
   remains should be Tier 1 — the sentences where the fact and the phrasing
   are hard to separate.
5. `npm run lint` and `npm run build`.

## Never

- Never rewrite a Tier 1 fact into something you have not verified. Losing
  "June 15, 1976" to a paraphrase that says "the mid-seventies" makes the
  page vaguer, not more distinctive.
- Never invent a local fact to fill `lib/market.ts` — an unverified wind zone
  is a structural claim. Leave the field out; the copy falls back to a
  portable sentence.
- Never drop the "where the sceptics are right" section on `/why-manufactured`
  or the chattel warnings on `/financing`. Conceding the weak points is the
  reason the rest of the site is believable, and it is the first thing a
  dealership will ask you to soften.

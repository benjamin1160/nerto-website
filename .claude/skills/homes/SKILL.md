---
name: homes
description: Edit the home catalogue — add, remove, reprice, or re-status a listing; change beds/baths/sqft/specs, taglines, story copy, highlights, feature lists, scenes, or floor-plan geometry. Use for any request that names a home, listing, model, plan, series, or community placement.
---

# Editing homes

The catalogue has two halves, and which one you edit depends on the ask.

`lib/catalogue.generated.ts` is the **manufacturers' published facts** — 348
plans imported from Pine Grove Homes and Pleasant Valley Homes, each carrying
the `sourceUrl` it was read from. **Never hand-edit it.** It is rewritten
whole by `node scripts/import-manufacturers.mjs homes`, and a hand edit is
lost the next time somebody re-imports.

`lotState` in `lib/homes.ts` is **what NERTO decides** — which plans are
standing on River Road (`onLot`), what is featured, what is sold or pending.
It is applied over the generated file, so it survives a re-import. This is
where almost every human request lands.

Every facet on /listings — home type, series, sections, style — is built from
the values the catalogue actually carries, and each pill shows how many homes
sit behind it. A value no plan uses gets no pill, so nothing on the rail can
be pressed to an empty page; add homes carrying a new style or a triple
section and its pill appears on its own.

`listings`, exported from `lib/homes.ts`, is the two composed, and everything
else on the site derives from it — detail pages, filter facets, sitemap,
related-homes scoring, the homepage figures. Change the data, never the
pages.

## Where each thing lives

| Ask | File |
| --- | --- |
| Status, on-lot, featured, sold, pending | `lib/homes.ts` → `lotState` |
| Beds, baths, sq ft, model code, dimensions, prose | `lib/catalogue.generated.ts` — via a re-import, never by hand |
| Room sizes and layout | `lib/floor-plans.ts` → the plan named by `planId` |
| Past projects NERTO has delivered | `lib/projects.ts` |
| Informational videos | `lib/videos.ts` |
| Community, lot rent, amenities | `lib/communities.ts` |
| Which pictures a home shows | `lib/photos.ts` (see the `photos` skill) |

## The listing fields

**Required** — a listing means nothing without these:

- `slug` — URL segment, kebab-case. Changing it changes the URL.
- `name`, `beds`, `baths`, `sqft`
- `status` — `available` | `to-order` | `pending` | `sold` | `coming-soon`.
  `to-order` ("Available to order") is the catalogue's default and correct for
  almost everything: a plan NERTO builds for you rather than stocks.
- `scenes` — the gallery, in order. The first scene is the card image, so
  put the exterior first when there is one.

**Optional** — and genuinely optional. Real inventory arrives incomplete: a
spec sheet with dimensions but no price, a feed with photographs but no
floor plan. Every one of these is hidden from the UI when absent — no blank
rows, no zeroes, no placeholder prices.

- `price` (absent renders as "Call for pricing" everywhere, and drops the
  payment calculator), `wasPrice` (strikethrough)
- `series` — free text; the facet list on /listings derives from what is used,
  and `lib/custom-pages.ts` points a `/p/<slug>` campaign page at one of them
- `model`, `year`, `daysListed` (≤ 10 shows a "Just listed" badge)
- `sections` — `single` | `double` | `triple`
- `construction` — `manufactured` (HUD code) | `modular` (state code). Drives
  the **Mods** size bucket, which is checked before any width rule, and the
  **Home type** filter on /listings.
- `builder` — "Pine Grove Homes", "Pleasant Valley Homes"
- `dimensions` — the manufacturer's own box size, e.g. `26'8" × 52'`. Shown in
  preference to the nominal `widthFt × lengthFt`.
- `planImage` — the manufacturer's floor-plan DRAWING. It renders labelled as
  a drawing and never fills a photograph's slot.
- `onLot` — standing on River Road, open to walk through. Set in `lotState`.
- `widthFt`, `lengthFt` — transport dimensions
- `communitySlug` — must match a `slug` in `lib/communities.ts`
- `planId` — a key of `floorPlans` in `lib/floor-plans.ts`; without it the
  floor-plan section does not render
- `hers` — energy index, lower is better; a new site-built home is ~100
- `tagline`, `story` (paragraphs), `highlights` (bullets), `features`
- `tourUrl` — a Matterport or other walkthrough link
- `sourceUrl` — where an imported listing came from
- `style` — architectural style, shown on the card caption
- `featured` — featured homes surface on the homepage

**Never fill an optional field with a guess.** A fabricated price or an
invented HERS index on a real listing is worse than an absent one: absent is
handled, wrong is published. If a figure is not in the source, leave it out
and say so.

## Recipes

**Change a status, or move a home on or off the lot.** Edit `lotState` in
`lib/homes.ts` — one entry per home, keyed by slug. Nothing else.

**Add a Matterport walkthrough.** One line in the `tours` map in
`lib/homes.ts`, keyed by the plan's slug. Not `lotState` — a tour is a
walkthrough of the plan, not a claim that the house is standing on River Road,
and most plans with a tour are still `to-order`. `npm run lint` fails if the
slug matches no plan.

**Change a spec that is wrong.** Check it against the listing's `sourceUrl`
first. If the manufacturer has changed it, re-import (`photos`, then `homes`,
then `manifest`); if the importer is misreading the source, fix the parser in
`scripts/import-manufacturers.mjs`. Do not patch the generated file — the
next import reverts it.

**Add a home the manufacturers do not publish.** Rare, but it happens with a
one-off trade-in. Add it to the `listings` composition in `lib/homes.ts` as a
hand-written entry alongside the generated array, not to the generated file.

**Remove a home.** If NERTO has stopped carrying a whole line, filter it in
the importer and re-run. For one plan, `lotState` can mark it `sold`.

**Import from a dealer's existing site.** `scripts/import-westgate.mjs` is
the worked example — it reads the WordPress REST API, parses specs out of
listing titles, builds contact sheets so gallery photos can be tagged by
scene, and writes web-sized images into `public/photos/homes/`. Copy its
shape for another source. It deliberately imports nothing it cannot read.

**Change the layout.** Edit the plan in `lib/floor-plans.ts`. Rooms are in
feet from the top-left of the footprint and must tile the footprint exactly
with no gaps or overlaps — `<FloorPlan>` derives walls and windows from that
tiling, so a gap draws as a hole. After editing, check the room rectangles
sum to `width × length`.

**Add a floor plan.** Copy the closest existing plan, rename the key to
`<sections>-<width>x<length>`, then adjust rooms, doors and `entry`.

## Before finishing

Run `npm run lint` and `npm run build`. TypeScript catches a bad `planId`,
an unknown `series`, or a missing field; the build catches a floor plan that
no longer tiles.

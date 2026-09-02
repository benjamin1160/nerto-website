---
name: homes
description: Edit the home catalogue — add, remove, reprice, or re-status a listing; change beds/baths/sqft/specs, taglines, story copy, highlights, feature lists, scenes, or floor-plan geometry. Use for any request that names a home, listing, model, plan, series, or community placement.
---

# Editing homes

Every home lives in one array: `listings` in `lib/homes.ts`. Everything
else on the site — detail pages, filter facets, sitemap, related-homes
scoring, community cross-links, the homepage "starting at" price — derives
from that array. Change the data, never the pages.

## Where each thing lives

| Ask | File |
| --- | --- |
| Price, beds, baths, sq ft, status, photos, copy | `lib/homes.ts` → the listing object |
| Room sizes and layout | `lib/floor-plans.ts` → the plan named by `planId` |
| Community, lot rent, amenities | `lib/communities.ts` |
| Which pictures a home shows | `lib/photos.ts` (see the `photos` skill) |

## The listing fields

**Required** — a listing means nothing without these:

- `slug` — URL segment, kebab-case. Changing it changes the URL.
- `name`, `beds`, `baths`, `sqft`
- `status` — `available` | `pending` | `sold` | `coming-soon`
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

**Change a price / status / spec.** Edit the field on that listing. Nothing
else. `priceBounds` and the homepage figure recompute themselves.

**Add a home.** Append an object to `listings`. Pick an existing `planId`
whose `width`/`length` match `widthFt`/`lengthFt`, or add a new plan first.
Everything else follows automatically — do not touch route files.

**Remove a home.** Delete the object. Check no other listing's copy names it.

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

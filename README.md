# NERTO Homes — newenglandrenttoown.com

The website for NERTO Homes (New England Rent To Own, LLC), 65 River Road,
Chelsea, Maine — mobile and modular homes, sheds, camps and horse barns.

Built on a Next.js 16 dealership template: a filterable listing catalogue,
scale floor plans, a financing calculator that tells the truth about chattel
loans, and an editorial content layer built to dismantle the "trailer park"
stereotype rather than tiptoe around it.

`lib/homes.ts` carries twenty real, published plans, browsed by size —
tiny, single, double, triple. Each names its `sourceUrl`, none carries a
price, and they are Clayton-built rather than confirmed against NERTO's own
line-up: check which of them the business actually orders before quoting
anybody. Empty the array and the whole site reads honestly at zero — the
listings band, the size buttons and `/listings` all handle it.

`lib/communities.ts` ships empty, because NERTO publishes no communities, so
`/communities` is switched off in `lib/page-config.ts`.

`/land-deals` is switched off for the same reason: it is nothing but priced
counties, and `lib/land/areas.ts` carries none. The geography under it is
real and points at Chelsea — moving the page from "off" to "on" is a matter
of pricing the delivery radius, not of rebuilding anything.

The page heroes are still stock photographs of manufactured homes rather than
pictures of this lot; the footer says so, and the head of `lib/photos.ts`
explains what to replace.

Every image on the site is a photograph, served from `public/photos` — no CDN
calls, no third-party image host. Anything without a photograph yet holds its
space with an empty plate rather than a drawing, so nothing is ever pictured
that does not exist. Every page prerenders to static HTML; the only thing
that wants a server at runtime is the pre-approval form on `/land-deals`.

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # prerenders every route; only the /land-deals lead form needs a server
npm run lint    # eslint + the placeholder check below
npm run preview # bundle the built site into one file: preview/index.html
npm run check:placeholders   # what's still the template's fictional business
npm run check:boilerplate    # how much copy is still the template's own words
```

`npm run preview` folds every prerendered route, the stylesheet, the fonts and
any registered photographs into a single HTML file that opens from disk or in
any window that renders HTML. Links between pages work and both themes work;
anything that needed React — the catalogue filters, the payment calculator, the
enquiry form — renders but sits inert, and the page says so.

## What's in it

| Route | What it does |
| --- | --- |
| `/` | An ordered list of switchable bands — hero, offer banner, "no land? start here", the team, video, testimonials, five-step process, industry numbers, myth-vs-fact, nine-layer construction cutaway, featured homes, communities, closing CTA. Order and switches live in `components/landing.tsx` and `lib/page-config.ts` |
| `/p/[slug]` | The same landing narrowed to one series — a campaign page that cannot drift away from the front page, because it is the front page |
| `/listings` | Size buckets first — tiny, single, double, triple, counted and measured from the catalogue — then a faceted browser — search, price range, beds, baths, series, sections, style, availability, five sort orders, grid/list, URL-synced and shareable |
| `/listings/[slug]` | Gallery with lightbox, scale floor plan with room dimensions, spec sheet, feature accordion, payment calculator, booking form, related homes, `SingleFamilyResidence` JSON-LD |
| `/communities` | Land-lease vs resident-owned vs fee-simple explainer, then each community with amenities and the homes sited there |
| `/why-manufactured` | HUD Code timeline, manufactured/modular/site-built comparison table, HERS scale, an honest "where the sceptics are right" section, FAQ |
| `/financing` | Six lending paths, the payment calculator, order of operations, FAQ |
| `/land-deals` | An interactive map of every county in the delivery radius, shaded by what it takes to get into a home on land you own there, plus a pre-approval form that posts to a Server Action. `LocalBusiness` + `FAQPage` JSON-LD and its own social card |
| `/start-here` | The buyer's guide for people who do not own land — the three routes onto ground, the order of operations, what you pay beyond the home, titling, FAQ |
| `/new-home` | Build-a-home wizard: four questions, then the plans that actually fit. Owns the whole screen — no header CTA, no floating call button |
| `/prequalify` | Pre-approval page — what a buyer gets for asking, the three steps, and the lead form that posts to a Server Action |
| `/faq` | Every question in `lib/faq.ts` in full. The first six of the same list close `/why-manufactured` |
| `/promotions` | Live offers from `lib/promotions.ts`, each with its end date. An expired offer drops off on its own; an empty page says so plainly |
| `/blog`, `/blog/[slug]` | Notes from `lib/blog.ts`. Ships with no posts and the page switched off |
| `/address` | Where the lot is, when it is open, who answers the phone, and the communities worth the drive |
| `/about`, `/contact`, `/saved` | Company story, booking form, localStorage shortlist with a side-by-side comparison table |
| `/privacy-policy`, `/terms` | Clauses from `lib/legal.ts`, with the business's own details substituted in. The only two routes with no switch |
| `/sitemap.xml`, `/robots.txt`, `/opengraph-image` | Generated from the same data |

Plus a themed 404, light/dark with no flash, a floating call button, and a
full keyboard-accessible mobile drawer that carries every route the header bar
has no room for.

Every route above except the two legal pages has a switch in
`lib/page-config.ts`. Turning one off makes the route redirect to `/` — never
404, because an indexed link or a printed card outlives the switch — and drops
it from the header, the drawer, the footer and the sitemap at the same time.
`/homes` and `/homes/[slug]` permanently redirect to `/listings`, where the
catalogue used to live.

## Editing it by prompt

The repository carries its own conventions in `.claude/skills/` (`homes`,
`photos`, `brand`, `land-deals`), so a Claude Code session in this repo
already knows where the catalogue, the photographs, the design tokens and the
county pricing live. `EDITING.md` has
worked examples of the asks — repricing a home, wiring up a photo set,
rebranding — for the person doing the asking.

## Where to change things

```
lib/
  homes.ts          The listing catalogue — 20 homes. Start here.
  photos.ts         Every photograph, by key. No key = an empty plate.
  floor-plans.ts    Room geometry in feet. Rooms tile the footprint exactly.
  communities.ts    Communities, tenure types, lot fees.
  site.ts           Business name, address, phone, canonical URL.
  company.ts        What the business claims about itself. All optional —
                    an absent field hides its section. Replace or delete
                    before launch; never invent.
  market.ts         Counties, wind and thermal zone, state titling, USDA
                    notes. Also optional; copy falls back to a portable
                    sentence. The cheapest way to make two deployments
                    genuinely differ.
  page-config.ts    Which landing bands render, in what order, and which
                    routes exist at all. The Page Manager for this site.
  navigation.ts     The header bar, the mobile drawer and the footer links,
                    all filtered through page-config.
  faq.ts            The questions, shared by /faq and /why-manufactured.
  promotions.ts     Live offers. Each carries its own end date and drops
                    off the site the day after it passes. Ships empty.
  blog.ts           Posts. Ships empty, with the page switched off.
  custom-pages.ts   Campaign pages at /p/<slug> — the landing narrowed to
                    one series. Ships empty.
  legal.ts          Privacy and terms clauses. A draft, not legal advice.
  format.ts         Currency, feet-and-inches, amortisation maths.
  land/             The /land-deals map. areas.ts prices each county in the
                    delivery radius; geo.ts holds the lot's coordinates and
                    the projection (1 SVG unit = 1 mile, which is why the
                    service ring is r={100}); county-shapes.generated.ts is
                    real census geometry, regenerated by script, never by
                    hand. Market data — replace it, do not ship it.
components/
  landing.tsx       The landing page as an ordered list of bands. `/` and
                    every /p/<slug> render it, so they cannot drift apart.
  artwork/scene.tsx The single entry point for every image (see below)
  floor-plan.tsx    Renders lib/floor-plans.ts as an architectural drawing
  assembly-diagram.tsx
  listings-browser.tsx  Filtering, sorting and URL sync
  payment-calculator.tsx
  skin.ts           Skins — palette, typefaces, radii and the primary
                    button, as data. `hearthline` is the warm editorial
                    look; `nerto` is the white, conversion-shaped one a
                    Mobile Home Manager site wears. `activeSkin` picks.
app/globals.css     Token structure and fallback values. A skin overrides
                    what it names; edit here for a one-off restyle.
```

### Adding a home

Append to `listings` in `lib/homes.ts`. The only field that needs thought is
`planId`, which points at a plan in `lib/floor-plans.ts`. Everything else —
detail page, sitemap entry, filter facets, related-homes scoring, community
cross-links — follows automatically.

### Photography

`components/artwork/scene.tsx` is the single entry point for every image on
the site, and `lib/photos.ts` is where photographs are registered. This site
shows photographs and nothing else: add a key and that image is a
photograph, leave it out and the space is held by an empty plate saying one
is still to come. Photography can therefore arrive one picture at a time
without anything ever standing in for a home that does not exist.

```ts
// lib/photos.ts
export const photos: Record<string, string> = {
  "the-alder/kitchen": "/photos/homes/the-alder/kitchen.jpg",
  "community/cedar-hollow": "/photos/communities/cedar-hollow.jpg",
  "page/financing": "/photos/pages/financing.jpg",
};
```

The homepage hero is the exception — it is imported directly in
`app/page.tsx` so it can ship a blur placeholder; replace
`public/photos/hero-home.jpg` in place.

`scripts/import-clayton.mjs` fetches model photography from the `sourceUrl`
each listing already carries: `sheets` writes a numbered contact sheet per
home, you record the indices you want in `scripts/clayton-selection.json`,
`photos` downloads them at web size, and `register` rewrites the map above
from whatever is on disk. `register` needs no network, so it also wires up
images you saved by hand into `public/photos/homes/<slug>/<kind>.webp`.
Manufacturer photography is the manufacturer's — check your retail agreement
covers the use before publishing it.

A listing should declare only the scenes it has a photograph for — a scene
without one renders as the empty plate rather than a picture. The generated
SVG artwork that used to fill those gaps is gone; `components/floor-plan.tsx`
and `assembly-diagram.tsx` still draw, but they are diagrams of geometry and
construction, not pictures of a home.

### Theming

All colour lives as CSS custom properties at the top of `app/globals.css`,
mapped into Tailwind v4 via `@theme inline`. Change `--ember` and the accent
moves everywhere — buttons, floor-plan entry markers, chart bars, focus rings.
The dark palette is the same token list redefined under `.dark`.

Typography is Fraunces (display), Geist (UI) and Geist Mono (data), loaded
through `next/font/google` and self-hosted at build time.

### The forms, the chat widget, and GoHighLevel

Every lead capture on the site — the hero quote card, the closing enquiry
band, the pre-approval form, the walkthrough request under each listing, and
the chat widget — validates on the server and then goes through one function,
`submitLead` in `lib/ghl/submit.ts`. It has three sinks and uses whichever are
configured:

1. **GoHighLevel**, when `GHL_API_TOKEN` and `GHL_LOCATION_ID` are set. The
   contact is upserted (so the same person filling in two forms stays one
   contact), tagged `website` and `website-<form>`, given the whole lead as a
   note, and — with a pipeline configured — an opportunity.
2. **`LEAD_WEBHOOK_URL`**, exactly as before: the lead as JSON.
3. **The server log**, when neither is set, so a site deployed ahead of its
   CRM loses nothing.

Copy `.env.example` to `.env.local` and fill it in:

```bash
NEXT_PUBLIC_SITE_URL="https://yourdomain.com"   # canonical + OG URLs
GHL_API_TOKEN="pit-..."                         # Private Integration Token
GHL_LOCATION_ID="..."                           # the sub-account
```

Then create the CRM's fields — the script reads `.env.local` itself:

```bash
npm run ghl:check    # what exists, what is missing. Changes nothing.
npm run ghl:setup    # creates the 25 contact fields, writes the custom values
```

`lib/ghl/fields.ts` is the list of contact custom fields and the one place to
add another; `lib/ghl/custom-values.ts` is the location-level custom values,
drawn from `lib/site.ts`, so the phone number in a GHL SMS template and the
one in the footer are the same fact. `lib/ghl/map.ts` decides what goes where.

Two details worth knowing. The site captures first-touch UTM parameters and
the referrer in `sessionStorage` and posts them with the lead, because GHL's
own attribution only sees GHL's own forms. And every form carries the
visitor's shortlist — the homes they hearted — which is usually a better
guide to the call than the one home they filled a form about.

The chat widget is `components/chat-widget.tsx`, its script is data in
`lib/chat.ts`, and `chatWidget` in `lib/page-config.ts` turns it off. It is a
guided intake rather than a conversation, it says so in its first message,
and it posts as soon as it has a name and a number so an abandoned chat is
still a lead. Nothing is loaded from a third-party CDN.

These routes need a running server; the rest of the site is static.

### The county map

`/land-deals` draws real US Census county boundaries, projected at generation
time into a plane where one SVG unit is one mile from the lot — which is why
the service area is literally `r={100}`. The app ships path strings and never
parses GeoJSON. Regenerate them after moving the lot or changing which
counties are priced:

```bash
curl -o counties.json \
  https://raw.githubusercontent.com/plotly/datasets/master/geojson-counties-fips.json
python3 scripts/generate-county-shapes.py counties.json
```

The counties that ship are one dealership's market, not a placeholder set —
`.claude/skills/land-deals/SKILL.md` lists everything that has to move with
them.

## Notes

- **View transitions.** `experimental.viewTransition` is on in
  `next.config.ts`; the listing-card photograph morphs into the detail-page hero on
  navigation. Browsers without support just navigate normally.
- **No-JS.** Scroll reveals, saved homes and the theme toggle all degrade
  cleanly. The catalogue renders its first six homes server-side while the
  filter UI hydrates.
- **Motion.** Everything respects `prefers-reduced-motion`.
- **Content is fictional.** Prices, HERS indices, community terms and
  certifications are illustrative. The construction and HUD Code facts are
  broadly accurate as of 2026, but check your own jurisdiction before
  publishing any of it as your own claims.

## Requirements

Node 20.9+, Next.js 16.2, React 19.2. Turbopack is the default builder.

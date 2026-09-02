---
name: brand
description: Change site-wide identity and presentation — company name, phone, email, address, hours, the accent colour and theme tokens, fonts, page headlines and marketing copy, and where the enquiry form sends its data. Use for rebranding, contact-detail changes, colour or theme changes, and edits to page copy that is not a home listing.
---

# Branding, theme and copy

## Business identity

`lib/site.ts` is the single source for name, tagline, description, URL,
phone, email, address and hours. It feeds the header, footer, contact page,
metadata, JSON-LD, sitemap and OG image. Change it there and it changes
everywhere — never hard-code a phone number or address in a page.

`phone` and `phoneHref` are separate on purpose: one is displayed, one is
the `tel:` link. Change both together.

The canonical URL also reads `NEXT_PUBLIC_SITE_URL` from the environment, so
production can override it without a code change.

## What the business claims about itself

`lib/company.ts` holds every statement that is true of one dealership and no
other: founding year, homes sold, headcount, the founding story, the
operating principles, named staff, warranty length, transport included in
the price, the cash deposit schedule. These used to sit inline in the pages,
where a rebrand missed them and left a stranger's biography and a stranger's
warranty on a real business's site.

**Every field is optional and every section that reads one disappears when it
is absent.** Delete `team` and the About page has no team section; delete
`founded` and nothing claims a founding year; delete `warrantyMonths` and the
homepage stops promising a warranty. The section numbering renumbers itself.

So there are exactly two correct moves for any field, and inventing a
plausible value is neither:

1. The business publishes the fact — on its own site, its listing, its
   paperwork — so fill it in.
2. It doesn't — so delete the field.

A shorter About page is the right outcome for a dealership that says little
about itself. Do not carry a shipped value over because the layout looks
better with it: these are claims about staff, trading history and what a
price includes, and publishing them unverified makes them false.

`npm run check:placeholders` lists which shipped placeholders survive. It
reports and passes while `NEXT_PUBLIC_SITE_URL` is unset or on
`example.com`, and fails once it points at a real domain.

## Colour and theme

Every colour is a CSS custom property at the top of `app/globals.css`,
mapped into Tailwind v4 through `@theme inline`. The dark theme is the same
token list redefined under `.dark`.

- Change `--ember` and the accent moves everywhere at once — buttons, focus
  rings, floor-plan entry markers, chart bars, badges.
- Change a colour by editing a token. Do not add hex values in components;
  if a component needs a colour that has no token, add the token.
- Edit both the light and the `.dark` block, or the change only lands in one
  theme.

### Skins

`lib/skin.ts` holds whole looks as data — palette light and dark, the
typeface pairing, the corner radii and the primary button's colours. Two
ship:

| Skin | What it is |
| --- | --- |
| `hearthline` | Warm and editorial. Serif display face on limestone paper, ember accent, pill buttons. |
| `nerto` ("Direct") | White ground, slate type, a blue-to-orange gradient on every primary button, system sans, 12px buttons and 16px cards. The look a Mobile Home Manager deployment wears — the values are that engine's `custom` skin as it resolves them, not an approximation. |

Two parts of a skin are optional blocks rather than palette entries, because
a flat primary and a gradient primary are different design languages rather
than different values of one:

- `gradient` / `gradientDark` name `--gradient`, `--gradient-hover`,
  `--button-shadow` and `--card-shadow`, and also set `--btn-gradient`, which
  `buttonStyles.primary` layers **over** `--btn-bg`. A skin that names no
  gradient resolves it to `none` and keeps exactly the flat button it had.
- `fonts` may name `system`, which downloads nothing and renders in the
  reader's own interface face. That is what `nerto` uses. Every other choice
  is self-hosted by `next/font` in `app/layout.tsx`.

`activeSkin` at the foot of that file picks one, and that single line
restyles the entire site. So there are two ways to recolour, and which one
is right depends on the ask:

- **"Make this site green"** — one deployment, one-off. Edit the tokens in
  `app/globals.css`. A skin only overrides the tokens it names, so the rest
  still comes from there.
- **"We need a look for dealerships who want X"** — reusable. Copy a skin
  block in `lib/skin.ts`, change the values, add the id to `SkinId`. Now
  every future deployment can wear it by changing one line.

Whichever you choose: never hardcode a hex in a component. `--btn-bg`,
`--corner-button` and `--corner-card` exist precisely so buttons and cards
follow the skin rather than pinning a shape the next skin has to fight.

Typefaces are the one thing a skin cannot fully own: `next/font` has to see
its calls literally to self-host the files at build time. So every family a
skin may ask for is loaded in `app/layout.tsx` and the skin picks between
them by name (`display-serif`, `ui-sans`, `grotesk`, `mono`). Adding a
typeface means adding the `next/font` call there *and* the entry in
`FontChoice`.

The logo is `components/logo.tsx`, drawn as inline SVG.

## Page copy

Marketing copy lives inline in the route that shows it, near the top of the
file as a named constant where it repeats:

| Page | File |
| --- | --- |
| Homepage — hero, myth/fact, process, ticker, testimonials | `components/landing.tsx` (`app/page.tsx` only calls it, and every `/p/<slug>` calls it too) |
| Which homepage bands appear, in what order, and which routes exist | `lib/page-config.ts` |
| Header, mobile drawer and footer links | `lib/navigation.ts` |
| The questions — `/faq` and the foot of `/why-manufactured` | `lib/faq.ts` |
| Live offers — the homepage banner and `/promotions` | `lib/promotions.ts` |
| Privacy policy and terms | `lib/legal.ts` |
| Why manufactured — timeline, comparison, FAQ | `app/why-manufactured/page.tsx` |
| Financing — lending paths, order of operations, FAQ | `app/financing/page.tsx` |
| About — story, team, values | `lib/company.ts` (the claims), `app/about/page.tsx` (the layout) |
| Contact | `app/contact/page.tsx` |
| Header and footer chrome (the markup, not the links) | `components/site-header.tsx`, `components/site-footer.tsx` |

Copy about a specific home belongs on the listing in `lib/homes.ts`, not in
a page — see the `homes` skill.

## Which pages and bands exist

`lib/page-config.ts` is this site's page manager, and editing it is the
supported way to shorten a site — not deleting a route or commenting a band
out of `components/landing.tsx`, because the next deployment wants it back.

- `sections` lists the landing-page bands **in render order**. Set one to
  `false` and it stops rendering. Reorder the site by moving a band in the
  `bands` array in `components/landing.tsx`; the numbered eyebrows renumber
  themselves from what survives, so 01, 02, 03 stays contiguous.
- `pages` lists the standalone routes. Set one to `false` and the route
  redirects to `/` — never 404, because an indexed link or a printed card
  outlives the switch — and its links vanish from the header, the drawer,
  the footer and the sitemap in the same move.
- `/privacy-policy` and `/terms` have no switch, on purpose.

The default arrangement is the short, conversion-shaped one, and it is eight
bands: `hero` (which carries the badge, the headline, both calls to action,
the licence-and-promises row **and** the quote form), `promotion`,
`valueProp`, `socialProof`, `howItWorks`, `listings`, `contact` (the closing
call beside the enquiry form) and `locationHours`.

Eight more are written, styled and shipped `false`: `homeOnLand`, `meetTeam`,
`videoShowcase`, `communities`, and the four that make up the long editorial
argument for a manufactured home — `ticker`, `numbers`, `myth`, `cutaway`. A
dealership that wants the twenty-minute read turns those back on and gets it.
None of them is deleted, and none needs writing again.

Three bands are gated by their data as well as their switch, and stay hidden
when it is missing: `promotion` needs a live offer in `lib/promotions.ts`,
`meetTeam` needs somebody in `company.team`, and `videoShowcase` needs a URL
in `videoShowcase`. That is the same rule as everywhere else here — an absent
fact shortens the page and is never invented to fill it.

Turning a page on is not enough on its own where the page has no content:
`/blog` needs a post in `lib/blog.ts` and `/promotions` reads honestly empty
until an offer is written. Write the content, then flip the switch.

Campaign pages live at `/p/<slug>` and are configured in
`lib/custom-pages.ts`. Each one is the landing page with the listings band
narrowed to a single `series`, so it cannot drift away from the front page.

The content shipped with the template is fictional and its construction and
HUD Code claims are illustrative. When rebranding for a real business, treat
prices, certifications, HERS indices and community terms as placeholders to
be replaced, not facts to be kept.

The HUD Code history, the chattel-versus-mortgage comparison, the titling
explanation and the order of operations on `/why-manufactured`, `/financing`
and `/start-here` are different: they are true of the category in any market,
so a rebrand does not have to correct them. It is the sentences about *this*
business that have to change here.

But true is not the same as *distinctive*. That editorial copy is identical
on every site built from this template, which matters the moment two
dealerships in one market both have one. Rewriting it is a separate pass with
its own rules about which facts may not move — see the `voice` skill, and
`npm run check:boilerplate` for where a deployment currently stands.

## The phone

A dealership's most valuable page event is a tapped telephone number, so the
template puts one in five places and each has a switch or a data field behind
it rather than a hard-coded string:

| Where | File | Switch |
| --- | --- | --- |
| The gradient strip above the header | `components/call-bar.tsx` | `callBar` in `lib/page-config.ts` |
| The header, as the outlined button on the right | `components/site-header.tsx` | — |
| The hero's second call to action | `components/landing.tsx` | — |
| The closing band, beside the enquiry form | `components/landing.tsx` | `sections.contact` |
| The button that follows a visitor down the page | `components/floating-call.tsx` | `floatingCall` |

All five read `site.phone` and `site.phoneHref`, so changing the number in
`lib/site.ts` changes every one of them.

The header is **sticky, not fixed**, and opaque rather than
transparent-over-the-hero. Because it is in flow, no page needs top padding to
clear it — do not add any. The two things that still have to know its height
read `--chrome-h`: sticky rails that park beneath it (the filter bar on
`/listings`) and `scroll-margin` on anchored sections. `--chrome-h` is
`--header-h` plus `--callbar-h`, which `components/call-bar.tsx` publishes on
`:root` only when the bar renders — so turning the bar off collapses the
offset with it and no page needs a second edit. Never hard-code the header
height; read the token.

## The enquiry form

`components/inquiry-form.tsx` validates and then resolves locally — nothing
is sent anywhere. To wire it up, replace the `await new Promise(...)` in
`onSubmit` with a Server Action or a POST to a CRM endpoint. The fields are
already named sensibly: `name`, `email`, `phone`, `home`, `date`, `slot`,
`message`, `callFirst`.

The landing page's two forms are different — both post to the
`requestPreApproval` Server Action in `app/land-deals/actions.ts`, which
forwards to `LEAD_WEBHOOK_URL` and logs the lead when that is unset.
`components/quote-form.tsx` is the dark card in the hero, for somebody who
will not scroll; `components/contact-band.tsx` is the longer one in the
closing band, for somebody who has. Neither draws its own panel where the
band already supplies one. They are told apart in the CRM by their `source`, so
add a new form's source to `LEAD_SOURCES` in `lib/land/lead.ts` rather than
letting it fall back to the map's.

## Before finishing

`npm run lint` and `npm run build` — `lint` now includes the placeholder
check. After a colour change, check both
themes — the toggle is in the header.

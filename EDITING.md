# Editing this site by prompt

Everything on this site is data in a handful of files, so most changes are a
sentence rather than a task. Open Claude Code in this repo and ask. The
conventions are written down in `.claude/skills/`, so any session — this one
or one six months from now — already knows where things live before you
explain anything.

Five skills load automatically:

| Skill | Covers |
| --- | --- |
| `homes` | listings, prices, specs, copy, floor plans |
| `photos` | every picture on the site |
| `brand` | company details, colours, fonts, page copy, forms, which pages and homepage bands exist |
| `land-deals` | the county price map on `/land-deals` |
| `voice` | rewriting the editorial copy so two sites do not read alike |

You never have to name one. Say what you want changed and the matching skill
picks itself up. Typing `/homes`, `/photos`, `/brand`, `/land-deals` or
`/voice` forces one.

## The look

Two whole looks ship in `lib/skin.ts` and one line switches between them:
`hearthline` is warm and editorial, `nerto` is the white, blue-and-orange
conversion layout. Ask for either by name, or ask for a new one.

> Switch the site to the Direct skin.

> Make a skin like the Direct one but with our green as the primary and a
> serif for headlines.

> The buttons should be square, not pills.

## Pages and homepage bands

The homepage is a list of bands and the site is a list of pages, and both are
switches in `lib/page-config.ts`. Turning one off is a supported edit: the
band stops rendering, or the route redirects to `/` and disappears from the
header, the drawer, the footer and the sitemap together.

> We have no team to show. Drop the "meet the team" band from the homepage.

> Turn the blog on — here is the first post.

> Put a spring promotion on the site: $4,000 off any TRU home through 30
> April, and say so in the banner under the hero.

> Move the testimonials above the homes on the front page.

> We do not want a blog, a build-a-home wizard or an offers page. Take all
> three off.

> Add a campaign page at /p/crossmod for the CrossMod homes — same front
> page, just those homes in the listings band.

## Homes

The catalogue is every plan Pine Grove Homes and Pleasant Valley Homes
publish — 348 of them, imported straight from the manufacturers' own sites,
so every spec on this site can be checked against the page it came from.
Almost all of them read "Available to order", because that is what they are:
homes NERTO builds for you. The four standing on River Road read "On our
lot".

> The G-3465 on the lot is the standard one, not the NETR. Fix it.

> We have taken delivery of a second G-3002. Put it on the lot too.

> Mark ZK-1100 as sale pending.

> Pine Grove has added new plans. Re-import the catalogue.

> We have stopped carrying the Pleasant Valley ADUs. Drop them.

If a spec looks wrong, say so and it gets checked against the manufacturer's
own page rather than patched — if their sheet says something different, the
importer is fixed so the correction survives the next re-import.

## Past projects

Homes NERTO has actually delivered and set, as against plans it could build.
This is the evidence behind the turnkey claim, and it ships empty — nothing
appears until there is something real to show.

> Here are photos from the Windsor job. Make it a project: 2025, we found the
> land, pulled the permits, did the septic and the foundation, set a NETR
> G-3157. Write it up.

> Add the Litchfield project and quote the Hargreaves on it.

> Put past projects in the main header, not the drawer.

## Videos

The explainers — how the process works, construction loan versus end loan,
what site work involves. Also ships empty. YouTube and Vimeo links both work,
and nothing loads from either until a visitor presses play.

> Add these four YouTube videos. The first two are about our process, the
> third is construction loans versus the end loan, the fourth is site work.

> Turn the videos page on and put it in the header.

## Prices and copy

> Drop The Alder to $179,900 and show the old price struck through.

> Mark The Juniper as sale pending.

> Add a new home: The Sitka, Cottage series, model CT-1648, $142,500, 2 bed
> 1 bath, 768 sq ft, single-section 16 × 48, coastal style, at Harbor Light.
> Write the tagline and story to match the voice of the others.

> The Alder's primary bedroom should be 15 × 17, not 17 × 17 — fix the floor
> plan and any copy that quotes the old number.

> Retire The Cedar. Remove it from the catalogue.

> Every Estate home should list a three-car detached garage option under
> features.

## Pictures

Put the image files anywhere in the repo — or drag them into the chat — and
say where they go.

> Here are six photos of The Alder. Wire them up as its gallery: exterior,
> living, kitchen, bedroom, bath, porch.

> Replace the homepage hero photo with this one and rewrite the alt text.

> Use this photo for Cedar Hollow on the communities page.

> Put a real photo behind the financing page header.

The site shows photographs and nothing else. Photographs can arrive one at a
time: anything without one holds its space with an empty plate saying a
photograph is to come, so nothing is ever pictured that does not exist.

## Land and home prices

`/land-deals` is a map of every county you deliver to, each shaded and
labelled with what it takes to get into a home there on land the buyer owns.
Every figure on it comes from `lib/land/areas.ts`.

> Marion County is $1,499 a month now, and lots there are running $35k to
> $70k.

> Drop Volusia — we don't deliver that far any more.

> Add Alachua's neighbour Putnam back at $1,340 with 1/4 to 1 acre lots.

> Rates moved. Re-estimate every county at 25% down and update the
> assumptions line under the map to match.

> Here are our numbers for Kennebec, Somerset, Waldo and Lincoln. Put them on
> the map and switch `/land-deals` back on.

That last one is the big one, and it is the state this site is in: the map's
geography is already Chelsea and the county boundaries are already Maine and
its neighbours, but no county is priced, so the page is switched off. It
comes back on the moment you supply real payments and lot prices. Nobody will
invent them for you.

> Send the pre-approval form to our CRM.

The pre-approval form is already wired to a Server Action: set
`LEAD_WEBHOOK_URL` and every lead is posted to it as JSON. Until then leads
are logged to the server console rather than dropped.

## Brand and copy

> We're now Cascade Modular Homes, (541) 555-0199, 200 Industrial Way, Bend
> OR 97702. Change it everywhere.

> Make the accent colour a deep teal instead of the orange, in both light and
> dark themes.

> Rewrite the homepage hero headline and subhead to lead with the 11-week
> build time.

> Send the enquiry form to our HubSpot endpoint instead of resolving locally.

## Before it goes live

The template ships as Hearthline Home Co. — an invented dealership, with an
invented founder, an invented set crew and invented warranty terms. That is
what makes the demo feel like a real business rather than a wireframe, and it
is exactly what must not survive to a real one. Published unchanged, those
lines are not merely generic; they are false statements about your staff,
your trading history and what your price includes.

**This deployment is past that point.** `lib/site.ts` and `lib/company.ts`
carry NERTO's own published details — the licence number, the two promises in
the hero, the New England Rent To Own story, the three service cards from the
About page, and the Google listing the reviews live on. Everything NERTO does
not publish is deleted rather than guessed at: no founding year, no
headcount, no named staff, no warranty term, no deposit schedule. Add one
only from something the business has actually put in writing.

Everything of that kind lives in `lib/company.ts`, and every field in it is
optional. Whatever you can fill in from what the business already says about
itself, fill in. Everything else, delete — the page hides the section rather
than leaving a stranger's version of it. A dealership that publishes nothing
about its staff simply has no team section, and the About page renumbers
itself and reads fine.

> Here's the client's current site. Pull across whatever they say about
> themselves — years in business, staff, what's included in the price — and
> delete anything in `lib/company.ts` they don't publish.

> We don't offer a structural warranty. Take that claim off the site.

> Drop the team section — they don't want staff named.

Run `npm run check:placeholders` to see what is still Hearthline. It lists
findings and passes while you are working locally, and fails the build once
`NEXT_PUBLIC_SITE_URL` points at a real domain, so a site cannot go out with
the fiction still on it. It currently reports clean.

One thing on `/land-deals` belongs in this list too: the counties, the
payments and the lot prices on that map are one dealership's market. They are
not placeholders you can leave in — which is why there are none, and why the
page is off.

The photographs are the outstanding item. The page heroes are stock pictures
of manufactured homes, not of the yard on River Road, and the footer says so
in as many words. Photograph the lot, drop the files under `public/photos`,
repoint the keys in `lib/photos.ts` and delete that footer paragraph.

What does *not* need *correcting*: the HUD Code history, the chattel-versus-
mortgage numbers, the titling explanation and the buyer's order of operations
on `/why-manufactured`, `/financing` and `/start-here`. Those are true of
manufactured housing in any market. Making them read like this dealership
rather than like the template is a separate job — next section.

## Selling it more than once

Around 4,800 words on `/`, `/why-manufactured`, `/start-here`,
`/land-deals` and `/financing` are the template's own writing, and they ship identically every
time. For the first site that is invisible. For the second one in the same
market it is a real problem: a competitor reads the same paragraphs, a buyer
comparing two tabs sees them, and Google picks one site to rank for that copy
and quietly discounts the other.

```bash
npm run check:boilerplate   # how much is still the template's words
```

A fresh clone reports 100%. Under 25% is a properly rewritten site.

> Rewrite the editorial copy in this client's voice — here are three pages
> from their current site. Keep the argument and the locked facts.

> Fill in `lib/market.ts` for Pierce County, Washington and work the local
> specifics into the financing and start-here copy.

> These two clients are both in Tampa. Make sure their sites don't share
> paragraphs.

The rules for that pass — which facts may never move, which beats must
survive, what a good rewrite looks like versus a thesaurus pass — are in the
`voice` skill, and a session picks it up on its own from a request like the
ones above. The short version: the HUD Code dates and the chattel rate gap
are checkable facts and must survive in substance; the argument's structure
is the template's actual value and must survive too; the sentences carrying
them are what gets rewritten. Filling in `lib/market.ts` is the cheapest real
differentiation, because a page that knows the buyer's wind zone and their
state's titling rule is both unique and more useful than the generic one.

## Bigger asks

> Add a "Land & site work" page explaining what buyers pay for beyond the
> home, in the same voice as the financing page, and link it from the nav.

> The comparison table on /why-manufactured is out of date — update the
> site-built column and say what you changed.

## What to expect back

A session should run `npm run lint` and `npm run build` before telling you it
is done, and say plainly if either failed. If you want to see the change,
`npm run dev` and open http://localhost:3000.

If a request is ambiguous in a way that changes the outcome — which of two
homes, whether a price drop should show a strikethrough — expect a question
rather than a guess.

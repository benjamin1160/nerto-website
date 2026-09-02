---
name: land-deals
description: Edit the land-and-home price map at /land-deals — county pricing and starting payments, lot price ranges, the delivery radius, which counties are served, the payment assumptions and disclaimer, the shading scale, and where the pre-approval form sends its leads. Use for any request about the map, a county, a monthly payment shown on it, the service area, or land prices.
---

# The land-and-home map

`/land-deals` argues one thing in one order: here is what your county costs →
land and home are financed as a single loan → but the parcel has to be chosen
before the deal can be built → so get pre-approved first. The map is the page;
everything under it supports the map.

## Where the numbers live

| File | What it holds |
| --- | --- |
| `lib/land/areas.ts` | Every county: starting payment, lot price range, parcel size, the line of local context, and `PAYMENT_ASSUMPTIONS` |
| `lib/land/geo.ts` | `HQ` (the lot's coordinates), `SERVICE_RADIUS_MI`, the projection, the drawn window |
| `lib/land/county-shapes.generated.ts` | County boundaries as SVG paths. **Generated — never edit by hand** |
| `lib/land/map-shapes.ts` | Interstates, traced roughly through major exits |
| `lib/land/static-map.ts` | The flat SVG the social card draws, with literal colours |
| `app/land-deals/actions.ts` | The pre-approval Server Action and its webhook |

Adding, repricing or removing a county is a change to `lib/land/areas.ts` and
nothing else: the map, the legend, the detail card, the county list, the FAQ's
land-price sentence, the JSON-LD and the social image all read from it.

Mileage is never typed in. It is computed from the county's coordinates with a
great-circle formula, so it cannot drift out of sync with the map.

A county in `areas.ts` only appears on the map if its `slug` also appears in
the generated shapes file. Adding a county that has never been priced before
means regenerating (below), or it gets a marker and no shading.

## The payment assumptions

`PAYMENT_ASSUMPTIONS` is printed under the map and again in the page's
disclaimer, and it is what keeps every figure on the page honest. Change a
rate, a term or a down payment in the estimates and change that sentence in
the same edit. Payments are estimates for comparing areas — never write copy
that presents one as an offer to lend or a quote.

## Moving to another market

`HQ` is the NERTO lot on River Road in Chelsea, Maine, and the boundaries in
`county-shapes.generated.ts` are Maine, New Hampshire, Vermont and
Massachusetts. No county is priced, so `landDeals` is `false` in
`lib/page-config.ts` — add areas below and flip it.

County pricing is market data in exactly the sense of `lib/market.ts`: true
of one delivery radius and of no other. Moving this site to another market
means all of:

1. Move `HQ` in `lib/land/geo.ts` to the dealership's actual lot — it must be
   the address in `lib/site.ts`.
2. Replace the counties in `lib/land/areas.ts` with the ones actually
   delivered to, with that market's real payments and lot prices.
3. Update `STATES`, `PRICED` and the window in
   `scripts/generate-county-shapes.py`, then regenerate:

   ```bash
   curl -o counties.json \
     https://raw.githubusercontent.com/plotly/datasets/master/geojson-counties-fips.json
   python3 scripts/generate-county-shapes.py counties.json
   ```

4. Retrace `HIGHWAYS` in `lib/land/map-shapes.ts`, or empty the array — a map
   with another state's interstates on it is worse than a map with none.
5. Check `VIEW` in `geo.ts` still frames the radius, and the `GEORGIA` label
   in `components/land-map.tsx` still names the right neighbour.

Do not leave one market's counties on another market's site. Prices you
cannot source are not to be invented: drop the county instead.

## Colour

The five-step shading scale is `--land-tier-1` … `--land-tier-5` in
`app/globals.css`, light and dark, with `--land-water`, `--land-unserved`,
`--land-outside` and `--land-price` alongside them. The ramp is weighted
toward the cheapest band on purpose — the counties a shopper can afford are
the ones that should carry weight — and the legend states the direction.

Custom properties do not resolve inside SVG presentation attributes, so the
map applies them through `style`. The social image cannot read them at all:
`lib/land/static-map.ts` carries the dark values as literals, and they have to
be changed in both places or the card drifts from the site.

## Where the leads go

The pre-approval form posts to a Server Action, not to the local-resolve stub
that `components/inquiry-form.tsx` uses. Set `LEAD_WEBHOOK_URL` and each lead
is forwarded as JSON to the CRM; without it the lead is validated and logged
to the server console, so nothing is lost while the integration is wired up.

## Before finishing

`npm run lint` and `npm run build`. Check the map in both themes — the toggle
is in the header — and confirm the legend, the price labels and the county
list still read at mobile width.

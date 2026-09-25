# Connecting a site to the platform

**The short version.** On the platform, set the account's `home_list` tool
Website URL to this site's address, such as `https://www.newenglandrenttoown.com`.
That is all. The AI reads the site's own API at `/api/listings` whenever a
buyer asks about homes, so it offers what the site shows: the lot homes
first, sold homes never, prices where the site has them, and a link and a
photo for each. Change a home on the site, deploy, and the AI knows. See
[The catalogue endpoint](#the-catalogue-endpoint).

The rest of this page covers the other direction, which is optional: the
platform pushing inventory INTO the site.

A site built from this template can take its inventory from the platform
instead of from this repository. This page is the contract between the two.
Everything in it is optional for the site: with nothing configured, it builds
from `lotState` in `lib/homes.ts` exactly as it always has.

There are three pieces, and the site already does its two:

| Direction | What | Who builds it |
| --- | --- | --- |
| platform → site | **The feed.** JSON the site fetches before every build. | The platform serves it. The site reads it (`scripts/sync-listings.mjs`). |
| platform → host | **A rebuild.** A POST to the host's deploy hook when inventory changes. | The platform. |
| site → platform | **The catalogue.** `GET /api/listings` on the site, so the platform knows which plans the site carries and whether a deploy took. | The site (`app/api/listings/route.ts`). |

## Setup, per site

1. On the host (Vercel → Project → Settings → Environment Variables), set:
   - `LISTINGS_FEED_URL` — this site's feed on the platform.
   - `LISTINGS_FEED_TOKEN` — optional; sent as `Authorization: Bearer …`.
2. Create a deploy hook (Vercel → Project → Settings → Git → Deploy Hooks)
   and give its URL to the platform. The platform POSTs to it whenever this
   site's inventory changes.
3. Redeploy once. `GET https://<site>/api/listings` should now say
   `"inventory": { "source": "feed", … }`.

## The feed

`GET LISTINGS_FEED_URL` returns the JSON below. The prices, photo URL and
pre-owned home in it are made up to show the shape. Only the plan slugs are
real.

```json
{
  "version": 1,
  "updatedAt": "2026-09-25T12:00:00Z",
  "listings": [
    {
      "slug": "netr-g-3157",
      "status": "available",
      "onLot": true,
      "featured": true,
      "price": 129900,
      "photos": [
        { "kind": "exterior", "url": "https://cdn.example.com/lot/3157-front.jpg", "caption": "On the lot" }
      ]
    },
    { "slug": "zk-1100", "status": "sold" },
    {
      "slug": "used-1998-fleetwood",
      "name": "1998 Fleetwood (pre-owned)",
      "beds": 3, "baths": 2, "sqft": 1216,
      "sections": "double",
      "price": 42000,
      "onLot": true
    }
  ]
}
```

**The feed is the whole truth about lot state.** While a feed is connected,
`lotState` in `lib/homes.ts` is ignored. A catalogue plan the feed does not
mention is "Available to order". A home the platform marks sold stays sold.
To take a home off the lot, change it in the feed or leave it out.

**Two kinds of entry, told apart by the slug:**

- **A slug that is a plan in the site's catalogue.** The entry is laid over
  that plan. Send only what the platform decides, such as status, price,
  on-lot and photos. The manufacturer's facts come from the plan. Get the
  valid slugs from the site's `/api/listings`, where these are `"kind": "plan"`.
- **Any other slug.** This is a home in its own right, such as a pre-owned
  home or a spec build. It needs `name`, `beds`, `baths` and `sqft`, or it is
  dropped. It gets its own page at `/listings/<slug>`.

Slugs are lowercase letters, digits and single hyphens, at most 80 characters.

### Fields

Every field except `slug` is optional. An unknown field, or a value outside
the vocabulary, is dropped with a warning in the build log.

| Field | Type |
| --- | --- |
| `slug` | string, required |
| `status` | `available` · `to-order` · `pending` · `sold` · `coming-soon`. It defaults to `to-order` for a plan and `available` for a home of its own. |
| `onLot` | boolean. Standing on the lot and open to walk through. |
| `featured` | boolean. Surfaced on the landing page. |
| `price`, `wasPrice` | number, whole dollars. `wasPrice` shows struck through and must be above `price`. Leave `price` out to show "call for pricing". |
| `daysListed` | number. Drives the "new" badge. |
| `tourUrl` | https URL. A Matterport link embeds; anything else becomes a link. |
| `name`, `builder`, `series`, `model`, `dimensions`, `tagline` | string |
| `beds`, `baths`, `sqft`, `widthFt`, `lengthFt`, `year`, `hers` | number |
| `construction` | `manufactured` · `modular` |
| `sections` | `single` · `double` · `triple` |
| `style` | `farmhouse` · `craftsman` · `modern` · `coastal` · `lodge` · `ranch` |
| `story` | string[], paragraphs |
| `highlights` | string[] |
| `photos` | `{ kind, url, caption? }[]`, at most one per `kind`. `kind` is `exterior` · `living` · `kitchen` · `bedroom` · `bath` · `porch`. |

Photos are downloaded at build time into `public/photos/feed/`, so the site
serves its own copies. The platform's storage can be anywhere public over
https, and it only has to serve JPEG, PNG, WebP or AVIF, 15 MB or less. A
feed photo replaces the catalogue's photo of the same kind.

### Failure policy

- The feed cannot be reached, is not JSON, or is not `version: 1`: **the
  build fails** and the last good deploy stays live.
- One bad home, field or photo is dropped with a warning, and the rest goes
  live.
- `"listings": []` is valid and means nothing is on the lot.

Try a payload before the platform serves it:

```sh
LISTINGS_FEED_URL=file:///abs/path/feed.json npm run sync:listings:check
```

## The catalogue endpoint

`GET https://<site>/api/listings` is public and CORS-open. It is rebuilt with
every deploy.

```json
{
  "version": 1,
  "site": { "name": "NERTO Homes", "url": "https://www.newenglandrenttoown.com" },
  "builtAt": "…",
  "inventory": { "source": "feed", "feedHost": "…", "fetchedAt": "…", "updatedAt": "…" },
  "count": 349,
  "listings": [
    { "slug": "netr-g-3157", "url": "https://…/listings/netr-g-3157", "kind": "plan",
      "name": "NETR G-3157", "status": "available", "statusLabel": "…", "onLot": true,
      "featured": true, "price": 129900, "builder": "Pine Grove Homes", "construction": "manufactured",
      "series": "NETR", "model": "NETR G-3157", "beds": 3, "baths": 2, "sqft": 1280, "sections": "double",
      "widthFt": 27, "lengthFt": 48, "description": null,
      "photo": "https://…/photos/homes/netr-g-3157/exterior.webp", "tourUrl": "…",
      "sourceUrl": "https://www.pinegrovehomes.com/ranch-homes/netr-g-3157" }
  ]
}
```

Use it for three things:

- **The AI's inventory.** Give the platform the site's address as the
  `home_list` website URL and nothing else. The tool reads this endpoint
  first (`lib/scrape/site-api.ts` in the platform): homes on the lot are
  offered first, sold homes never, and a plan built to order is described
  as one. No BuildShip flow, sheet or scrape is involved.
- **Offering choices.** It gives the platform's AI and its admin screens the
  plans this site can put on its lot, each with a link to its page.
- **Checking a deploy.** Compare `inventory.updatedAt` with the platform's own
  timestamp. When they match, the change is live.

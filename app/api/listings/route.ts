import { listings, statusLabels } from "@/lib/homes";
import { inventory } from "@/lib/inventory.generated";
import { site } from "@/lib/site";
import { catalogue } from "@/lib/catalogue.generated";
import { photoFor } from "@/lib/photos";

/**
 * The site's catalogue as JSON, for the platform.
 *
 * The platform reads this to learn which slugs this site knows — the plans a
 * feed entry can be laid over — and to confirm a deploy took: `inventory`
 * says whether the build ran from the feed or from `lotState`, and when the
 * feed was fetched. The contract is in `PLATFORM.md`.
 *
 * It is also the dealer's inventory API: the AI platform's `home_list` tool
 * reads it from nothing but the site's address, so this is what the AI
 * offers a buyer. Change what it returns and you change what the AI says.
 *
 * Built once per deploy as a static file, like every page it describes.
 * Nothing here is private — it is what `/listings` already shows — so any
 * origin may read it. A plain GET needs no preflight, so there is no OPTIONS
 * handler; one would make the route dynamic.
 */
export const dynamic = "force-static";

const CORS = { "Access-Control-Allow-Origin": "*" };

const planSlugs = new Set(catalogue.map((e) => e.slug));

/* The card's photograph, as an absolute URL an AI can text to a buyer. The
   floor-plan drawing is not a photograph and is never offered as one. */
const coverPhoto = (slug: string, kind = "exterior") => {
  const src = photoFor(`${slug}/${kind}`);
  return src ? new URL(src, site.url).href : null;
};

export function GET() {
  return Response.json(
    {
      version: 1,
      site: { name: site.name, url: site.url },
      builtAt: new Date().toISOString(),
      inventory: inventory
        ? {
            source: "feed",
            feedHost: inventory.source,
            fetchedAt: inventory.fetchedAt,
            updatedAt: inventory.updatedAt ?? null,
          }
        : { source: "lotState" },
      count: listings.length,
      listings: listings.map((l) => ({
        slug: l.slug,
        url: `${site.url}/listings/${l.slug}`,
        /* A plan from the manufacturers' catalogue, or a home the feed added. */
        kind: planSlugs.has(l.slug) ? "plan" : "feed",
        name: l.name,
        status: l.status,
        statusLabel: statusLabels[l.status],
        onLot: l.onLot ?? false,
        featured: l.featured ?? false,
        price: l.price ?? null,
        builder: l.builder ?? null,
        construction: l.construction ?? null,
        series: l.series ?? null,
        model: l.model ?? null,
        beds: l.beds,
        baths: l.baths,
        sqft: l.sqft,
        sections: l.sections ?? null,
        widthFt: l.widthFt ?? null,
        lengthFt: l.lengthFt ?? null,
        description: l.tagline ?? null,
        photo: coverPhoto(l.slug, l.scenes[0]?.kind),
        tourUrl: l.tourUrl ?? null,
        sourceUrl: l.sourceUrl ?? null,
      })),
    },
    { headers: CORS },
  );
}

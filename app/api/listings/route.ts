import { listings, statusLabels } from "@/lib/homes";
import { inventory } from "@/lib/inventory.generated";
import { site } from "@/lib/site";
import { catalogue } from "@/lib/catalogue.generated";

/**
 * The site's catalogue as JSON, for the platform.
 *
 * The platform reads this to learn which slugs this site knows — the plans a
 * feed entry can be laid over — and to confirm a deploy took: `inventory`
 * says whether the build ran from the feed or from `lotState`, and when the
 * feed was fetched. The contract is in `PLATFORM.md`.
 *
 * Built once per deploy as a static file, like every page it describes.
 * Nothing here is private — it is what `/listings` already shows — so any
 * origin may read it. A plain GET needs no preflight, so there is no OPTIONS
 * handler; one would make the route dynamic.
 */
export const dynamic = "force-static";

const CORS = { "Access-Control-Allow-Origin": "*" };

const planSlugs = new Set(catalogue.map((e) => e.slug));

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
        tourUrl: l.tourUrl ?? null,
        sourceUrl: l.sourceUrl ?? null,
      })),
    },
    { headers: CORS },
  );
}

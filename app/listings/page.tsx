import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ListingCard } from "@/components/listing-card";
import { ListingsBrowser } from "@/components/listings-browser";
import { PageHero } from "@/components/page-hero";
import { Container } from "@/components/ui";
import { hasPrices, listings, priceBounds } from "@/lib/homes";
import { money } from "@/lib/format";
import { site } from "@/lib/site";
import { pages } from "@/lib/page-config";

export const metadata: Metadata = {
  title: "Homes for sale",
  description:
    "Every Clayton-built plan on the lot in Maryville, Tennessee — twenty of them, with full specs, model codes and the source sheet each one was read from.",
};

/** Rendered into the initial HTML while the filter UI hydrates. */
function BrowserFallback() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {listings.slice(0, 6).map((l) => (
        <ListingCard key={l.slug} listing={l} className="h-full" />
      ))}
    </div>
  );
}

export default function HomesPage() {
  /* Turned off in `lib/page-config.ts`, this route sends visitors home rather
     than 404ing — an indexed link or a printed card outlives the switch. */
  if (!pages.listings) redirect("/");

  return (
    <>
      <PageHero
        photoKey="page/homes"
        index="01"
        eyebrow={`${listings.length} homes · ${site.address.city}, ${site.address.region}`}
        title={
          <>
            Every plan we build,
            <br />
            with nothing hidden.
          </>
        }
        lede={
          hasPrices
            ? `Full specs, honest status. From ${money(priceBounds.min)} to ${money(priceBounds.max)}, and you can walk most of them this week.`
            : `Twenty Clayton plans, single-section to 32 feet wide. Pricing depends on options, delivery distance and site work, so we quote it — and you can walk most of these this week.`
        }
        kind="exterior"
        breadcrumb={[
          { href: "/", label: "Home" },
          { href: "/listings", label: "Homes" },
        ]}
      />

      <Container className="py-14 sm:py-20">
        <Suspense fallback={<BrowserFallback />}>
          <ListingsBrowser listings={listings} />
        </Suspense>
      </Container>
    </>
  );
}

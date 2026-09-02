import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ListingCard } from "@/components/listing-card";
import { ListingsBrowser } from "@/components/listings-browser";
import { PageHero } from "@/components/page-hero";
import { ButtonLink, Container } from "@/components/ui";
import { hasPrices, listings, priceBounds } from "@/lib/homes";
import { money } from "@/lib/format";
import { site } from "@/lib/site";
import { pages } from "@/lib/page-config";

export const metadata: Metadata = {
  title: "Homes for sale",
  description:
    "Mobile and modular homes from NERTO Homes in Chelsea, Maine — sizes, specs and what it takes to put one on your land.",
};

/**
 * Rendered into the initial HTML while the filter UI hydrates.
 *
 * `ListingsBrowser` reads the query string, so it renders on the client and
 * this is what a crawler and a slow connection actually get. With an empty
 * catalogue that has to be the same "nothing listed yet" card the browser
 * shows, not an empty grid.
 */
function BrowserFallback() {
  if (listings.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line-strong px-8 py-24 text-center">
        <p className="font-display text-3xl tracking-tight text-ink">
          Nothing listed online yet.
        </p>
        <p className="mx-auto mt-4 max-w-md text-muted">
          We are not publishing inventory on this site at the moment. Tell us the size, the
          budget and where the home is going, and we will tell you what we can put on it.
        </p>
        <ButtonLink href="/contact" className="mt-8">
          Tell us what you&apos;re after
        </ButtonLink>
      </div>
    );
  }
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
        eyebrow={
          listings.length
            ? `${listings.length} homes · ${site.address.city}, ${site.address.region}`
            : `${site.address.city}, ${site.address.region}`
        }
        title={
          <>
            Every home we sell,
            <br />
            with nothing hidden.
          </>
        }
        lede={
          !listings.length
            ? `We are not listing inventory online yet. Tell us the size, the budget and where the home is going, and we will tell you what we can put on it — call ${site.phone} or send the form on the contact page.`
            : hasPrices
              ? `Full specs, honest status. From ${money(priceBounds.min)} to ${money(priceBounds.max)}, and you can walk most of them this week.`
              : `Full specs, honest status. Pricing depends on options, delivery distance and site work, so we quote it rather than print it.`
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

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Accordion } from "@/components/accordion";
import { FloorPlan } from "@/components/floor-plan";
import { Gallery } from "@/components/gallery";
import { InquiryForm } from "@/components/inquiry-form";
import { ListingCard, SpecStrip } from "@/components/listing-card";
import { PaymentCalculator } from "@/components/payment-calculator";
import { Reveal } from "@/components/reveal";
import { SaveButton } from "@/components/saved-homes";
import {
  Badge,
  ButtonLink,
  Container,
  cx,
  Eyebrow,
  Icon,
  SectionHeading,
  SpecRow,
} from "@/components/ui";
import { getCommunity } from "@/lib/communities";
import { feetInches, money, num, priceText, PRICE_ON_REQUEST } from "@/lib/format";
import {
  getListing,
  getPlan,
  listings,
  relatedListings,
  sectionLabels,
  seriesLabel,
  statusLabels,
  styleLabels,
} from "@/lib/homes";
import { photoFor } from "@/lib/photos";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return listings.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata(
  props: PageProps<"/listings/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const listing = getListing(slug);
  if (!listing) return { title: "Home not found" };

  const build = listing.sections ? ` ${sectionLabels[listing.sections].toLowerCase()}` : "";
  const price = listing.price === undefined ? PRICE_ON_REQUEST : `from ${money(listing.price)}`;
  const description = [
    `${listing.beds} bed, ${listing.baths} bath, ${num(listing.sqft)} sq ft${build} manufactured home — ${price}.`,
    listing.tagline,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    title: `${listing.name} — ${priceText(listing.price)}`,
    description,
    alternates: { canonical: `/listings/${listing.slug}` },
    openGraph: {
      title: `${listing.name} · ${site.short}`,
      description,
      url: `/listings/${listing.slug}`,
      type: "article",
    },
  };
}

export default async function ListingPage(props: PageProps<"/listings/[slug]">) {
  const { slug } = await props.params;
  const listing = getListing(slug);
  if (!listing) notFound();

  const plan = getPlan(listing);
  const hasPhotos = listing.scenes.some((scene) =>
    photoFor(`${listing.slug}/${scene.kind}`),
  );
  /* Section numbering has to survive a missing section. Most homes in this
     catalogue carry no floor-plan geometry and no feature list, so hardcoded
     eyebrows would read 01, 04, 05 down the page. This counts as the page
     renders instead — the same trick `/about` uses. */
  let n = 1;
  const index = () => String(n++).padStart(2, "0");
  const community = listing.communitySlug ? getCommunity(listing.communitySlug) : undefined;
  const related = relatedListings(listing);
  const perSqFt = listing.price === undefined ? undefined : listing.price / listing.sqft;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SingleFamilyResidence",
    name: listing.name,
    description: listing.tagline,
    numberOfRooms: listing.beds,
    numberOfBathroomsTotal: listing.baths,
    floorSize: { "@type": "QuantitativeValue", value: listing.sqft, unitCode: "FTK" },
    address: {
      "@type": "PostalAddress",
      addressLocality: community?.city ?? site.address.city,
      addressRegion: community?.state ?? site.address.region,
      addressCountry: "US",
    },
    offers: {
      "@type": "Offer",
      /* Omitted rather than zeroed when the home is priced on enquiry:
         a structured-data price of 0 is a lie search engines will repeat. */
      ...(listing.price === undefined
        ? {}
        : { price: listing.price, priceCurrency: "USD" }),
      availability:
        listing.status === "available"
          ? "https://schema.org/InStock"
          : listing.status === "sold"
            ? "https://schema.org/SoldOut"
            : "https://schema.org/PreOrder",
      seller: { "@type": "Organization", name: site.name },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Container className="pb-16 pt-10 sm:pt-12">
        {/* ---------------- Header ---------------- */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex flex-wrap items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted">
            {[
              { href: "/", label: "Home" },
              { href: "/listings", label: "Homes" },
              { href: `/listings/${listing.slug}`, label: listing.name },
            ].map((b, i) => (
              <li key={b.href} className="flex items-center gap-2">
                {i > 0 && <Icon.Chevron className="size-3" />}
                <Link href={b.href} className="transition-colors hover:text-ink">
                  {b.label}
                </Link>
              </li>
            ))}
          </ol>
        </nav>

        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              {/* "On our lot" is the strongest thing this page can say, so it
                  leads. Everything else in the catalogue is a plan NERTO
                  orders in, which the status badge says plainly. */}
              {listing.onLot ? (
                <Badge tone="ember">On our lot — walk through it</Badge>
              ) : (
                <Badge tone={listing.status === "available" ? "ember" : "neutral"}>
                  {statusLabels[listing.status]}
                </Badge>
              )}
              {listing.series && <Badge>{seriesLabel(listing.series)}</Badge>}
              {listing.model && <Badge tone="muted">{listing.model}</Badge>}
              {listing.daysListed !== undefined && listing.daysListed <= 10 && (
                <Badge tone="moss">New this week</Badge>
              )}
            </div>

            <h1 className="mt-6 font-display text-display text-balance text-ink">
              {listing.name}
            </h1>
            {listing.tagline && (
              <p className="mt-5 max-w-2xl text-xl leading-relaxed text-muted">
                {listing.tagline}
              </p>
            )}
          </div>

          <div className="shrink-0 lg:text-right">
            <p className="eyebrow lg:justify-end">
              {listing.price === undefined ? "Pricing" : "Sticker"}
            </p>
            <p
              className={cx(
                "mt-3 font-display leading-none tracking-tight text-ink",
                listing.price === undefined ? "text-3xl sm:text-4xl" : "text-5xl",
              )}
            >
              {priceText(listing.price)}
            </p>
            {perSqFt === undefined ? (
              <p className="mt-2 font-mono text-sm text-muted">
                Quoted on enquiry — call {site.phone}
              </p>
            ) : (
              <p className="mt-2 font-mono text-sm text-muted">
                {listing.wasPrice && (
                  <span className="mr-2 line-through">{money(listing.wasPrice)}</span>
                )}
                {money(perSqFt)} / sq ft
              </p>
            )}
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4 border-y border-line py-5">
          <SpecStrip listing={listing} />
          <span className="flex items-center gap-1.5 text-[0.8rem] text-muted">
            <Icon.Pin className="size-3.5" />
            {/* Where you would go to see it — which has to agree with the
                badge above rather than repeating the status back differently. */}
            {listing.onLot
              ? `On our lot · ${site.address.city}, ${site.address.region}`
              : community
                ? `${community.name} · ${community.city}, ${community.state}`
                : "Built to order"}
          </span>
          {listing.hers !== undefined && (
            <span className="flex items-center gap-1.5 text-[0.8rem] text-muted">
              <Icon.Leaf className="size-3.5" />
              HERS {listing.hers}
            </span>
          )}
          {listing.tourUrl && (
            <a
              href={listing.tourUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-[0.8rem] text-ember underline-offset-4 hover:underline"
            >
              <Icon.Arrow className="size-3.5" />
              3D walkthrough
            </a>
          )}
          <div className="ml-auto">
            <SaveButton slug={listing.slug} name={listing.name} variant="inline" />
          </div>
        </div>

        {/* ---------------- Gallery + rail ---------------- */}
        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1.62fr)_minmax(0,1fr)] lg:gap-14">
          <div className="min-w-0">
            {/* The gallery only earns its space when there are photographs.
                Most plans in this catalogue have none, and for those the
                floor-plan section below leads instead — one labelled drawing
                rather than a grey plate above a drawing. */}
            {hasPhotos && (
              <Gallery
                scenes={listing.scenes}
                name={listing.name}
                slug={listing.slug}
              />
            )}

            {/* Story */}
            {listing.story && listing.story.length > 0 && (
            <div className="mt-14">
              <Eyebrow index={index()}>About this home</Eyebrow>
              <div className="mt-6 space-y-6">
                {listing.story.map((p, i) => (
                  <p
                    key={i}
                    className={
                      i === 0
                        ? "font-display text-2xl leading-snug tracking-tight text-ink"
                        : "text-lg leading-relaxed text-muted"
                    }
                  >
                    {p}
                  </p>
                ))}
              </div>

              {listing.highlights && (
                <ul className="mt-10 grid gap-4 sm:grid-cols-2">
                  {listing.highlights.map((h) => (
                    <li key={h} className="flex gap-3 rounded-xl border border-line bg-surface p-4">
                      <Icon.Check className="mt-0.5 size-4 shrink-0 text-ember" />
                      <span className="text-[0.92rem] leading-relaxed text-ink-soft">{h}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            )}

            {/* Floor plan — the manufacturer's own drawing.
                This is a drawing, not a photograph, and is labelled as one:
                it renders on white with a caption naming its source, and it
                never fills a photograph's slot in the gallery above. Shown
                only when there is no generated plan, which is the case for
                every imported home. */}
            {!plan && listing.planImage && (
              <div className="mt-16" id="floor-plan">
                <Eyebrow index={index()}>Floor plan</Eyebrow>
                <h2 className="mt-5 font-display text-title text-ink">
                  {listing.dimensions ?? `${num(listing.sqft)} sq ft`}
                  {listing.dimensions ? ` · ${num(listing.sqft)} sq ft` : ""}
                </h2>
                <p className="mt-4 max-w-xl leading-relaxed text-muted">
                  {listing.builder}&rsquo;s drawing for this plan. Interior walls
                  are not load-bearing above the marriage line, so most of them
                  can move before the build lock date — ask us what this one will
                  take.
                </p>
                <figure className="mt-8 overflow-hidden rounded-card border border-line bg-white p-4 sm:p-8">
                  <Image
                    src={listing.planImage}
                    alt={`${listing.name} floor plan, drawn by ${listing.builder}`}
                    width={1600}
                    height={1200}
                    sizes="(min-width: 1024px) 60vw, 100vw"
                    className="mx-auto h-auto w-full max-w-2xl"
                  />
                  <figcaption className="mt-4 text-center font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted">
                    Manufacturer&rsquo;s drawing · {listing.builder}
                  </figcaption>
                </figure>
              </div>
            )}

            {/* Floor plan */}
            {plan && (
            <div className="mt-16" id="floor-plan">
              <Eyebrow index={index()}>Floor plan</Eyebrow>
              <h2 className="mt-5 font-display text-title text-ink">
                {plan.width}′ × {plan.length}′ · {num(listing.sqft)} sq ft
              </h2>
              <p className="mt-4 max-w-xl leading-relaxed text-muted">
                Drawn to scale, with every room dimensioned. Interior walls are not
                load-bearing above the marriage line, so most of them can move before
                the build lock date.
              </p>
              <div className="mt-8 overflow-hidden rounded-card border border-line bg-surface p-4 text-ink sm:p-8">
                <FloorPlan
                  plan={plan}
                  label={`${listing.name} floor plan, ${plan.width} by ${plan.length} feet`}
                  className="mx-auto h-auto w-full max-w-2xl"
                />
              </div>

              <dl className="mt-8 grid gap-x-10 gap-y-1 sm:grid-cols-2">
                {plan.rooms
                  .filter((r) => !r.hideDims)
                  .map((r) => (
                    <SpecRow
                      key={r.name}
                      label={r.name}
                      value={`${feetInches(r.w)} × ${feetInches(r.h)}`}
                    />
                  ))}
              </dl>
            </div>
            )}

            {/* Features */}
            {listing.features && listing.features.length > 0 && (
            <div className="mt-16">
              <Eyebrow index={index()}>What&apos;s included</Eyebrow>
              <h2 className="mb-8 mt-5 font-display text-title text-ink">
                Standard, not &ldquo;available.&rdquo;
              </h2>
              <Accordion
                items={listing.features.map((group) => ({
                  title: group.group,
                  body: (
                    <ul className="grid gap-3 sm:grid-cols-2">
                      {group.items.map((item) => (
                        <li key={item} className="flex gap-2.5">
                          <Icon.Check className="mt-0.5 size-4 shrink-0 text-ember" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ),
                }))}
              />
            </div>
            )}
          </div>

          {/* Sticky rail */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="flex flex-col gap-6">
              <div className="rounded-card border border-line bg-surface p-6">
                <h2 className="eyebrow">Specification</h2>
                <dl className="mt-5">
                  {listing.model && <SpecRow label="Model" value={listing.model} />}
                  {listing.series && <SpecRow label="Series" value={listing.series} />}
                  {listing.sections && (
                    <SpecRow label="Sections" value={sectionLabels[listing.sections]} />
                  )}
                  {listing.style && <SpecRow label="Style" value={styleLabels[listing.style]} />}
                  <SpecRow label="Bedrooms" value={listing.beds} />
                  <SpecRow label="Bathrooms" value={listing.baths} />
                  <SpecRow label="Living area" value={`${num(listing.sqft)} sq ft`} />
                  {(listing.dimensions ??
                    (listing.widthFt !== undefined && listing.lengthFt !== undefined
                      ? `${listing.widthFt}′ × ${listing.lengthFt}′`
                      : undefined)) && (
                    <SpecRow
                      label="Box size"
                      value={
                        listing.dimensions ?? `${listing.widthFt}′ × ${listing.lengthFt}′`
                      }
                    />
                  )}
                  {listing.builder && <SpecRow label="Built by" value={listing.builder} />}
                  {listing.construction && (
                    <SpecRow
                      label="Built to"
                      value={
                        listing.construction === "modular"
                          ? "State building code (modular)"
                          : "HUD code (manufactured)"
                      }
                    />
                  )}
                  {listing.year !== undefined && (
                    <SpecRow label="Build year" value={listing.year} />
                  )}
                  {listing.hers !== undefined && (
                    <SpecRow label="HERS index" value={`${listing.hers} (lower is better)`} />
                  )}
                  <SpecRow
                    label="Price"
                    value={perSqFt === undefined ? PRICE_ON_REQUEST : money(listing.price!)}
                  />
                  {perSqFt !== undefined && (
                    <SpecRow label="Price per sq ft" value={money(perSqFt)} />
                  )}
                  <SpecRow label="Status" value={statusLabels[listing.status]} />
                </dl>

                <div className="mt-6 flex flex-col gap-2.5">
                  <ButtonLink href="#book" className="w-full !py-3.5">
                    Book a walkthrough
                    <Icon.Arrow className="size-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                  </ButtonLink>
                  <ButtonLink href="#payment" variant="outline" className="w-full !py-3.5">
                    Estimate the payment
                  </ButtonLink>
                </div>
              </div>

              {community && (
                <Link
                  href={`/communities#${community.slug}`}
                  className="group rounded-card border border-line bg-surface p-6 transition-colors hover:border-line-strong"
                >
                  <p className="eyebrow">Sited at</p>
                  <p className="mt-3 font-display text-2xl tracking-tight text-ink">
                    {community.name}
                  </p>
                  <p className="mt-1 font-mono text-xs text-muted">
                    {community.city}, {community.state} · {community.tenure}
                  </p>
                  <p className="mt-4 text-[0.9rem] leading-relaxed text-muted">
                    {community.blurb}
                  </p>
                  <span className="mt-5 flex items-center gap-1.5 text-[0.85rem] font-medium text-ink transition-colors group-hover:text-ember">
                    About this community
                    <Icon.Arrow className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </Link>
              )}
            </div>
          </aside>
        </div>
      </Container>

      {/* ---------------- Payment / enquiry ----------------
          The calculator needs a price to be worth anything. Where a home is
          quoted on enquiry the section becomes the enquiry itself rather
          than a calculator seeded with a made-up number. */}
      <section id="payment" className="scroll-mt-[calc(var(--chrome-h)+1.5rem)] border-y border-line bg-surface">
        <Container className="py-20 sm:py-24">
          <Reveal>
            <SectionHeading
              index={index()}
              eyebrow={listing.price === undefined ? "Pricing" : "The honest number"}
              title={
                listing.price === undefined
                  ? `Ask us what the ${listing.name.replace(/^The /, "")} costs.`
                  : `What the ${listing.name.replace(/^The /, "")} actually costs to live in.`
              }
              lede={
                listing.price === undefined
                  ? `Pricing depends on the options, the delivery distance and the site work, so we quote it rather than post a number that turns out to be wrong. Call ${site.phone} or send the form and we will put real figures against this plan.`
                  : "Move the sliders. The gap between the two loan types is the single most expensive decision in this whole process — bigger than the colour of the cabinets."
              }
            />
          </Reveal>
          <div
            className={cx(
              "mt-12 grid gap-8",
              listing.price !== undefined && "lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]",
            )}
          >
            {listing.price !== undefined && (
              <Reveal className="min-w-0">
                <PaymentCalculator price={listing.price} />
              </Reveal>
            )}
            <Reveal delay={120} className="min-w-0">
              <div id="book" className="scroll-mt-[calc(var(--chrome-h)+1.5rem)]">
                <InquiryForm defaultHome={listing.slug} />
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* ---------------- Related ---------------- */}
      <Container className="py-20 sm:py-24">
        <Reveal>
          <SectionHeading
            index={index()}
            eyebrow="Close to this one"
            title="If you like this, look at these."
            action={
              <ButtonLink href="/listings" variant="outline">
                All homes
                <Icon.Arrow className="size-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
              </ButtonLink>
            }
          />
        </Reveal>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((l, i) => (
            <Reveal key={l.slug} delay={i * 90}>
              <ListingCard listing={l} className="h-full" />
            </Reveal>
          ))}
        </div>
      </Container>
    </>
  );
}

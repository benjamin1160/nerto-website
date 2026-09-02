import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Accordion } from "@/components/accordion";
import { LandMap } from "@/components/land-map";
import { PreApprovalForm } from "@/components/pre-approval-form";
import { Reveal } from "@/components/reveal";
import {
  Badge,
  ButtonLink,
  Container,
  Eyebrow,
  Icon,
  Section,
  SectionHeading,
} from "@/components/ui";
import { money, shortMoney } from "@/lib/format";
import { AREAS, BY_PRICE, CHEAPEST, PAYMENT_ASSUMPTIONS } from "@/lib/land/areas";
import { HQ, SERVICE_RADIUS_MI } from "@/lib/land/geo";
import { site } from "@/lib/site";
import { pages } from "@/lib/page-config";

const CHEAPEST_LAND = [...AREAS].sort((a, b) => a.land.low - b.land.low)[0];
const DEAREST_LAND = Math.max(...AREAS.map((a) => a.land.high));

export const metadata: Metadata = {
  title: `Land + home prices near ${HQ.city}, county by county`,
  description: `What it takes to get into a home on land you own, in ${AREAS.length} counties within ${SERVICE_RADIUS_MI} miles of ${HQ.city}. Land and home financed as one loan, from ${money(
    CHEAPEST.startingPayment,
  )}/mo in ${CHEAPEST.county} County.`,
  alternates: { canonical: "/land-deals" },
};

/* The order the deal actually happens in, which is not the order buyers
   arrive in — they come with a floor plan and no parcel. */
const STEPS = [
  {
    n: "01",
    title: "Find your number",
    body: "Tap a county on the map. That figure is what it takes to get into a home there — the land payment is already inside it.",
  },
  {
    n: "02",
    title: "Get pre-approved first",
    body: "Do this before you fall in love with a parcel. It takes minutes, it starts as a soft pull, and it tells you exactly how much land and how much house you can carry.",
  },
  {
    n: "03",
    title: "Pick the dirt",
    body: "Now go shop with a real budget. Send us the listing and we check the boring things that kill deals: legal access, septic and well, setbacks, flood zone, and whether the county will let a home sit there at all.",
  },
  {
    n: "04",
    title: "One loan, one closing",
    body: "We package the land and the home into a single loan, order the site work, set the home, and hand you keys to a place that is yours down to the property line.",
  },
];

const INCLUDED = [
  "The home itself",
  "The land, financed in the same loan",
  "Delivery and set inside the delivery radius",
  "Blocking, levelling and tie-downs",
  "Taxes and insurance, escrowed",
];

const NOT_INCLUDED = [
  "Well, septic or power if the lot has none",
  "Clearing, fill dirt and driveway",
  "County impact and permit fees",
  "Your down payment",
];

const FAQ = [
  {
    title: "Can I really buy the land and the home together?",
    body: "Yes. That is the whole point of a land-and-home package: one loan, one payment, one closing. The catch is sequencing — the land has to be identified before we can put the deal together, because the lender is financing a specific parcel, not the idea of a parcel.",
  },
  {
    title: "So do I have to already own the land?",
    body: "No. You need it chosen, not owned. A signed contract or even a specific listing you have settled on is enough for us to start building the file. If you already own it free and clear, that equity usually becomes some or all of your down payment.",
  },
  {
    title: "Why do you push pre-approval so hard?",
    body: "Because land shopping without a number is how people waste a summer. Pre-approval tells you what you can actually carry, and it makes your offer on a parcel credible. It starts as a soft check and costs you nothing.",
  },
  {
    title: "How much do I need down?",
    body: "It depends on the programme, your credit, and whether the land carries equity. Plenty of buyers land in the 5–20% range, and owning the lot already can shrink that a lot. Your pre-approval gives you the real figure instead of a guess.",
  },
  {
    title: "Can I put a doublewide on any piece of land?",
    body: "No, and this is where deals die. Zoning districts, minimum lot sizes, setbacks, deed restrictions and flood zones all have opinions. Send us the parcel before you sign anything and we will check it.",
  },
  {
    title: "What does the land itself cost out there?",
    body: `It swings hard by county. Buildable lots start around ${shortMoney(
      CHEAPEST_LAND.land.low,
    )} in ${CHEAPEST_LAND.county} County and run past ${shortMoney(
      DEAREST_LAND,
    )} at the top of the map. Every county card above shows its own range.`,
  },
  {
    title: "How long does the whole thing take?",
    body: "Most packages run 60 to 90 days from pre-approval to keys, and site work is usually the long pole — permits, septic and power, not the home.",
  },
];

/**
 * Structured data: a local business that serves a delivery radius, plus the
 * FAQ. The service area drives local results; the FAQ can surface as rich
 * results.
 */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "@id": `${site.url}#business`,
      name: site.name,
      description: `Land and home packages financed as one loan across ${AREAS.length} counties within ${SERVICE_RADIUS_MI} miles of ${HQ.city}.`,
      url: `${site.url}/land-deals`,
      telephone: site.phone,
      email: site.email,
      address: {
        "@type": "PostalAddress",
        addressLocality: HQ.city,
        addressRegion: HQ.state,
        addressCountry: "US",
      },
      geo: { "@type": "GeoCoordinates", latitude: HQ.lat, longitude: HQ.lon },
      areaServed: {
        "@type": "GeoCircle",
        geoMidpoint: {
          "@type": "GeoCoordinates",
          latitude: HQ.lat,
          longitude: HQ.lon,
        },
        geoRadius: SERVICE_RADIUS_MI * 1609.34,
      },
      makesOffer: AREAS.map((a) => ({
        "@type": "Offer",
        name: `Land and home package in ${a.county} County`,
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: a.startingPayment,
          priceCurrency: "USD",
          unitCode: "MON",
        },
      })),
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQ.map((f) => ({
        "@type": "Question",
        name: f.title,
        acceptedAnswer: { "@type": "Answer", text: f.body },
      })),
    },
  ],
};

export default function LandDealsPage() {
  /* Turned off in `lib/page-config.ts`, this route sends visitors home rather
     than 404ing — an indexed link or a printed card outlives the switch. */
  if (!pages.landDeals) redirect("/");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      {/* ── Hero: the headline and the map itself, above the fold ── */}
      <section className="pb-16 pt-12 sm:pt-16">
        <Container>
          <Eyebrow index="01">
            {HQ.city}, {HQ.state} · {AREAS.length} counties · {SERVICE_RADIUS_MI}-mile radius
          </Eyebrow>

          <div className="mt-6 grid gap-x-14 gap-y-8 lg:grid-cols-[1.05fr_1fr] lg:items-end">
            <h1 className="font-display text-display text-balance text-ink">
              Own the dirt. Own the house. One loan.
            </h1>

            <div>
              <p className="text-lg leading-relaxed text-muted text-pretty">
                No land yet? Fine. Tap any county and that number is what it takes to get in
                there, <span className="text-ink">land payment included</span> — from{" "}
                <span className="font-mono text-ink">{money(CHEAPEST.startingPayment)}/mo</span>{" "}
                in {CHEAPEST.county} County.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="#pre-approval">
                  Get pre-approved
                  <Icon.Arrow className="size-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                </ButtonLink>
                <ButtonLink href="#how" variant="outline">
                  How it works
                </ButtonLink>
              </div>

              <p className="mt-4 text-sm text-muted">
                Or call{" "}
                <a href={site.phoneHref} className="text-ink underline underline-offset-4">
                  {site.phone}
                </a>{" "}
                · {site.hours}
              </p>
            </div>
          </div>

          <div className="mt-10">
            <LandMap />
            <p className="mt-5 max-w-3xl text-xs leading-relaxed text-muted">
              Counties are shaded by starting payment; the marker sits on each county seat.{" "}
              {PAYMENT_ASSUMPTIONS}
            </p>
          </div>
        </Container>
      </section>

      {/* ── The preface: what we need from you, before anything else ── */}
      <Section className="border-y border-line bg-surface !py-14">
        <Reveal>
          <div className="flex flex-col gap-6 sm:flex-row sm:gap-12">
            <div className="shrink-0 sm:w-48">
              <Badge tone="ember">Read this first</Badge>
            </div>
            <div className="max-w-3xl space-y-4 text-lg leading-relaxed text-ink-soft">
              <p>
                We can finance the <strong className="text-ink">land and the home together
                as one loan</strong> — you do not need two lenders, two closings, or a pile of
                cash for the lot.
              </p>
              <p className="text-muted">
                The one thing we need from you:{" "}
                <strong className="text-ink">
                  the land has to be chosen before we can put the deal together.
                </strong>{" "}
                Owning it already is great. Under contract works. A specific listing you have
                settled on works. &ldquo;Somewhere north of town&rdquo; does not — that is a
                wish, not a parcel.
              </p>
              <p className="text-muted">
                So start with the map: find your county and your number, get pre-approved so you
                know what is real, then go pick the dirt. We will vet it and build the package
                around it. If you are earlier than that,{" "}
                <Link href="/start-here" className="text-ink underline underline-offset-4">
                  start here instead
                </Link>
                .
              </p>
            </div>
          </div>
        </Reveal>
      </Section>

      {/* ── How the deal comes together ── */}
      <Section id="how" className="scroll-mt-[calc(var(--chrome-h)+1.5rem)]">
        <SectionHeading
          index="02"
          eyebrow="How the deal comes together"
          title="Four steps, in this order"
          lede="The order matters more than anything else on this page. Taken backwards, it costs people a season and sometimes a deposit."
        />

        <ol className="mt-14 grid gap-px overflow-hidden rounded-card border border-line bg-line md:grid-cols-2 xl:grid-cols-4">
          {STEPS.map((s, i) => (
            <Reveal as="li" key={s.n} delay={i * 70} className="bg-paper p-7">
              <span className="font-mono text-xs text-ember">{s.n}</span>
              <h3 className="mt-4 font-display text-2xl tracking-tight text-ink">{s.title}</h3>
              <p className="mt-3 leading-relaxed text-muted">{s.body}</p>
            </Reveal>
          ))}
        </ol>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-card border border-line bg-surface p-7">
            <h3 className="font-display text-xl tracking-tight text-ink">In that payment</h3>
            <ul className="mt-5 space-y-3">
              {INCLUDED.map((i) => (
                <li key={i} className="flex gap-3 text-[0.95rem] text-ink-soft">
                  <Icon.Check className="mt-0.5 size-4 shrink-0 text-moss" />
                  {i}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-card border border-line bg-surface p-7">
            <h3 className="font-display text-xl tracking-tight text-ink">Budget separately</h3>
            <ul className="mt-5 space-y-3">
              {NOT_INCLUDED.map((i) => (
                <li key={i} className="flex gap-3 text-[0.95rem] text-ink-soft">
                  <span aria-hidden className="mt-0.5 font-mono text-ember">
                    ·
                  </span>
                  {i}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-muted">
              The lending itself — chattel against a mortgage, what each costs, and why the
              title decides it — is laid out on{" "}
              <Link href="/financing" className="text-ink underline underline-offset-4">
                financing
              </Link>
              .
            </p>
          </div>
        </div>
      </Section>

      {/* ── Pre-approval ── */}
      <Section id="pre-approval" className="scroll-mt-[calc(var(--chrome-h)+1.5rem)] border-t border-line bg-surface">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          <div>
            <SectionHeading
              index="03"
              eyebrow="Do this before you shop"
              title="Get pre-approved"
              lede="Ten minutes now saves you a season of looking at land you cannot finance — or worse, land nobody can put a home on. You get a real payment range, a down-payment target and a straight answer on what your credit supports."
            />
            <ul className="mt-9 space-y-4">
              {[
                "Starts as a soft check — your score does not move",
                "You shop land knowing your ceiling",
                "Sellers take your offer seriously",
                "We flag zoning and utility problems before you pay for them",
              ].map((b) => (
                <li key={b} className="flex gap-3 text-[0.95rem] text-ink-soft">
                  <Icon.Check className="mt-0.5 size-4 shrink-0 text-ember" />
                  {b}
                </li>
              ))}
            </ul>
            <p className="mt-9 text-sm text-muted">
              Rather talk to a person?{" "}
              <a href={site.phoneHref} className="text-ink underline underline-offset-4">
                {site.phone}
              </a>{" "}
              · {site.hours}
            </p>
          </div>

          <div className="rounded-card border border-line bg-paper p-6 sm:p-9">
            <PreApprovalForm />
          </div>
        </div>
      </Section>

      {/* ── FAQ ── */}
      <Section id="faq" className="scroll-mt-[calc(var(--chrome-h)+1.5rem)] border-t border-line">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <SectionHeading index="04" eyebrow="Straight answers" title="The questions we get" />
          <Accordion items={FAQ} />
        </div>
      </Section>

      {/* ── Closing ── */}
      <Section className="border-t border-line bg-surface text-center">
        <h2 className="mx-auto max-w-4xl font-display text-headline text-balance text-ink">
          The cheapest way in right now is {money(BY_PRICE[0].startingPayment)}/mo in{" "}
          {BY_PRICE[0].county} County
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted">
          Land and home, one loan, {BY_PRICE[0].miles} miles from {HQ.city}. Find out what you
          qualify for before somebody else buys the lot.
        </p>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="#pre-approval">Get pre-approved</ButtonLink>
          <ButtonLink href="/listings" variant="outline">
            See the homes
          </ButtonLink>
        </div>
        <p className="mx-auto mt-14 max-w-4xl text-xs leading-relaxed text-muted">
          Payment figures on this page are estimates for comparison between areas, not an offer
          to lend or a commitment to extend credit. {PAYMENT_ASSUMPTIONS} Land prices reflect
          recent asking prices for buildable parcels and move constantly. Zoning, minimum lot
          size, setbacks, flood zone and utility availability vary parcel by parcel — confirm
          with us and with the county before you buy land.
        </p>
      </Section>
    </>
  );
}

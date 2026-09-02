/**
 * The landing page, as an ordered list of bands.
 *
 * Two routes render this: `/` and every custom page under `/p/<slug>`. A
 * custom page is the same landing narrowed to one series — the same hero, the
 * same closing call to action, a listings band showing only that slice of the
 * catalogue — which is why the whole composition lives in one component
 * instead of being written twice and drifting.
 *
 * Order is the array in `BANDS` below, and it is the only place the order
 * lives. Whether a band appears at all is `lib/page-config.ts`; whether it
 * *can* appear is the data behind it. Both have to say yes.
 *
 * The numbered eyebrows are counted after the switches are applied, so a site
 * with four bands turned off still reads 01, 02, 03 down the page rather than
 * 01, 04, 07.
 */

import { Fragment, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { AssemblyDiagram, assemblyLegend } from "@/components/assembly-diagram";
import { Scene } from "@/components/artwork/scene";
import { ContactBand } from "@/components/contact-band";
import { CountUp } from "@/components/count-up";
import { ListingCard } from "@/components/listing-card";
import { Marquee } from "@/components/marquee";
import { MeetTeam } from "@/components/meet-team";
import { PromotionBanner } from "@/components/promotion-banner";
import { QuoteForm } from "@/components/quote-form";
import { Reveal } from "@/components/reveal";
import { SizeCategories } from "@/components/size-categories";
import { LocationHours } from "@/components/location-hours";
import { VideoShowcase } from "@/components/video-showcase";
import {
  ButtonLink,
  Container,
  Eyebrow,
  Icon,
  Section,
  SectionHeading,
} from "@/components/ui";
import { communities } from "@/lib/communities";
import { company } from "@/lib/company";
import { featuredListings, listings } from "@/lib/homes";
import { market } from "@/lib/market";
import { sections, videoShowcase, type LandingSection } from "@/lib/page-config";
import { featuredPromotion } from "@/lib/promotions";
import { site } from "@/lib/site";
import heroPhoto from "@/public/photos/hero-home.jpg";

/* The hero claims and the ticker describe how HUD-code homes are built as a
   category, not options or tolerances on any particular plan. Anything
   specific to a home — its finish schedule, its energy rating, its warranty —
   belongs on that listing, sourced from the manufacturer's own sheet. */
const TICKER = [
  "Built indoors on a jig",
  "HUD-code certified",
  "Inspected in the plant",
  "Engineered to wind zone",
  "Delivered on its own chassis",
  "Set in one morning",
  "Skirted and tied down",
  "Walk it before you buy it",
  "Clayton-built, plant-inspected",
  "Twenty plans on the lot",
];

/**
 * Industry-wide numbers, not ours. Sources: Manufactured Housing Institute
 * 2024 industry overview and Census Bureau new-residential-construction data.
 */
const INDUSTRY_STATS: { v: ReactNode; k: string; s: string }[] = [
  {
    v: <><CountUp to={87} prefix="$" />/sq ft</>,
    k: "Cost to build",
    s: "Against $166 a square foot site-built, excluding land, on the same national numbers.",
  },
  {
    v: <><CountUp to={1} />{" in "}<CountUp to={9} /></>,
    k: "New single-family homes",
    s: "Roughly eleven percent of everything built in America last year came off a line.",
  },
  {
    v: <><CountUp to={50} />{" states"}</>,
    k: "One federal code",
    s: "The HUD Code has been the only nationally enforced residential building standard since 1976.",
  },
];

const MYTHS = [
  {
    myth: "“They're trailers.”",
    fact: "A travel trailer is a recreational vehicle. This is a house with a HUD certification label, a permanent welded steel chassis, and a 2×6 wall assembly. Nobody is towing it to a lake.",
  },
  {
    myth: "“They fall apart in twenty years.”",
    fact: "The construction standard people are picturing was replaced in 1976, and rewritten again in 1994 and 2021. A 2026 HUD-code home is engineered to wind, snow and thermal zones the same way a site-built house is — sometimes to tighter numbers, because it also has to survive a highway at 60 mph.",
  },
  {
    myth: "“They don't appreciate.”",
    fact: "Homes on land you own, on a permanent foundation, titled as real property, appreciate. Homes on a rented pad, titled as a vehicle, generally don't. That is a land and titling question, not a construction question — and it's the single most important thing we'll talk you through.",
  },
  {
    myth: "“You can hear everything through the walls.”",
    fact: "Solid-core interior doors, insulated interior partitions at the bedrooms, and a floor system that doesn't transmit footfall. The quietest house most of our buyers have lived in was the one they were sceptical about.",
  },
  {
    myth: "“You can't get a real mortgage.”",
    fact: "On owned land with a permanent foundation: conventional, FHA, VA and USDA all lend. On a leased pad it's a chattel loan at a higher rate. Both are real financing. One is cheaper, and we'll tell you which situation you're in before you fall in love with a floor plan.",
  },
  {
    myth: "“They all look the same.”",
    fact: "Scroll up. Or down. That's twenty plans, from a 408-square-foot single section to a 2,280-square-foot four bedroom, and the elevations are the least of what separates them.",
  },
];

/* Three steps, because a stranger deciding whether to ring reads three and
   skims five. The long version — plant inspections, transport, the set — is
   `/why-manufactured`, which is where somebody who wants it goes. */
const STEPS = [
  {
    title: "Tell us your situation",
    body: "A few details about what you need, roughly what you can spend, and where you want to live.",
  },
  {
    title: "We match home and plan",
    body: "We put the right plan against the right financing for your situation, and price the site work honestly.",
  },
  {
    title: "We handle setup and delivery",
    body: "Permits, transport, the set, the connections and the skirting. You get keys.",
  },
];

/* Three things somebody wants to know before they ring, in the order they
   worry about them. None is a claim about the business — every dealership on
   this template can stand behind all three. */
const REASSURANCES = [
  "Free consultation",
  "No obligation",
  "Quick response",
];

/* The three ways onto ground, in the order they cost money. The long
   version of this is /start-here. */
const NO_LAND_PATHS = [
  {
    icon: Icon.Pin,
    title: "Lease a pad",
    body: "You own the home, the community owns the ground under it. Lowest cost to get in, fastest to close, and the five communities we work with are all within half an hour of the lot.",
  },
  {
    icon: Icon.Shield,
    title: "Buy the lot",
    body: "On land you own, with a permanent foundation, the home titles as real property — which is what puts it on the same appreciation curve as the house next door.",
  },
  {
    icon: Icon.Bolt,
    title: "One loan for both",
    body: "A land-home package finances the parcel, the site work and the home together. More paperwork, one closing, and usually the cheapest money on the table.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "My brother-in-law is a framer. He walked the Breeze, went quiet, got down on the floor with a flashlight, came back up and said “this is better than what I build.” He has not mentioned it since.",
    name: "Dana R.",
    detail: "The Breeze · Blount County",
  },
  {
    quote:
      "We came in expecting to compromise on something. Two years later I still can't tell you what we compromised on. The gas bill in January was sixty-one dollars.",
    name: "Marcus & Anne T.",
    detail: "Haven · Knox County",
  },
  {
    quote:
      "A pipe let go under the kitchen. I was under the house in four minutes with a wrench and a bucket. My sister's slab house flooded for two days waiting on a jackhammer.",
    name: "Priya S.",
    detail: "Crockett · Louisville, TN",
  },
];

export type LandingProps = {
  /** Show only this series in the listings band. Omitted: the featured slice. */
  listingSeries?: string;
  /** Override the listings band heading — custom pages title their own slice. */
  listingsHeadline?: ReactNode;
  listingsLede?: string;
};

type Band = {
  key: LandingSection;
  show: boolean;
  /** Bands with a numbered eyebrow take the next number in the sequence. */
  numbered?: boolean;
  render: (index: string) => ReactNode;
};

export function Landing({ listingSeries, listingsHeadline, listingsLede }: LandingProps) {
  const featured = listingSeries
    ? listings.filter((l) => l.series === listingSeries)
    : featuredListings();
  const promotion = featuredPromotion();
  const team = company.team ?? [];

  const bands: Band[] = [
    {
      key: "hero",
      show: sections.hero,
      render: () => (
        <section id="hero" className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <Image
              src={heroPhoto}
              alt="A manufactured home on the lot — board-and-batten gable, a covered front porch and a full-width entry deck."
              fill
              preload
              quality={90}
              sizes="100vw"
              placeholder="blur"
              className="object-cover object-center"
            />
            {/* The reference scrim, both stops: dark enough at the top for the
                badge and the headline, darker still at the foot where the
                trust row sits on grass. */}
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.55)_0%,rgba(0,0,0,0.7)_100%)]" />
          </div>

          <Container className="py-12 pb-24 md:py-20 md:pb-32">
            <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
              <div className="text-center md:text-left">
                <p className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
                  <Icon.Star className="size-4 shrink-0 text-accent" />
                  Trusted by families in {site.address.city}, {site.address.region}
                </p>

                <h1 className="mb-4 text-4xl font-bold uppercase leading-tight text-white md:text-5xl lg:text-6xl">
                  The top choice for manufactured homes in{" "}
                  {market.regionName ?? site.address.region}
                </h1>

                <p className="mx-auto mb-8 max-w-xl text-lg text-white/85 md:mx-0 md:text-xl">
                  Quality manufactured homes at prices that work. We make
                  homeownership affordable.
                </p>

                <div className="mb-8 flex flex-col justify-center gap-4 sm:flex-row md:justify-start">
                  <Link
                    href="/listings"
                    className="group/btn flex items-center justify-center gap-2 rounded-xl bg-[image:var(--gradient)] px-8 py-4 text-lg font-semibold text-white shadow-[var(--button-shadow)] transition-all duration-300 hover:scale-105 hover:bg-[image:var(--gradient-hover)]"
                  >
                    Browse homes
                    <Icon.Arrow className="size-5 transition-transform duration-300 group-hover/btn:translate-x-1" />
                  </Link>
                  <a
                    href={site.phoneHref}
                    className="flex items-center justify-center gap-2 rounded-xl border-2 border-white bg-white/10 px-8 py-4 text-lg font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-white hover:text-ink"
                    aria-label={`Call ${site.name} on ${site.phone}`}
                  >
                    <Icon.Phone className="size-5 shrink-0" />
                    Call now
                  </a>
                </div>

                {/* Licence number first, then whatever the business already
                    advertises. Everything here is `lib/company.ts`, and a
                    dealership that publishes none of it gets no row rather
                    than a row of generic promises. */}
                {(company.licenseId || (company.badges ?? []).length > 0) && (
                  <ul className="flex flex-wrap justify-center gap-4 md:justify-start">
                    {company.licenseId && (
                      <li className="flex items-center gap-2 text-sm text-white/85">
                        <Icon.Check className="size-4 shrink-0 text-moss-soft" />
                        Licensed dealer #{company.licenseId}
                      </li>
                    )}
                    {(company.badges ?? []).map((badge) => (
                      <li key={badge} className="flex items-center gap-2 text-sm text-white/85">
                        <Icon.Check className="size-4 shrink-0 text-moss-soft" />
                        {badge}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <QuoteForm />
            </div>
          </Container>

          {/* The band that hands the hero over to the page. It is filled with
              `--paper`, so it reads as the white below rising into the
              photograph rather than as a shape drawn on top of it. */}
          <div className="absolute inset-x-0 bottom-0" aria-hidden>
            <svg viewBox="0 0 1440 120" fill="none" className="h-auto w-full">
              <path
                d="M0 120L48 110C96 100 192 80 288 70C384 60 480 60 576 65C672 70 768 80 864 85C960 90 1056 90 1152 85C1248 80 1344 70 1392 65L1440 60V120H0Z"
                className="fill-paper"
              />
            </svg>
          </div>
        </section>
      ),
    },
    {
      key: "promotion",
      show: sections.promotion && !!promotion,
      render: () => <PromotionBanner promotion={promotion!} />,
    },
    {
      key: "valueProp",
      show: sections.valueProp,
      render: () => (
        <section id="value" className="relative w-full overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <Scene
              kind="exterior"
              photoKey="page/home-closing"
              label={`A ${site.short} home`}
              className="size-full object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.15)_0%,rgba(0,0,0,0.55)_100%)]" />
          </div>

          {/* Bottom-aligned rather than centred: the copy belongs on the
              ground in the photograph, not across the middle of the house. */}
          <div className="relative z-10 flex min-h-[480px] flex-col items-center justify-end px-4 pb-16 pt-12 text-center sm:px-6 lg:px-8">
            <h2 className="mb-4 max-w-3xl text-3xl font-bold text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.4)] md:text-4xl lg:text-5xl">
              Imagine pulling into a home like this every day
            </h2>
            <p className="max-w-2xl text-lg text-white/85 [text-shadow:0_1px_4px_rgba(0,0,0,0.3)] md:text-xl">
              We help families in {site.address.city}, {site.address.region} get
              beautiful manufactured homes on land, with financing, delivery and
              setup handled for you.
            </p>
          </div>
        </section>
      ),
    },
    {
      key: "socialProof",
      show: sections.socialProof,
      render: () => (
        <section id="social-proof" className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <Scene
              kind="living"
              photoKey="page/reviews"
              label=""
              className="size-full object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.5)_0%,rgba(0,0,0,0.65)_100%)]" />
          </div>

          <Container className="relative z-10 py-16 md:py-24">
            <div className="mb-12 text-center">
              <p className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
                <Icon.Star className="size-4 text-accent" />
                Reviews
              </p>
              <h2 className="text-2xl font-bold text-white md:text-4xl">
                What our customers say
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {TESTIMONIALS.map((t, i) => (
                <Reveal
                  key={i}
                  delay={i * 100}
                  as="figure"
                  className="flex flex-col gap-5 rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur-sm"
                >
                  <Icon.Quote className="size-6 text-accent" />
                  <blockquote className="flex-1 leading-relaxed text-white/90">
                    {t.quote}
                  </blockquote>
                  <figcaption className="border-t border-white/15 pt-4">
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="mt-0.5 text-xs text-white/60">{t.detail}</p>
                  </figcaption>
                </Reveal>
              ))}
            </div>

            {/* The link is the point of the band: three quotes we chose
                ourselves prove nothing, and a source we do not control proves
                rather a lot. No `reviewsUrl` in `lib/company.ts`, no link. */}
            {company.reviewsUrl && (
              <div className="mt-10 text-center">
                <a
                  href={company.reviewsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-white transition-opacity hover:opacity-80"
                >
                  View all reviews on {company.reviewsLabel ?? "the web"}
                  <Icon.External className="size-4" />
                </a>
              </div>
            )}
          </Container>
        </section>
      ),
    },
    {
      key: "howItWorks",
      show: sections.howItWorks,
      render: () => (
        <section id="how-it-works" className="relative w-full bg-paper">
          <Container className="py-12 md:py-16">
            <div className="mb-10 text-center">
              <h2 className="mb-3 text-3xl font-bold text-ink md:text-4xl">How it works</h2>
              <p className="mx-auto max-w-2xl text-lg text-muted">
                Three simple steps to get into your new home.
              </p>
            </div>

            <ol className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
              {STEPS.map((step, i) => (
                <Reveal
                  key={step.title}
                  delay={i * 90}
                  as="li"
                  className="relative flex flex-col items-center rounded-2xl p-6 text-center md:p-8"
                >
                  <span className="mb-4 flex size-14 items-center justify-center rounded-full bg-[image:var(--gradient)] text-lg font-bold text-white shadow-[var(--button-shadow)]">
                    {i + 1}
                  </span>
                  <h3 className="mb-2 text-xl font-semibold text-ink">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-muted">{step.body}</p>
                </Reveal>
              ))}
            </ol>
          </Container>
        </section>
      ),
    },
    {
      key: "listings",
      show: sections.listings && featured.length > 0,
      render: () => (
        <section id="listings" className="relative overflow-hidden bg-surface">
          <Container className="py-8 md:py-12">
            <div className="mb-8 text-center">
              <h2 className="mb-3 text-3xl font-bold text-ink md:text-4xl">
                {listingsHeadline ?? "Browse our homes"}
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-muted">
                {listingsLede ??
                  `Find the right home for your family. Filter by size and features — every one of them is standing on the lot in ${site.address.city}.`}
              </p>
            </div>

            {/* The four buckets first — most people arrive knowing roughly how
                wide the ground will take, and nothing else narrows the
                catalogue as fast. Hidden on a custom page, which is already
                narrowed to one series. */}
            {!listingSeries && (
              <div className="mb-8">
                <SizeCategories />
              </div>
            )}

            <div className="mb-6 flex items-center justify-between gap-4">
              {/* Counts the cards actually below it, not the filter behind
                  them — a band that says seven and shows four is the kind of
                  small lie a visitor notices and generalises from. */}
              <p className="text-sm text-muted">
                <span className="font-semibold text-ink">
                  {Math.min(featured.length, 4)}
                </span>{" "}
                of {listings.length} homes
              </p>
              <ButtonLink href="/listings" variant="outline" className="!py-2.5 !text-sm">
                See all {listings.length}
                <Icon.Arrow className="size-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
              </ButtonLink>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {featured.slice(0, 4).map((listing, i) => (
                <Reveal key={listing.slug} delay={i * 90}>
                  <ListingCard listing={listing} priority={i === 0} className="h-full" />
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      ),
    },
    {
      key: "contact",
      show: sections.contact,
      render: () => (
        <section id="contact" className="relative overflow-hidden bg-paper">
          <Container className="py-16 md:py-24">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <h2 className="text-3xl font-bold text-ink md:text-4xl">
                  Ready to find your{" "}
                  <span className="bg-[image:var(--gradient)] bg-clip-text text-transparent">
                    home?
                  </span>
                </h2>
                <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
                  Our team is here for every step. Finding the plan, the ground it
                  goes on, the financing, the delivery and the set — we handle the
                  parts nobody warns you about.
                </p>

                <a
                  href={site.phoneHref}
                  className="mt-8 flex items-center gap-4 text-ink transition-opacity hover:opacity-80"
                >
                  <span className="grid size-12 shrink-0 place-items-center rounded-full bg-ember-wash text-ember">
                    <Icon.Phone className="size-5" />
                  </span>
                  <span>
                    <span className="block text-sm text-muted">Call us directly</span>
                    <span className="block text-xl font-bold">{site.phone}</span>
                  </span>
                </a>

                <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
                  {REASSURANCES.map((line) => (
                    <li key={line} className="flex items-center gap-2 text-sm text-ink-soft">
                      <Icon.Check className="size-4 shrink-0 text-moss" />
                      {line}
                    </li>
                  ))}
                </ul>
              </div>

              <Reveal
                delay={120}
                className="rounded-2xl border border-line bg-surface p-6 shadow-[var(--card-shadow)] md:p-8"
              >
                <ContactBand />
              </Reveal>
            </div>
          </Container>
        </section>
      ),
    },
    {
      key: "locationHours",
      show: sections.locationHours,
      render: () => <LocationHours />,
    },
    {
      key: "homeOnLand",
      show: sections.homeOnLand,
      numbered: true,
      render: (index) => (
          <Section id="home-on-land">
            <Reveal>
              <div className="overflow-hidden rounded-[1.5rem] border border-line bg-surface">
                <div className="grid gap-10 p-8 sm:p-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:p-16">
                  <div>
                    <Eyebrow index={index}>No land?</Eyebrow>
                    <h2 className="mt-5 font-display text-headline text-balance text-ink">
                      Start here.
                    </h2>
                    <p className="mt-6 text-lg leading-relaxed text-muted">
                      Most people who buy a manufactured home do not own an acre to put it
                      on, and nothing about that has to slow you down. You can lease a pad
                      in one of the communities below, buy a lot, or put land and home
                      together on one loan — and which of those you pick changes the
                      monthly payment more than any option you will ever tick on a plan.
                    </p>
                    <p className="mt-5 text-lg leading-relaxed text-muted">
                      So we wrote the whole thing down: how buying a manufactured home
                      actually works, in order, from the land question to the day the set
                      crew leaves.
                    </p>
                    <div className="mt-9 flex flex-wrap gap-3">
                      <ButtonLink href="/start-here" className="!px-7 !py-4 !text-base">
                        Read the buyer&apos;s guide
                        <Icon.Arrow className="size-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                      </ButtonLink>
                      <ButtonLink href="/communities" variant="outline" className="!px-7 !py-4 !text-base">
                        See the communities
                      </ButtonLink>
                    </div>
                  </div>

                  <ol className="grid gap-px self-start overflow-hidden rounded-2xl bg-line">
                    {NO_LAND_PATHS.map((path) => (
                      <li key={path.title} className="flex gap-5 bg-paper p-7">
                        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-ember text-on-ember">
                          <path.icon className="size-5" />
                        </span>
                        <div>
                          <h3 className="font-display text-xl leading-snug tracking-tight text-ink">
                            {path.title}
                          </h3>
                          <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">
                            {path.body}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </Reveal>
          </Section>
      ),
    },
    {
      key: "meetTeam",
      show: sections.meetTeam && team.length > 0,
      numbered: true,
      render: (index) => <MeetTeam index={index} team={team} note={company.teamNote} />,
    },
    {
      key: "videoShowcase",
      show: sections.videoShowcase && !!videoShowcase,
      render: () => <VideoShowcase video={videoShowcase!} />,
    },
    {
      key: "communities",
      show: sections.communities && communities.length > 0,
      numbered: true,
      render: (index) => (
          <Section id="communities">
            <Reveal>
              <SectionHeading
                index={index}
                eyebrow="Where they go"
                title="Five communities within half an hour of the lot."
                lede="Real, independently operated communities in Knox and Blount counties. All five are land-lease, which keeps the entry cost down and makes the titling conversation the one worth having early."
                action={
                  <ButtonLink href="/communities" variant="outline">
                    All communities
                    <Icon.Arrow className="size-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                  </ButtonLink>
                }
              />
            </Reveal>

            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {communities.slice(0, 3).map((c, i) => (
                <Reveal key={c.slug} delay={i * 90}>
                  <Link
                    href={`/communities#${c.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-card border border-line bg-surface transition-all duration-500 hover:-translate-y-1 hover:border-line-strong"
                  >
                    <div className="grain relative aspect-[16/10] overflow-hidden">
                      <Scene
                        kind="exterior"
                        photoKey={`community/${c.slug}`}
                        sizes="(min-width: 1024px) 33vw, 100vw"
                        label={`${c.name} in ${c.city}, ${c.state}`}
                        className="size-full object-cover transition-transform duration-[900ms] group-hover:scale-105"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5">
                        <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-white/70">
                          {c.tenure}
                        </p>
                        <h3 className="mt-1 font-display text-2xl text-white">{c.name}</h3>
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <p className="text-[0.95rem] leading-relaxed text-muted">{c.blurb}</p>
                      <div className="mt-auto flex items-center justify-between gap-4 pt-6 font-mono text-xs text-muted">
                        <span>
                          {c.city}, {c.state}
                        </span>
                        <span className="text-ink">{c.operator ?? c.tenure}</span>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </Section>
      ),
    },
    {
      key: "ticker",
      show: sections.ticker,
      render: () => (
          <div className="border-y border-line bg-ink py-4 text-paper dark:bg-surface dark:text-ink">
            <Marquee items={TICKER} />
          </div>
      ),
    },
    {
      key: "numbers",
      show: sections.numbers,
      render: () => (
          <Section id="numbers" className="!py-20 sm:!py-28">
            <Reveal>
              <Eyebrow>Manufactured housing in America</Eyebrow>
            </Reveal>

            <div className="mt-10 grid gap-14 lg:grid-cols-[1.1fr_1fr] lg:items-start lg:gap-20">
              <Reveal>
                <div>
                  <p className="flex flex-wrap items-baseline gap-x-4 font-display leading-[0.82] tracking-tight text-ink">
                    <span className="text-[5.5rem] sm:text-[9rem] lg:text-[12rem]">
                      <CountUp to={22} />
                    </span>
                    <span className="text-4xl sm:text-6xl lg:text-7xl">million</span>
                  </p>
                  <p className="mt-6 max-w-[26rem] text-lg leading-relaxed text-muted">
                    Americans live in a manufactured home today — roughly one in every
                    fifteen people in the country. It is the largest source of unsubsidised
                    affordable housing the United States has.
                  </p>
                </div>
              </Reveal>

              <Reveal delay={120}>
                <dl className="grid grid-cols-1 gap-y-10 sm:grid-cols-3 sm:gap-x-8 lg:grid-cols-1 lg:gap-y-9 lg:border-l lg:border-line lg:pl-10">
                  {INDUSTRY_STATS.map((s) => (
                    <div key={s.k}>
                      <dd className="font-display text-4xl leading-none tracking-tight text-ink sm:text-5xl">
                        {s.v}
                      </dd>
                      <dt className="eyebrow mt-3">{s.k}</dt>
                      <p className="mt-2 max-w-[22rem] text-sm leading-relaxed text-muted">
                        {s.s}
                      </p>
                    </div>
                  ))}
                </dl>
              </Reveal>
            </div>
          </Section>
      ),
    },
    {
      key: "myth",
      show: sections.myth,
      numbered: true,
      render: (index) => (
          <section id="myth" className="border-y border-line bg-surface">
            <Container className="py-20 sm:py-28 lg:py-36">
              <Reveal>
                <div className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
                  <div className="lg:sticky lg:top-28 lg:self-start">
                    <Eyebrow index={index}>The elephant in the driveway</Eyebrow>
                    <h2 className="mt-5 font-display text-headline text-balance text-ink">
                      Yes, we&apos;ve heard all of it.
                    </h2>
                    <p className="mt-6 text-lg leading-relaxed text-muted">
                      Every one of these gets said to us on the lot. Most of it was true of
                      homes built before 1976 — the year the federal building code that
                      governs this construction came in — and almost none of it is true of a
                      home built today.
                    </p>
                    <p className="mt-5 text-lg leading-relaxed text-muted">
                      So here are the honest answers, including the two places where the
                      sceptics are right.
                    </p>
                    <div className="mt-10 flex items-center gap-3 rounded-2xl border border-line bg-paper p-5">
                      <Icon.Quote className="size-8 shrink-0 text-ember opacity-70" />
                      <p className="text-[0.95rem] leading-relaxed text-ink-soft">
                        “The product changed in 1976. The reputation never got the memo.”
                      </p>
                    </div>
                  </div>

                  <ol className="space-y-px overflow-hidden rounded-2xl border border-line bg-line">
                    {MYTHS.map((m, i) => (
                      <li key={i} className="group bg-paper p-7 transition-colors hover:bg-surface-2 sm:p-9">
                        <div className="flex items-baseline gap-4">
                          <span className="font-mono text-xs text-ember">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <h3 className="font-display text-2xl leading-snug tracking-tight text-ink">
                            {m.myth}
                          </h3>
                        </div>
                        <p className="mt-4 pl-10 text-[0.98rem] leading-relaxed text-muted">
                          {m.fact}
                        </p>
                      </li>
                    ))}
                  </ol>
                </div>
              </Reveal>
            </Container>
          </section>
      ),
    },
    {
      key: "cutaway",
      show: sections.cutaway,
      numbered: true,
      render: (index) => (
          <Section id="how-its-built">
            <Reveal>
              <SectionHeading
                index={index}
                eyebrow="Section through a set home"
                title={
                  <>
                    And yes — you can
                    <br />
                    crawl underneath it.
                  </>
                }
                lede="This is the part nobody puts in a brochure, so we drew it. Nine layers between the shingle and the footing, and about thirty inches of reachable service space under all of it."
              />
            </Reveal>

            <div className="mt-16 grid gap-12 lg:grid-cols-[1.35fr_1fr] lg:gap-16">
              <Reveal className="min-w-0 lg:sticky lg:top-28 lg:self-start">
                <div className="overflow-hidden rounded-2xl border border-line bg-surface p-4 text-ink sm:p-8">
                  <AssemblyDiagram className="h-auto w-full" />
                </div>
              </Reveal>

              <Reveal delay={140}>
                <ol className="grid gap-x-8 gap-y-7 sm:grid-cols-2 lg:grid-cols-1">
                  {assemblyLegend.map((item) => (
                    <li key={item.n} className="flex gap-4">
                      <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-ember font-mono text-[0.65rem] font-bold text-on-ember">
                        {item.n}
                      </span>
                      <div>
                        <h3 className="text-[0.98rem] font-medium tracking-tight text-ink">
                          {item.title}
                        </h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-muted">{item.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </Reveal>
            </div>
          </Section>
      ),
    },

  ];

  let n = 0;
  return (
    <>
      {bands
        .filter((band) => band.show)
        .map((band) => (
          <Fragment key={band.key}>
            {band.render(band.numbered ? String(++n).padStart(2, "0") : "")}
          </Fragment>
        ))}
    </>
  );
}

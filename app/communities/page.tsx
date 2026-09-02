import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Scene } from "@/components/artwork/scene";
import { ListingCard } from "@/components/listing-card";
import { PageHero } from "@/components/page-hero";
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
import { communities } from "@/lib/communities";
import { listings } from "@/lib/homes";
import { money, num } from "@/lib/format";
import { pages } from "@/lib/page-config";

export const metadata: Metadata = {
  title: "Communities",
  description:
    "Five manufactured-home communities in Knox and Blount counties, Tennessee — what each one is like, who runs it, and why the tenure on the ground decides whether your home appreciates.",
};

const TENURES = [
  {
    name: "Land-lease",
    verdict: "Cheapest to enter",
    body: "You own the home, you rent the pad. Lowest entry cost by a wide margin and the fastest to close. The trade is that the rent is set by the owner, and the home is usually titled as personal property — so it depreciates like a vehicle unless the community converts.",
    watch: "Ask what the rent has done over ten years. If nobody will tell you, that is the answer.",
    tone: "neutral" as const,
  },
  {
    name: "Resident-owned",
    verdict: "Best of both",
    body: "A co-operative where the residents collectively own the ground. You buy a share along with the home. Lot fees still exist, but the people setting them are the people paying them, which changes the arithmetic permanently.",
    watch: "Read the bylaws and the last three years of minutes before you buy in.",
    tone: "moss" as const,
  },
  {
    name: "Fee-simple",
    verdict: "Appreciates like a house",
    body: "You buy the lot outright. No lot rent, ever. With a permanent foundation the home titles as real property, which unlocks conventional, FHA, VA and USDA lending and puts it on the same appreciation curve as the stick-built house next door.",
    watch: "Highest entry cost. Also the only path that reliably builds equity.",
    tone: "ember" as const,
  },
];

export default function CommunitiesPage() {
  /* Turned off in `lib/page-config.ts`, this route sends visitors home rather
     than 404ing — an indexed link or a printed card outlives the switch. */
  if (!pages.communities) redirect("/");

  return (
    <>
      <PageHero
        photoKey="page/communities"
        index="01"
        eyebrow="Five communities · East Tennessee"
        title={
          <>
            The home matters.
            <br />
            The ground matters more.
          </>
        }
        lede="Nobody in this industry wants to have the land conversation first, because it is the one that costs money. We have it first — and if you do not own land at all, start with the buyer's guide."
        kind="exterior"
        breadcrumb={[
          { href: "/", label: "Home" },
          { href: "/communities", label: "Communities" },
        ]}
      />

      <Section>
        <Reveal>
          <SectionHeading
            index="02"
            eyebrow="Three ways to hold the land"
            title="This is the decision that decides everything else."
            lede="Not the cabinets. Not the elevation. Whether your home is an appreciating asset in fifteen years comes down almost entirely to what you did with the ground under it."
          />
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {TENURES.map((t, i) => (
            <Reveal key={t.name} delay={i * 100}>
              <div className="flex h-full flex-col rounded-card border border-line bg-surface p-8">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-display text-2xl tracking-tight text-ink">{t.name}</h3>
                  <Badge tone={t.tone}>{t.verdict}</Badge>
                </div>
                <p className="mt-5 flex-1 leading-relaxed text-muted">{t.body}</p>
                <p className="mt-6 flex gap-2.5 border-t border-line pt-5 text-[0.88rem] leading-relaxed text-ink-soft">
                  <Icon.Shield className="mt-0.5 size-4 shrink-0 text-ember" />
                  {t.watch}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <div className="border-t border-line">
        {communities.map((c, i) => {
          const here = listings.filter((l) => l.communitySlug === c.slug);
          const pricedHere = here.map((l) => l.price).filter((p): p is number => p !== undefined);
          const cheapest = pricedHere.length ? Math.min(...pricedHere) : null;

          return (
            <section
              key={c.slug}
              id={c.slug}
              className="scroll-mt-[calc(var(--chrome-h)+1.5rem)] border-b border-line py-16 sm:py-20"
            >
              <Container>
                <Reveal>
                  <div
                    className={`grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16 ${
                      i % 2 ? "lg:[&>*:first-child]:order-2" : ""
                    }`}
                  >
                    <div className="grain relative aspect-[16/11] overflow-hidden rounded-card border border-line">
                      <Scene
                        kind="exterior"
                        photoKey={`community/${c.slug}`}
                        sizes="(min-width: 1024px) 50vw, 100vw"
                        label={`${c.name}, ${c.city}, ${c.state}`}
                        className="size-full object-cover"
                      />
                      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-black/70 to-transparent p-6">
                        <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-white/80">
                          {c.established ? `Established ${c.established}` : c.tenure}
                        </p>
                        {c.available !== undefined && (
                          <p className="rounded-full bg-black/45 px-3 py-1 font-mono text-[0.7rem] text-white backdrop-blur-sm">
                            {c.available} sites open
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Eyebrow index={String(i + 1).padStart(2, "0")}>
                        {c.city}, {c.state}
                      </Eyebrow>
                      <h2 className="mt-5 font-display text-headline tracking-tight text-ink">
                        {c.name}
                      </h2>
                      <div className="mt-4">
                        <Badge tone={c.tenure === "Land-lease" ? "neutral" : "moss"}>
                          {c.tenure}
                        </Badge>
                      </div>
                      <p className="mt-6 text-lg leading-relaxed text-muted">{c.blurb}</p>

                      {/* Only the figures the community actually publishes. A
                          rent or a homesite count we do not have is left out
                          rather than estimated. */}
                      <dl className="mt-8 grid grid-cols-2 gap-6 border-y border-line py-6 sm:grid-cols-3">
                        {c.operator && (
                          <div>
                            <dt className="eyebrow">Operated by</dt>
                            <dd className="mt-2 font-display text-xl tracking-tight text-ink">
                              {c.operator}
                            </dd>
                          </div>
                        )}
                        {c.lotRent !== undefined && (
                          <div>
                            <dt className="eyebrow">Lot fee</dt>
                            <dd className="mt-2 font-display text-2xl tracking-tight text-ink">
                              {money(c.lotRent)}
                            </dd>
                          </div>
                        )}
                        {c.sites !== undefined && (
                          <div>
                            <dt className="eyebrow">Homesites</dt>
                            <dd className="mt-2 font-display text-2xl tracking-tight text-ink">
                              {num(c.sites)}
                            </dd>
                          </div>
                        )}
                        <div>
                          <dt className="eyebrow">Homes from</dt>
                          <dd className="mt-2 font-display text-xl tracking-tight text-ink">
                            {cheapest ? money(cheapest) : "Call for pricing"}
                          </dd>
                        </div>
                      </dl>

                      {c.amenities ? (
                        <ul className="mt-7 grid gap-2.5 sm:grid-cols-2">
                          {c.amenities.map((a) => (
                            <li
                              key={a}
                              className="flex gap-2.5 text-[0.9rem] leading-relaxed text-ink-soft"
                            >
                              <Icon.Check className="mt-0.5 size-4 shrink-0 text-ember" />
                              {a}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-7 flex gap-2.5 text-[0.9rem] leading-relaxed text-muted">
                          <Icon.Shield className="mt-0.5 size-4 shrink-0 text-ember" />
                          This community does not publish an amenity list or a rate
                          sheet. Ask us and we will get both from the office before you
                          go and look.
                        </p>
                      )}

                      {c.url && (
                        <p className="mt-6">
                          <a
                            href={c.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-ember"
                          >
                            The community&apos;s own page
                            <Icon.Arrow className="size-3.5" />
                          </a>
                        </p>
                      )}
                    </div>
                  </div>
                </Reveal>

                {here.length > 0 && (
                  <div className="mt-14">
                    <p className="eyebrow">
                      {here.length} home{here.length > 1 ? "s" : ""} at {c.name}
                    </p>
                    <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {here.map((l) => (
                        <ListingCard key={l.slug} listing={l} className="h-full" />
                      ))}
                    </div>
                  </div>
                )}
              </Container>
            </section>
          );
        })}
      </div>

      <Section>
        <Reveal>
          <div className="rounded-[1.5rem] border border-line bg-surface p-10 text-center sm:p-16">
            <h2 className="mx-auto max-w-2xl font-display text-headline text-balance text-ink">
              Already own the land?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted">
              Then this gets simpler and cheaper. Send us the parcel number and we will
              tell you what it takes to set a home on it — access, utilities, setbacks,
              permits, the lot — usually within two business days.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/contact" className="!px-7 !py-4 !text-base">
                Send us the parcel
                <Icon.Arrow className="size-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
              </ButtonLink>
              <ButtonLink href="/start-here" variant="outline" className="!px-7 !py-4 !text-base">
                No land? Start here
              </ButtonLink>
            </div>
          </div>
        </Reveal>
      </Section>
    </>
  );
}

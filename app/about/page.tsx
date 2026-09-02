import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Scene } from "@/components/artwork/scene";
import { CountUp } from "@/components/count-up";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import {
  ButtonLink,
  Container,
  Eyebrow,
  Icon,
  Section,
  SectionHeading,
} from "@/components/ui";
import { communities } from "@/lib/communities";
import { company, spellCount, yearsTrading } from "@/lib/company";
import { listings, seriesList } from "@/lib/homes";
import { site } from "@/lib/site";
import { pages } from "@/lib/page-config";

/* Every section below is conditional on the matching field in
   `lib/company.ts`. A dealership that publishes nothing about its staff or
   its founding year gets a shorter page, not an invented one — see the note
   at the top of that file. */

const where = `${site.address.city}, ${site.address.region}`;

const sentenceCase = (s: string) => s.replace(/^./, (c) => c.toUpperCase());

export const metadata: Metadata = {
  title: "About",
  description: [
    company.founded
      ? `${site.name} has been setting manufactured homes since ${company.founded}.`
      : `${site.name} sets manufactured homes across ${where}.`,
    "What we do, what we refuse to do, and who does it.",
  ].join(" "),
};

export default function AboutPage() {
  /* Turned off in `lib/page-config.ts`, this route sends visitors home rather
     than 404ing — an indexed link or a printed card outlives the switch. */
  if (!pages.about) redirect("/");

  const years = yearsTrading();

  /* Section numbering has to survive a missing section, so it counts up as
     the page renders rather than being written into each heading. */
  let n = 1;
  const index = () => String(n++).padStart(2, "0");

  const stats = [
    ...(years ? [{ v: <CountUp to={years} />, k: "Years" }] : []),
    { v: <CountUp to={listings.length} />, k: "Plans on the lot" },
    { v: <CountUp to={seriesList.length} />, k: "Series" },
    { v: <CountUp to={communities.length} />, k: "Communities" },
  ];

  return (
    <>
      <PageHero
        photoKey="page/about"
        index={index()}
        eyebrow={[company.founded && `Since ${company.founded}`, where]
          .filter(Boolean)
          .join(" · ")}
        title={
          company.homesSoldWords ? (
            <>
              {sentenceCase(company.homesSoldWords)} homes,
              <br />
              one argument.
            </>
          ) : (
            <>One argument.</>
          )
        }
        lede="That a house assembled indoors by people who do it every day is better than one assembled outdoors by people who do it once."
        kind="exterior"
        size="tall"
        breadcrumb={[
          { href: "/", label: "Home" },
          { href: "/about", label: "About" },
        ]}
      />

      {/* Story — dropped entirely when the business has no story on file. */}
      {company.story && (
        <Section>
          <div className="grid gap-14 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
            <Reveal>
              <Eyebrow index={index()}>{company.story.eyebrow}</Eyebrow>
              <h2 className="mt-5 font-display text-headline text-balance text-ink">
                {company.story.heading}
              </h2>
            </Reveal>

            <Reveal delay={100}>
              <div className="space-y-6 text-lg leading-relaxed text-muted">
                {company.story.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>

              <dl className="mt-12 grid grid-cols-2 gap-x-8 gap-y-10 border-t border-line pt-10 sm:grid-cols-4">
                {stats.map((s) => (
                  <div key={s.k}>
                    <dd className="font-display text-4xl leading-none tracking-tight text-ink">
                      {s.v}
                    </dd>
                    <dt className="eyebrow mt-3">{s.k}</dt>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </Section>
      )}

      {/* Principles */}
      {company.principles && company.principles.length > 0 && (
        <section className="border-y border-line bg-surface">
          <Container className="py-20 sm:py-28">
            <Reveal>
              <SectionHeading
                index={index()}
                eyebrow="How we work"
                title={`${sentenceCase(spellCount(company.principles.length))} rules we don't bend.`}
              />
            </Reveal>
            <div className="mt-14 grid gap-6 sm:grid-cols-2">
              {company.principles.map((p, i) => {
                const PrincipleIcon = Icon[p.icon];
                return (
                  <Reveal key={p.title} delay={i * 90}>
                    <div className="flex h-full gap-5 rounded-card border border-line bg-paper p-8">
                      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-ember text-on-ember">
                        <PrincipleIcon className="size-5" />
                      </span>
                      <div>
                        <h3 className="font-display text-2xl leading-snug tracking-tight text-ink">
                          {p.title}
                        </h3>
                        <p className="mt-3 leading-relaxed text-muted">{p.body}</p>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </Container>
        </section>
      )}

      {/* Team */}
      {company.team && company.team.length > 0 && (
        <Section>
          <Reveal>
            <SectionHeading
              index={index()}
              eyebrow="Who you'll actually meet"
              title={
                company.teamSize
                  ? `${sentenceCase(spellCount(company.teamSize))} people. No sales floor.`
                  : "No sales floor."
              }
              lede={company.teamNote}
            />
          </Reveal>

          <div className="mt-14 grid gap-px overflow-hidden rounded-2xl bg-line sm:grid-cols-2 lg:grid-cols-4">
            {company.team.map((t, i) => (
              <Reveal key={t.name} delay={i * 80} className="bg-paper">
                <div className="flex h-full flex-col">
                  <div className="grain relative aspect-[4/5] overflow-hidden bg-surface-2">
                    <Scene
                      kind={(["living", "porch", "kitchen", "bedroom"] as const)[i % 4]}
                      photoKey={`page/about-team-${i + 1}`}
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                      label={t.name}
                      className="size-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-5">
                      {t.since && (
                        <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-white/65">
                          Since {t.since}
                        </p>
                      )}
                      <p className="mt-1 font-display text-xl leading-tight text-white">
                        {t.name}
                      </p>
                      <p className="font-mono text-[0.7rem] text-white/70">{t.role}</p>
                    </div>
                  </div>
                  <p className="flex-1 p-6 text-[0.92rem] leading-relaxed text-muted">{t.body}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-10">
            <p className="text-xs text-muted">
              Portraits are illustrative placeholders in this template — register a
              photograph under <code className="font-mono text-ink">page/about-team-N</code> in{" "}
              <code className="font-mono text-ink">lib/photos.ts</code> when you deploy.
            </p>
          </Reveal>
        </Section>
      )}

      {/* Visit */}
      <section className="border-t border-line bg-ink py-20 text-paper dark:bg-surface dark:text-ink sm:py-28">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <Reveal>
              <Eyebrow index={index()} className="!text-current opacity-60">
                The lot
              </Eyebrow>
              <h2 className="mt-5 font-display text-headline text-balance">
                {company.homesOpenOnLot
                  ? `${sentenceCase(spellCount(company.homesOpenOnLot))} homes open to walk through.`
                  : "Come and walk the lot."}
              </h2>
              <p className="mt-6 max-w-lg text-lg leading-relaxed opacity-70">
                No appointment needed to walk the lot. Book one if you want somebody to
                walk it with you, or if you want a home unskirted so you can get
                underneath — that takes us about fifteen minutes to set up.
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <ButtonLink
                  href="/contact"
                  className="!bg-paper !px-7 !py-4 !text-base !text-ink hover:!bg-ember hover:!text-on-ember dark:!bg-ink dark:!text-paper"
                >
                  Book a walkthrough
                  <Icon.Arrow className="size-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                </ButtonLink>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <dl className="grid gap-8 sm:grid-cols-2">
                <div>
                  <dt className="eyebrow !text-current opacity-60">Address</dt>
                  <dd className="mt-3 leading-relaxed">
                    {site.address.street}
                    <br />
                    {site.address.city}, {site.address.region} {site.address.postalCode}
                  </dd>
                </div>
                <div>
                  <dt className="eyebrow !text-current opacity-60">Hours</dt>
                  <dd className="mt-3 leading-relaxed">{site.hours}</dd>
                </div>
                <div>
                  <dt className="eyebrow !text-current opacity-60">Phone</dt>
                  <dd className="mt-3 font-mono">
                    <a href={site.phoneHref} className="transition-opacity hover:opacity-70">
                      {site.phone}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="eyebrow !text-current opacity-60">Email</dt>
                  <dd className="mt-3 font-mono break-all">
                    <a
                      href={`mailto:${site.email}`}
                      className="transition-opacity hover:opacity-70"
                    >
                      {site.email}
                    </a>
                  </dd>
                </div>
              </dl>
            </Reveal>
          </div>
        </Container>
      </section>
    </>
  );
}

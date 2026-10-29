import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
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
  SectionHeading,
} from "@/components/ui";
import { company, spellCount, yearsTrading, type TeamMember } from "@/lib/company";
import { listings } from "@/lib/homes";
import { pages } from "@/lib/page-config";
import { projectCover, publishedProjects } from "@/lib/projects";
import { site } from "@/lib/site";
import { TESTIMONIALS } from "@/lib/testimonials";

/* Every section below is conditional on the matching field in
   `lib/company.ts`. A dealership that publishes nothing about its staff or
   its founding year gets a shorter page, not an invented one — see the note
   at the top of that file.

   The page is ordered by what a sceptical buyer needs, fastest first: the
   facts they can check (years, licence, award, reviews), houses that exist,
   a customer in their own words, and then the people. Long copy — the full
   mission, each bio — is one tap away rather than in the scroll, so the page
   reads in a minute and still holds everything the business has written. */

const sentenceCase = (s: string) => s.replace(/^./, (c) => c.toUpperCase());

const CREWS = ["Set Crew", "Concrete Crew", "Earthwork Crew"] as const;

export const metadata: Metadata = {
  title: "About",
  description: [
    company.founded
      ? `${site.name} has been setting manufactured and modular homes since ${company.founded}.`
      : `${site.name} sets manufactured and modular homes for families across ${site.stateName}.`,
    "A complete turnkey homebuilding experience — land, permitting, site work, delivery and setup.",
  ].join(" "),
};

export default function AboutPage() {
  /* Turned off in `lib/page-config.ts`, this route sends visitors home rather
     than 404ing — an indexed link or a printed card outlives the switch. */
  if (!pages.about) redirect("/");

  const years = yearsTrading();

  /* Each portrait is `page/about-team-N` by position in `company.team`, so
     the index is taken before staff, crews and partners are split apart. */
  const team = (company.team ?? []).map((member, i) => ({ member, photo: i + 1 }));
  const staff = team.filter((t) => !t.member.partner && !t.member.crew);
  const crews = CREWS.map((name) => ({
    name,
    members: team.filter((t) => t.member.crew === name),
  })).filter((c) => c.members.length > 0);
  const partners = team.filter((t) => t.member.partner);

  const projects = pages.projects ? publishedProjects() : [];
  const quote = TESTIMONIALS[0];

  /* Section numbering has to survive a missing section, so it counts up as
     the page renders rather than being written into each heading. */
  let n = 1;
  const index = () => String(n++).padStart(2, "0");

  /* Only `onLot` homes count as open to walk through — the catalogue is what
     NERTO can order, and counting it as lot stock would be a lie a visitor
     finds out on arrival. A fact that would read zero is dropped. */
  const onLot = company.homesOpenOnLot ?? listings.filter((l) => l.onLot).length;

  const facts = [
    ...(years
      ? [{ v: <CountUp to={years} />, k: `Years building in ${site.stateName}`, note: `Since ${company.founded}` }]
      : []),
    ...(projects.length
      ? [{ v: <CountUp to={projects.length} />, k: "Finished homes to look through", note: "Photos and tours", href: "/projects" }]
      : []),
    ...(onLot ? [{ v: <CountUp to={onLot} />, k: "Homes open on our lot", note: "Walk in, no appointment", href: "/address" }] : []),
    ...(company.licenseId
      ? [{ v: <>Licensed</>, k: `${site.stateName} manufactured-home dealer`, note: `#${company.licenseId}` }]
      : []),
  ];

  return (
    <>
      <PageHero
        photoKey="page/about"
        index={index()}
        /* The state, not the town — NERTO works throughout Maine, and the lot
           address is on `/address` where somebody actually wants it. */
        eyebrow={[company.founded && `Since ${company.founded}`, `Throughout ${site.stateName}`]
          .filter(Boolean)
          .join(" · ")}
        title={
          company.homesSoldWords ? (
            <>
              {sentenceCase(company.homesSoldWords)} homes,
              <br />
              one job.
            </>
          ) : (
            <>
              We are not just
              <br />
              delivering houses.
            </>
          )
        }
        lede="Land, financing, permits, site work, delivery and setup. We coordinate all of it, so you do not have to."
        kind="exterior"
        size="tall"
        breadcrumb={[
          { href: "/", label: "Home" },
          { href: "/about", label: "About" },
        ]}
      />

      {/* Proof first — the things a visitor can check for themselves. */}
      {(facts.length > 0 || (company.awards ?? []).length > 0 || company.reviewsUrl) && (
        <section className="border-b border-line bg-surface">
          <Container className="py-10 sm:py-12">
            {facts.length > 0 && (
              <dl className="grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4">
                {facts.map((f) => {
                  const body = (
                    <>
                      <dd className="font-display text-4xl leading-none tracking-tight text-ink">
                        {f.v}
                      </dd>
                      <dt className="mt-3 text-[0.92rem] font-semibold leading-snug text-ink">
                        {f.k}
                      </dt>
                      <dd className="mt-1 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-muted">
                        {f.note}
                      </dd>
                    </>
                  );
                  return (
                    <div key={f.k}>
                      {f.href ? (
                        <Link href={f.href} className="block transition-opacity hover:opacity-75">
                          {body}
                        </Link>
                      ) : (
                        body
                      )}
                    </div>
                  );
                })}
              </dl>
            )}

            {((company.awards ?? []).length > 0 || company.reviewsUrl) && (
              <div className="mt-10 flex flex-col gap-6 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
                {(company.awards ?? []).map((award) => (
                  <div key={award.title} className="flex items-center gap-4">
                    <Image
                      src={award.image}
                      alt={`${award.issuer}: ${award.title}`}
                      width={64}
                      height={80}
                      className="h-16 w-auto shrink-0"
                    />
                    <p className="text-sm leading-snug text-muted">
                      <span className="block font-semibold text-ink">{award.title}</span>
                      {award.issuer}
                    </p>
                  </div>
                ))}
                {company.reviewsUrl && (
                  <a
                    href={company.reviewsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-ink underline-offset-4 hover:underline"
                  >
                    Read our reviews on {company.reviewsLabel ?? "the web"}
                    <Icon.External className="size-3.5" />
                  </a>
                )}
              </div>
            )}
          </Container>
        </section>
      )}

      {/* Mission and how we work, side by side. The opening paragraph is
          shown; the rest of NERTO's own words are one tap away. */}
      {(company.story || (company.principles ?? []).length > 0) && (
        <section>
          <Container className="py-16 sm:py-20">
            <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
              {company.story && (
                <Reveal>
                  <Eyebrow index={index()}>{company.story.eyebrow}</Eyebrow>
                  <h2 className="mt-5 font-display text-headline text-balance text-ink">
                    {company.story.heading}
                  </h2>
                  <p className="mt-6 text-lg leading-relaxed text-muted">
                    {company.story.paragraphs[0]}
                  </p>
                  {company.story.paragraphs.length > 1 && (
                    <details className="group mt-4">
                      <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 text-sm font-semibold text-ink underline-offset-4 hover:underline [&::-webkit-details-marker]:hidden">
                        Read our full mission
                        <Icon.Chevron className="size-3.5 transition-transform group-open:rotate-90" />
                      </summary>
                      <div className="mt-4 space-y-4 leading-relaxed text-muted">
                        {company.story.paragraphs.slice(1).map((p, i) => (
                          <p key={i}>{p}</p>
                        ))}
                      </div>
                    </details>
                  )}
                </Reveal>
              )}

              {company.principles && company.principles.length > 0 && (
                <Reveal delay={100}>
                  <ul className="grid gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-2">
                    {company.principles.map((p) => {
                      const PrincipleIcon = Icon[p.icon];
                      return (
                        <li key={p.title} className="bg-paper p-6">
                          <span className="grid size-10 place-items-center rounded-full bg-ember text-on-ember">
                            <PrincipleIcon className="size-[1.1rem]" />
                          </span>
                          <h3 className="mt-4 font-display text-xl leading-snug tracking-tight text-ink">
                            {p.title}
                          </h3>
                          <p className="mt-2 text-[0.92rem] leading-relaxed text-muted">{p.body}</p>
                        </li>
                      );
                    })}
                  </ul>
                </Reveal>
              )}
            </div>
          </Container>
        </section>
      )}

      {/* Houses that exist — the strongest evidence a builder has. */}
      {projects.length > 0 && (
        <section className="border-y border-line bg-surface">
          <Container className="py-16 sm:py-20">
            <Reveal>
              <SectionHeading
                index={index()}
                eyebrow="Our work"
                title="Homes we've put on the ground."
                action={
                  <ButtonLink href="/projects" variant="outline">
                    See all {projects.length}
                    <Icon.Arrow className="size-4" />
                  </ButtonLink>
                }
              />
            </Reveal>
            <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {projects.slice(0, 4).map((project, i) => {
                const cover = projectCover(project);
                return (
                  <Reveal key={project.slug} delay={i * 70}>
                    <Link href={`/projects/${project.slug}`} className="group block">
                      <div className="grain relative aspect-[4/3] overflow-hidden rounded-card bg-surface-2">
                        {cover && (
                          <Image
                            src={cover}
                            alt={project.title}
                            fill
                            sizes="(min-width: 1024px) 25vw, 50vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                          />
                        )}
                      </div>
                      <p className="mt-3 font-display text-lg leading-snug tracking-tight text-ink transition-colors group-hover:text-ember">
                        {project.title}
                      </p>
                      {project.location && (
                        <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-muted">
                          {project.location}
                        </p>
                      )}
                    </Link>
                  </Reveal>
                );
              })}
            </div>
          </Container>
        </section>
      )}

      {/* One customer, in their own words, with the source a click away. */}
      {quote && (
        <section>
          <Container className="py-16 sm:py-20">
            <Reveal>
              <figure className="mx-auto max-w-3xl text-center">
                <blockquote className="font-display text-2xl leading-snug tracking-tight text-balance text-ink sm:text-3xl">
                  &ldquo;{quote.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-6 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted">
                  {quote.name} · {quote.detail}
                </figcaption>
              </figure>
            </Reveal>
          </Container>
        </section>
      )}

      {/* The people: faces, names and roles at a glance; each bio opens on a tap. */}
      {(staff.length > 0 || crews.length > 0) && (
        <section className="border-t border-line bg-surface">
          <Container className="py-16 sm:py-20">
            <Reveal>
              <SectionHeading
                index={index()}
                eyebrow="Who you'll actually meet"
                title="The people behind your home."
                lede={company.teamNote}
              />
            </Reveal>

            {staff.length > 0 && (
              <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {staff.map(({ member, photo }, i) => (
                  <Reveal key={member.name} delay={(i % 4) * 60}>
                    <StaffCard member={member} photo={photo} />
                  </Reveal>
                ))}
              </div>
            )}

            {crews.length > 0 && (
              <div className="mt-14 border-t border-line pt-10">
                <p className="eyebrow">In the field</p>
                <p className="mt-3 max-w-2xl leading-relaxed text-muted">
                  The crews who pour the foundation, cut the driveway and set and finish the
                  house are ours — not a list of subcontractors you have to chase.
                </p>
                <div className="mt-8 grid gap-10 md:grid-cols-3">
                  {crews.map((crew) => (
                    <div key={crew.name}>
                      <h3 className="font-display text-xl tracking-tight text-ink">{crew.name}</h3>
                      <ul className="mt-5 grid grid-cols-4 gap-x-3 gap-y-5 sm:grid-cols-5 md:grid-cols-3 lg:grid-cols-4">
                        {crew.members.map(({ member, photo }) => (
                          <li key={member.name} className="text-center">
                            <Scene
                              kind="porch"
                              photoKey={`page/about-team-${photo}`}
                              sizes="80px"
                              label={member.name}
                              className="mx-auto aspect-square w-full max-w-20 rounded-full"
                            />
                            <p className="mt-2 text-[0.78rem] leading-tight text-ink">
                              {member.name}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Container>
        </section>
      )}

      {partners.length > 0 && (
        <section>
          <Container className="py-16 sm:py-20">
            <Reveal>
              <SectionHeading
                eyebrow="Trusted local partners"
                title="The lender and agent we work alongside."
              />
            </Reveal>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {partners.map(({ member, photo }) => (
                <Reveal key={member.name}>
                  <div className="flex h-full gap-5 rounded-card border border-line bg-paper p-6">
                    <Scene
                      kind="living"
                      photoKey={`page/about-team-${photo}`}
                      sizes="96px"
                      label={member.name}
                      className="size-20 shrink-0 rounded-full sm:size-24"
                    />
                    <div className="min-w-0">
                      <p className="font-display text-xl leading-tight tracking-tight text-ink">
                        {member.name}
                      </p>
                      <p className="mt-1 font-mono text-[0.68rem] text-muted">{member.role}</p>
                      <p className="mt-3 line-clamp-4 text-[0.92rem] leading-relaxed text-muted">
                        {Array.isArray(member.body) ? member.body[0] : member.body}
                      </p>
                      {member.link && <MemberLink link={member.link} />}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Visit */}
      <section className="border-t border-line bg-ink py-16 text-paper dark:bg-surface dark:text-ink sm:py-20">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <Reveal>
              <Eyebrow index={index()} className="!text-current opacity-60">
                The lot
              </Eyebrow>
              <h2 className="mt-5 font-display text-headline text-balance">
                {onLot ? `${sentenceCase(spellCount(onLot))} homes open to walk through.` : "Come and walk the lot."}
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

/* A face, a name and a role in the grid; the bio opens in place on a tap,
   so the team reads at a glance and nothing the team wrote is dropped. */
function StaffCard({ member, photo }: { member: TeamMember; photo: number }) {
  const paragraphs = Array.isArray(member.body) ? member.body : [member.body];
  const first = member.name.split(" ")[0];
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-card border border-line bg-paper">
      <Scene
        kind="living"
        photoKey={`page/about-team-${photo}`}
        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
        label={member.name}
        className="aspect-square w-full"
      />
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <p className="font-display text-lg leading-tight tracking-tight text-ink">{member.name}</p>
        <p className="mt-1 text-[0.8rem] leading-snug text-muted">
          {member.role.split(" · ")[0]}
          {member.since && <> · since {member.since}</>}
        </p>
        <details className="group mt-3">
          <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-[0.8rem] font-semibold text-ink underline-offset-4 hover:underline [&::-webkit-details-marker]:hidden">
            About {first}
            <Icon.Chevron className="size-3 transition-transform group-open:rotate-90" />
          </summary>
          <div className="mt-3 space-y-3 text-[0.85rem] leading-relaxed text-muted">
            {member.role.includes(" · ") && <p className="text-ink">{member.role}</p>}
            {paragraphs.map((p, j) => (
              <p key={j}>{p}</p>
            ))}
            {member.link && <MemberLink link={member.link} />}
          </div>
        </details>
      </div>
    </div>
  );
}

function MemberLink({ link }: { link: { href: string; label: string } }) {
  const external = link.href.startsWith("http");
  return (
    <Link
      href={link.href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-ink underline-offset-4 hover:underline"
    >
      {link.label}
      {external ? <Icon.External className="size-3.5" /> : <Icon.Arrow className="size-3.5" />}
    </Link>
  );
}

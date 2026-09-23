import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ContactBand } from "@/components/contact-band";
import { InquiryForm } from "@/components/inquiry-form";
import { Badge, ButtonLink, Container, Eyebrow, Icon, SpecRow } from "@/components/ui";
import { getListing } from "@/lib/homes";
import { pages } from "@/lib/page-config";
import { projectBySlug, projects } from "@/lib/projects";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

const completed = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

function completedLabel(value?: string): string | undefined {
  if (!value) return undefined;
  const iso = value.length === 7 ? `${value}-01` : value;
  return completed.format(new Date(`${iso}T00:00:00Z`));
}

export async function generateMetadata(
  props: PageProps<"/projects/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const project = projectBySlug(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.summary,
  };
}

export default async function ProjectPage(props: PageProps<"/projects/[slug]">) {
  if (!pages.projects) redirect("/");

  const { slug } = await props.params;
  const project = projectBySlug(slug);
  if (!project) notFound();

  const when = completedLabel(project.completedOn);
  /* The plan that was set, where it is still one we carry. A project outlives
     a catalogue, so a home that has been discontinued simply loses the link
     rather than breaking the page. */
  const home = project.homeSlug ? getListing(project.homeSlug) : undefined;
  const [cover, ...rest] = project.photos ?? [];

  return (
    <>
      <Container className="pb-16 pt-10 sm:pt-12">
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex flex-wrap items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted">
            {[
              { href: "/", label: "Home" },
              { href: "/projects", label: "Past projects" },
              { href: `/projects/${project.slug}`, label: project.title },
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

        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="ember">Built by {site.name}</Badge>
            {when && <Badge tone="muted">{when}</Badge>}
          </div>
          <h1 className="mt-6 font-display text-display text-balance text-ink">
            {project.title}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted">{project.summary}</p>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted">
            {["Delivered", "Set", "Sold"].map((step) => (
              <span key={step} className="flex items-center gap-1.5">
                <Icon.Check className="size-3.5 text-moss" />
                {step}
              </span>
            ))}
          </div>
        </div>

        {cover && (
          <div className="grain relative mt-12 aspect-[16/9] overflow-hidden rounded-card bg-surface-2">
            <Image
              src={cover}
              alt={project.title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>
        )}

        <div className="mt-14 grid gap-14 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
          <div>
            {project.body && project.body.length > 0 && (
              <div className="space-y-6 text-lg leading-relaxed text-muted">
                {project.body.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            )}

            {project.testimonial && (
              <blockquote className="mt-12 rounded-card border border-line bg-surface p-8">
                <p className="font-display text-2xl leading-snug tracking-tight text-ink">
                  &ldquo;{project.testimonial.quote}&rdquo;
                </p>
                <footer className="mt-5 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted">
                  {project.testimonial.attribution}
                </footer>
              </blockquote>
            )}

            {project.videos && project.videos.length > 0 && (
              <div className="mt-14">
                <Eyebrow index="02">Walk through it</Eyebrow>
                {/* Phone footage, so portrait tiles: two across on a phone,
                    three on anything wider. Nothing downloads until play. */}
                <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {project.videos.map((video) => (
                    <figure key={video.src}>
                      <video
                        src={video.src}
                        poster={video.poster}
                        controls
                        playsInline
                        preload="none"
                        className={`w-full rounded-card bg-surface-2 object-cover ${
                          video.portrait === false ? "aspect-video" : "aspect-[9/16]"
                        }`}
                      />
                      <figcaption className="mt-2 flex items-baseline justify-between gap-2 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted">
                        <span>{video.title}</span>
                        {video.duration && <span>{video.duration}</span>}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </div>
            )}

            {rest.length > 0 && (
              <div className="mt-14">
                <Eyebrow index={project.videos?.length ? "03" : "02"}>On site</Eyebrow>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {rest.map((photo) => (
                    <div
                      key={photo}
                      className="grain relative aspect-[4/3] overflow-hidden rounded-card bg-surface-2"
                    >
                      <Image
                        src={photo}
                        alt={project.title}
                        fill
                        sizes="(min-width: 640px) 50vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-6 lg:sticky lg:top-28">
            <div className="rounded-card border border-line-strong bg-paper p-7">
              <p className="eyebrow">Like this build?</p>
              <p className="mt-3 font-display text-2xl leading-snug tracking-tight text-ink">
                Order this design.
              </p>
              <p className="mt-3 text-[0.9rem] leading-relaxed text-muted">
                {home
                  ? `Same ${home.name}, land through finish — priced for your lot.`
                  : "Land through finish, priced for your lot — tell us what you have in mind."}
              </p>
              <ButtonLink href={home ? "#quote" : "#contact"} className="group/btn mt-6 w-full !py-3.5">
                Order this design
                <Icon.Arrow className="size-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
              </ButtonLink>
            </div>

            <div className="rounded-card border border-line bg-surface p-7">
              <p className="eyebrow">The job</p>
              <dl className="mt-5 space-y-1">
                {project.location && <SpecRow label="Where" value={project.location} />}
                {when && <SpecRow label="Completed" value={when} />}
                {home && <SpecRow label="Home set" value={home.name} />}
              </dl>

              {project.scope && project.scope.length > 0 && (
                <>
                  <p className="eyebrow mt-8">What we handled</p>
                  <ul className="mt-4 space-y-2.5">
                    {project.scope.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 leading-relaxed text-muted">
                        <Icon.Check className="mt-1 size-4 shrink-0 text-ember" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {home && (
                <Link
                  href={`/listings/${home.slug}`}
                  className="group mt-8 flex items-center justify-between gap-3 rounded-card border border-line bg-paper p-5 transition-colors hover:border-line-strong"
                >
                  <span>
                    <span className="eyebrow">The plan</span>
                    <span className="mt-2 block font-display text-xl tracking-tight text-ink">
                      {home.name}
                    </span>
                  </span>
                  <Icon.Arrow className="size-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              )}
            </div>
          </aside>
        </div>
      </Container>

      {home && (
        <section
          id="quote"
          className="scroll-mt-[calc(var(--chrome-h)+1.5rem)] border-y border-line bg-surface"
        >
          <Container className="py-20 sm:py-24">
            <div className="mx-auto max-w-xl">
              <InquiryForm
                defaultHome={home.slug}
                title={`Order this design — ${home.name}`}
                lede={`Same plan, land through finish. Tell us about your lot and we'll call to talk about what it takes to put one there.`}
                successTitle="Good — we've got it."
                successBody="A real person will call to talk about your land and what it takes to build this one there. No pressure, no obligation."
              />
            </div>
          </Container>
        </section>
      )}

      <div id="contact" className="scroll-mt-[calc(var(--chrome-h)+1.5rem)]">
        <ContactBand />
      </div>
    </>
  );
}

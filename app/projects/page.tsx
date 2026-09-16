import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ContactBand } from "@/components/contact-band";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { Icon, Section } from "@/components/ui";
import { pages } from "@/lib/page-config";
import { projectCover, publishedProjects } from "@/lib/projects";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Past projects",
  description: `Homes ${site.name} has actually built and delivered across ${site.stateName} — land found, permits pulled, site work done, home set and finished. Start to finish, by us.`,
};

const completed = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** `2025-04` and `2025-04-18` both need to become a Date without drifting. */
function completedLabel(value?: string): string | undefined {
  if (!value) return undefined;
  const iso = value.length === 7 ? `${value}-01` : value;
  return completed.format(new Date(`${iso}T00:00:00Z`));
}

export default function ProjectsPage() {
  /* Off until `lib/projects.ts` holds something — an empty gallery of past
     work reads as a company that has not done any. */
  if (!pages.projects) redirect("/");

  const projects = publishedProjects();
  if (projects.length === 0) redirect("/");

  return (
    <>
      <PageHero
        photoKey="page/projects"
        index="01"
        eyebrow={`${projects.length} ${projects.length === 1 ? "project" : "projects"}`}
        title={
          <>
            Houses we built,
            <br />
            standing in {site.stateName}.
          </>
        }
        lede="A catalogue is a set of plans on a manufacturer's website. This is what we did with them: land found, permits pulled, septic and foundation in, home delivered, set, and finished — start to finish, by us."
        kind="exterior"
        breadcrumb={[
          { href: "/", label: "Home" },
          { href: "/projects", label: "Past projects" },
        ]}
      />

      <Section>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, i) => {
            const cover = projectCover(project);
            const when = completedLabel(project.completedOn);
            return (
              <Reveal key={project.slug} delay={i * 70}>
                <Link
                  href={`/projects/${project.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-card border border-line bg-surface transition-all duration-500 hover:-translate-y-1 hover:border-line-strong"
                >
                  <div className="grain relative aspect-[4/3] overflow-hidden bg-surface-2">
                    {cover ? (
                      <Image
                        src={cover}
                        alt={project.title}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
                      />
                    ) : (
                      <div className="absolute inset-0 grid place-items-center">
                        <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted">
                          Photograph to come
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    {(project.location || when) && (
                      <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted">
                        {[project.location, when].filter(Boolean).join(" · ")}
                      </p>
                    )}
                    <h2 className="mt-3 font-display text-2xl leading-snug tracking-tight text-ink transition-colors group-hover:text-ember">
                      {project.title}
                    </h2>
                    <p className="mt-3 flex-1 leading-relaxed text-muted">{project.summary}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted">
                      {["Delivered", "Set", "Sold"].map((step) => (
                        <span key={step} className="flex items-center gap-1.5">
                          <Icon.Check className="size-3 text-moss" />
                          {step}
                        </span>
                      ))}
                    </div>
                    <span className="mt-5 inline-flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-ink">
                      See how we built it
                      <Icon.Arrow className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </Section>

      <ContactBand />
    </>
  );
}

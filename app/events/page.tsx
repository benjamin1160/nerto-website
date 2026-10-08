import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { ButtonLink, Icon, Section } from "@/components/ui";
import { currentEvents } from "@/lib/events";
import { pages } from "@/lib/page-config";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Events",
  description: `Upcoming events at ${site.name} in Chelsea, Maine.`,
};

const eventDate = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "America/New_York",
});

const eventTime = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: "America/New_York",
});

export default function EventsPage() {
  if (!pages.events) redirect("/");
  const upcoming = currentEvents();

  return (
    <>
      <PageHero
        photoKey="page/address"
        index="01"
        eyebrow="At the Chelsea lot"
        title={<>Come see what&rsquo;s happening.</>}
        lede="Family events, open houses, and a chance to walk through our model homes in person."
        kind="exterior"
        breadcrumb={[{ href: "/", label: "Home" }, { href: "/events", label: "Events" }]}
      />

      <Section>
        {upcoming.length ? (
          <div className="grid gap-10">
            {upcoming.map((event, index) => {
              const starts = new Date(event.startsAt);
              const ends = new Date(event.endsAt);
              return (
                <Reveal key={event.slug} delay={index * 90}>
                  <article className="grid overflow-hidden rounded-card border border-line bg-surface shadow-sm lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                    <div className="relative aspect-square min-h-[20rem] bg-surface-2 lg:aspect-auto">
                      <Image
                        src={event.image}
                        alt={`${event.title} event flyer`}
                        fill
                        priority={index === 0}
                        sizes="(max-width: 1024px) 100vw, 45vw"
                        className="object-cover"
                      />
                    </div>

                    <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">
                      <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-ember">
                        Upcoming event
                      </p>
                      <h2 className="mt-4 font-display text-[clamp(2rem,5vw,3.6rem)] leading-none tracking-tight text-ink">
                        {event.title}
                      </h2>
                      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
                        {event.summary}
                      </p>

                      <dl className="mt-8 grid gap-4 text-sm sm:grid-cols-2">
                        <div className="rounded-xl bg-surface-2 p-4">
                          <dt className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted">Date & time</dt>
                          <dd className="mt-2 font-semibold leading-relaxed text-ink">
                            {eventDate.format(starts)}<br />
                            {eventTime.format(starts)}–{eventTime.format(ends)}
                          </dd>
                        </div>
                        <div className="rounded-xl bg-surface-2 p-4">
                          <dt className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted">Location</dt>
                          <dd className="mt-2 font-semibold leading-relaxed text-ink">
                            {event.location}<br />{event.address}
                          </dd>
                        </div>
                      </dl>

                      <ul className="mt-8 grid gap-2 sm:grid-cols-2">
                        {event.highlights.map((highlight) => (
                          <li key={highlight} className="flex items-center gap-2 text-sm text-ink-soft">
                            <span className="text-ember" aria-hidden>✓</span>{highlight}
                          </li>
                        ))}
                      </ul>

                      {event.offer && (
                        <p className="mt-8 rounded-xl border border-ember/30 bg-ember-wash p-4 text-sm font-medium leading-relaxed text-ink">
                          <strong>Event treat:</strong> {event.offer}
                        </p>
                      )}

                      <div className="mt-8 flex flex-wrap gap-3">
                        <ButtonLink href="/contact">Ask us about the event</ButtonLink>
                        {event.externalHref && (
                          <Link
                            href={event.externalHref}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-button border border-line-strong px-6 py-3 text-[0.9rem] font-medium text-ink transition-colors hover:border-ink"
                          >
                            Facebook event <Icon.External className="size-4" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        ) : (
          <Reveal>
            <div className="rounded-card border border-line bg-surface p-8 sm:p-12">
              <h2 className="font-display text-3xl text-ink">No events are scheduled right now.</h2>
              <p className="mt-4 max-w-xl leading-relaxed text-muted">
                Check back soon, or contact the NERTO team to plan a model-home visit.
              </p>
              <ButtonLink href="/contact" className="mt-7">Plan a visit</ButtonLink>
            </div>
          </Reveal>
        )}
      </Section>
    </>
  );
}


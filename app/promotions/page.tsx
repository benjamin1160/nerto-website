import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ListingCard } from "@/components/listing-card";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { ButtonLink, Container, Icon, Section } from "@/components/ui";
import { listings } from "@/lib/homes";
import { pages } from "@/lib/page-config";
import { livePromotions } from "@/lib/promotions";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Current offers",
  description: `What ${site.name} has running right now, with the end date on it. Nothing stays on this page after it expires.`,
};

const fullDate = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

export default function PromotionsPage() {
  if (!pages.promotions) redirect("/");

  const live = livePromotions();

  return (
    <>
      <PageHero
        photoKey="page/promotions"
        index="01"
        eyebrow={live.length ? `${live.length} running now` : "Nothing running"}
        title={
          live.length ? (
            <>
              What&rsquo;s on,
              <br />
              and until when.
            </>
          ) : (
            <>
              Nothing on
              <br />
              at the moment.
            </>
          )
        }
        lede={
          live.length
            ? "Every offer below has a date on it. When that date passes the offer comes off this page on its own — we do not run anything past its end."
            : "We would rather show you an empty page than a deal that ended in March. The lot price is the price today; ask and we will tell you when that changes."
        }
        kind="exterior"
        breadcrumb={[
          { href: "/", label: "Home" },
          { href: "/promotions", label: "Offers" },
        ]}
      />

      <Section>
        {live.length === 0 ? (
          <Reveal>
            <div className="flex flex-col items-start gap-6 rounded-card border border-line bg-surface p-8 sm:p-12">
              <span className="grid size-12 place-items-center rounded-full bg-surface-2 text-ember">
                <Icon.Tag className="size-6" />
              </span>
              <p className="max-w-xl text-lg leading-relaxed text-muted">
                No promotion is running. The homes on the lot are priced as listed, and the
                fastest way to know when something changes is to ask a person.
              </p>
              <div className="flex flex-wrap gap-3">
                <ButtonLink href="/listings">
                  See the homes
                  <Icon.Arrow className="size-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                </ButtonLink>
                <ButtonLink href="/contact" variant="outline">
                  Ask us
                </ButtonLink>
              </div>
            </div>
          </Reveal>
        ) : (
          <div className="grid gap-8">
            {live.map((promotion, i) => {
              const applies = promotion.listingSlugs?.length
                ? listings.filter((l) => promotion.listingSlugs!.includes(l.slug))
                : [];
              const ends = promotion.endsOn
                ? new Date(`${promotion.endsOn}T00:00:00Z`)
                : undefined;

              return (
                <Reveal key={promotion.slug} delay={i * 90}>
                  <article className="rounded-card border border-line bg-surface p-8 sm:p-12">
                    <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-ember">
                      {promotion.kicker}
                    </p>
                    <h2 className="mt-4 max-w-2xl font-display text-[clamp(1.6rem,3.5vw,2.6rem)] leading-tight tracking-tight text-ink">
                      {promotion.headline}
                    </h2>
                    <p className="mt-5 max-w-2xl leading-relaxed text-muted">{promotion.body}</p>

                    {ends && !Number.isNaN(ends.getTime()) && (
                      <p className="mt-6 flex items-center gap-2 font-mono text-sm text-ink">
                        <Icon.Calendar className="size-4 text-ember" />
                        Ends {fullDate.format(ends)}
                      </p>
                    )}

                    {applies.length > 0 && (
                      <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                        {applies.map((listing) => (
                          <ListingCard key={listing.slug} listing={listing} className="h-full" />
                        ))}
                      </div>
                    )}

                    <Link
                      href={promotion.href ?? "/contact"}
                      className="group mt-10 inline-flex items-center gap-2 text-[0.95rem] font-medium text-ink underline-offset-4 hover:underline"
                    >
                      {promotion.ctaText ?? "Get the details"}
                      <Icon.Arrow className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </article>
                </Reveal>
              );
            })}
          </div>
        )}
      </Section>

      <section className="border-t border-line bg-surface">
        <Container className="py-16 text-center">
          <p className="mx-auto max-w-xl text-sm leading-relaxed text-muted">
            Offers apply to the homes named and to nothing else. Site work, land and
            titling costs are quoted separately in every case.
          </p>
        </Container>
      </section>
    </>
  );
}

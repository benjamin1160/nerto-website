import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { ButtonLink, Container, Icon, Section, SectionHeading } from "@/components/ui";
import { communities } from "@/lib/communities";
import { company } from "@/lib/company";
import { pages } from "@/lib/page-config";
import { site } from "@/lib/site";

const where = `${site.address.city}, ${site.address.region}`;

export const metadata: Metadata = {
  title: "Find us",
  description: `${site.name} is at ${site.address.street}, ${where} ${site.address.postalCode}. Opening hours, directions and what is standing on the lot when you get here.`,
};

const mapQuery = encodeURIComponent(
  `${site.address.street}, ${site.address.city}, ${site.address.region} ${site.address.postalCode}`,
);

export default function AddressPage() {
  if (!pages.address) redirect("/");

  return (
    <>
      <PageHero
        photoKey="page/address"
        index="01"
        eyebrow={where}
        title={
          <>
            The lot,
            <br />
            and how to reach it.
          </>
        }
        lede="Walk in during opening hours and somebody will hand you keys. Booking ahead only buys you a home with the skirting off."
        kind="exterior"
        breadcrumb={[
          { href: "/", label: "Home" },
          { href: "/address", label: "Find us" },
        ]}
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-3">
          <Reveal>
            <div className="flex h-full flex-col gap-4 rounded-card border border-line bg-surface p-8">
              <span className="grid size-11 place-items-center rounded-full bg-surface-2 text-ember">
                <Icon.Pin className="size-5" />
              </span>
              <h2 className="font-display text-xl tracking-tight text-ink">Where</h2>
              <address className="not-italic leading-relaxed text-muted">
                {site.address.street}
                <br />
                {site.address.city}, {site.address.region} {site.address.postalCode}
              </address>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-auto inline-flex items-center gap-2 text-[0.95rem] font-medium text-ink underline-offset-4 hover:underline"
              >
                Open in maps
                <Icon.Arrow className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            </div>
          </Reveal>

          <Reveal delay={90}>
            <div className="flex h-full flex-col gap-4 rounded-card border border-line bg-surface p-8">
              <span className="grid size-11 place-items-center rounded-full bg-surface-2 text-ember">
                <Icon.Clock className="size-5" />
              </span>
              <h2 className="font-display text-xl tracking-tight text-ink">When</h2>
              <p className="leading-relaxed text-muted">{site.hours}</p>
              {company.homesOpenOnLot && (
                <p className="text-sm leading-relaxed text-muted">
                  Usually {company.homesOpenOnLot} homes standing open and furnished at any
                  time, whatever the hour you turn up within those.
                </p>
              )}
            </div>
          </Reveal>

          <Reveal delay={180}>
            <div className="flex h-full flex-col gap-4 rounded-card border border-line bg-surface p-8">
              <span className="grid size-11 place-items-center rounded-full bg-surface-2 text-ember">
                <Icon.Phone className="size-5" />
              </span>
              <h2 className="font-display text-xl tracking-tight text-ink">Who</h2>
              <a
                href={site.phoneHref}
                className="font-mono text-lg text-ink underline-offset-4 hover:underline"
              >
                {site.phone}
              </a>
              <a
                href={`mailto:${site.email}`}
                className="text-[0.95rem] text-muted underline-offset-4 hover:text-ink hover:underline"
              >
                {site.email}
              </a>
              <ButtonLink href="/contact" variant="outline" className="mt-auto">
                Book a walkthrough
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </Section>

      {communities.length > 0 && (
        <section className="border-t border-line bg-surface">
          <Container className="py-20 sm:py-24">
            <Reveal>
              <SectionHeading
                index="02"
                eyebrow="Also worth the drive"
                title="The communities we place homes into."
                lede={`All of them within reach of the yard in ${site.address.city}. We will meet you at any of them.`}
                action={
                  <ButtonLink href="/communities" variant="outline">
                    See all
                    <Icon.Arrow className="size-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                  </ButtonLink>
                }
              />
            </Reveal>
            <ul className="mt-12 grid gap-px overflow-hidden rounded-2xl bg-line sm:grid-cols-2 lg:grid-cols-3">
              {communities.map((c, i) => (
                <Reveal key={c.slug} delay={i * 70} as="li" className="bg-paper p-7">
                  <p className="font-display text-xl tracking-tight text-ink">{c.name}</p>
                  <p className="mt-2 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted">
                    {c.city}, {c.state}
                  </p>
                </Reveal>
              ))}
            </ul>
          </Container>
        </section>
      )}
    </>
  );
}

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { InquiryForm } from "@/components/inquiry-form";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { Container, Eyebrow, Icon } from "@/components/ui";
import { communities } from "@/lib/communities";
import { site } from "@/lib/site";
import { pages } from "@/lib/page-config";

export const metadata: Metadata = {
  title: "Book a walkthrough",
  description:
    "Come down to the yard on River Road in Chelsea, Maine. No appointment needed, but booking gets you a home unskirted so you can get underneath it.",
};

const REASONS = [
  {
    icon: Icon.Plan,
    title: "See them back to back",
    body: "Walking homes one after another is the fastest way to work out what you actually want. Ring ahead and we will have the ones worth your afternoon open when you get here.",
  },
  {
    icon: Icon.Wrench,
    title: "Get under one",
    body: "Book ahead and we'll pull a skirting panel so you can see the chassis, the belly wrap and the pier stacks with your own eyes.",
  },
  {
    icon: Icon.Shield,
    title: "Bring your parcel number",
    body: "We'll pull zoning, setbacks and utility distance while you're standing there. Usually takes about ten minutes.",
  },
];

export default function ContactPage() {
  /* Turned off in `lib/page-config.ts`, this route sends visitors home rather
     than 404ing — an indexed link or a printed card outlives the switch. */
  if (!pages.contact) redirect("/");

  return (
    <>
      <PageHero
        photoKey="page/contact"
        index="01"
        eyebrow={`${site.address.city}, ${site.address.region}`}
        title={
          <>
            Come and be
            <br />
            unconvinced in person.
          </>
        }
        lede="Twenty minutes on the lot beats every brochure ever printed, including this one."
        kind="porch"
        breadcrumb={[
          { href: "/", label: "Home" },
          { href: "/contact", label: "Contact" },
        ]}
      />

      <Container className="py-20 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-20">
          <div>
            <Reveal>
              <Eyebrow index="02">What a visit looks like</Eyebrow>
              <ul className="mt-10 space-y-9">
                {REASONS.map((r) => (
                  <li key={r.title} className="flex gap-5">
                    <span className="grid size-11 shrink-0 place-items-center rounded-full border border-line-strong text-ember">
                      <r.icon className="size-5" />
                    </span>
                    <div>
                      <h3 className="font-display text-xl leading-snug tracking-tight text-ink">
                        {r.title}
                      </h3>
                      <p className="mt-2 leading-relaxed text-muted">{r.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={120} className="mt-14">
              <div className="rounded-card border border-line bg-surface p-8">
                <h3 className="eyebrow">Find us</h3>
                <dl className="mt-6 space-y-5">
                  <div>
                    <dt className="text-sm text-muted">Lot</dt>
                    <dd className="mt-1.5 leading-relaxed text-ink">
                      {site.address.street}
                      <br />
                      {site.address.city}, {site.address.region} {site.address.postalCode}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted">Hours</dt>
                    <dd className="mt-1.5 text-ink">{site.hours}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted">Phone</dt>
                    <dd className="mt-1.5 font-mono text-ink">
                      <a href={site.phoneHref} className="transition-colors hover:text-ember">
                        {site.phone}
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted">Email</dt>
                    <dd className="mt-1.5 break-all font-mono text-ink">
                      <a
                        href={`mailto:${site.email}`}
                        className="transition-colors hover:text-ember"
                      >
                        {site.email}
                      </a>
                    </dd>
                  </div>
                </dl>

                <div className="mt-8 border-t border-line pt-6">
                  <h3 className="eyebrow">Also showing at</h3>
                  <ul className="mt-4 space-y-2.5">
                    {communities.map((c) => (
                      <li key={c.slug} className="flex items-baseline justify-between gap-4">
                        <span className="text-[0.92rem] text-ink-soft">{c.name}</span>
                        <span className="font-mono text-xs text-muted">
                          {c.city}, {c.state}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          </div>

          <Reveal delay={80} className="lg:sticky lg:top-28 lg:self-start">
            <InquiryForm />
          </Reveal>
        </div>
      </Container>
    </>
  );
}

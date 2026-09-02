import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Accordion } from "@/components/accordion";
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
import { faq } from "@/lib/faq";
import { listings } from "@/lib/homes";
import { pages } from "@/lib/page-config";

export const metadata: Metadata = {
  title: "Why manufactured",
  description:
    "Manufactured, modular and mobile are three different things. A plain-English comparison against site-built homes — including the three places where the sceptics are right.",
};

const TIMELINE = [
  {
    year: "1950s",
    title: "Trailers",
    body: "Eight feet wide, towed behind a car, aluminium skin, no insulation to speak of. This is the thing everybody is still picturing. It was a vehicle, and it was sold as one.",
  },
  {
    year: "1974",
    title: "Congress steps in",
    body: "The National Mobile Home Construction and Safety Standards Act passes after a decade of genuinely alarming fire and structural failures. It creates a federal building code — the only one in the United States.",
  },
  {
    year: "1976",
    title: "The HUD Code takes effect",
    body: "June 15, 1976. Everything built after this date is legally a manufactured home, not a mobile home. Fire ratings, wind resistance, plumbing and electrical standards, third-party plant inspection. The industry is a different industry from this morning onward.",
  },
  {
    year: "1994",
    title: "Wind and thermal zones",
    body: "Post-Hurricane Andrew. Wind zones II and III introduced with dramatically higher structural requirements, plus thermal zoning that ties insulation to climate. Roof loads, anchoring and glazing all tighten.",
  },
  {
    year: "2021—2025",
    title: "Energy standards",
    body: "DOE energy conservation standards phase in, pushing envelope performance past most state codes for site-built housing. Duct leakage testing becomes mandatory. Blower-door verification becomes routine.",
  },
  {
    year: "Today",
    title: "Where we actually are",
    body: "A 2026 HUD-code home from a good plant is tighter, better insulated and more consistently built than the median new site-built house in the same market. This is not a marketing claim; it is what the testing shows.",
  },
];

const COMPARE = {
  columns: ["Manufactured (HUD)", "Modular (IRC)", "Site-built"],
  rows: [
    {
      label: "Building code",
      values: ["Federal HUD Code — one standard nationwide", "State/local IRC, same as site-built", "State/local IRC"],
    },
    {
      label: "Where it's built",
      values: ["Indoors, on a jig", "Indoors, on a jig", "Outdoors, in whatever weather there is"],
    },
    {
      label: "Inspection",
      values: ["9 third-party in-plant inspections", "In-plant + local final", "3–6 local inspections, mostly visual"],
    },
    {
      label: "Build time",
      values: ["8–12 weeks", "10–16 weeks", "7–14 months"],
    },
    {
      label: "Typical cost / sq ft",
      values: ["$95–135", "$140–190", "$220–380"],
    },
    {
      label: "Chassis",
      values: ["Permanent welded steel", "Removable carrier", "None"],
    },
    {
      label: "Financing",
      values: ["Chattel, or real-property lending on owned land", "Conventional construction loan", "Conventional construction loan"],
    },
    {
      label: "Appreciation",
      values: ["Follows the land and titling", "Same as site-built", "Same as site-built"],
    },
    {
      label: "Lumber rained on",
      values: ["Never", "Never", "Frequently"],
    },
  ],
};

const HONEST = [
  {
    title: "Financing on leased land really is worse.",
    body: "A chattel loan on a rented pad runs roughly two points over a comparable mortgage and amortises over 20–23 years instead of 30. Nobody should pretend otherwise. It is why our first question is always about the ground, not the granite.",
  },
  {
    title: "Resale is thinner, and slower.",
    body: "The buyer pool for a home on leased land is smaller and more credit-constrained. Expect a longer time on market than a comparable site-built house. On owned land with a permanent foundation, this evens out almost completely — but it takes a permanent foundation, not a promise.",
  },
  {
    title: "The floor is a real floor, but the market's floor isn't.",
    body: "There are still bad plants and bad dealers, and the price spread between the worst HUD-code home and the best one is enormous. Ask any dealer for the in-plant inspection reports and the blower-door result. If they can't produce them in a day, walk.",
  },
];

/* Reference points only. Per-home HERS figures belong on the listings
   themselves; nothing here claims a rating for a home that has not published
   one. */
const HERS_MARKS = [
  { score: 130, label: "Typical 2005 home", tone: "muted" },
  { score: 100, label: "New code-built home", tone: "line" },
  { score: 62, label: "Typical new HUD-code home", tone: "ember" },
];

function HersScale() {
  /* Only homes that publish a HERS index count toward the average. */
  const rated = listings.map((l) => l.hers).filter((h): h is number => h !== undefined);
  const avgHers = rated.length
    ? Math.round(rated.reduce((a, h) => a + h, 0) / rated.length)
    : 0;

  const max = 150;
  return (
    <div className="rounded-card border border-line bg-surface p-6 sm:p-9">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h3 className="font-display text-2xl tracking-tight text-ink">The HERS index</h3>
        <span className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted">
          Lower is better
        </span>
      </div>
      <p className="mt-4 max-w-xl leading-relaxed text-muted">
        A HERS rating is the industry&apos;s standardised energy score. 100 is a house built
        exactly to the 2006 reference code. Every point below that is a one percent
        reduction in modelled energy use.
      </p>

      <div className="mt-10 space-y-7">
        {HERS_MARKS.map((m) => (
          <div key={m.label}>
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-[0.9rem] text-ink">{m.label}</span>
              <span className="font-mono text-sm text-ink">{m.score}</span>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${(m.score / max) * 100}%`,
                  background:
                    m.tone === "ember"
                      ? "var(--ember)"
                      : m.tone === "moss"
                        ? "var(--moss)"
                        : m.tone === "line"
                          ? "var(--line-strong)"
                          : "var(--muted)",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {rated.length > 0 && (
        <p className="mt-8 border-t border-line pt-6 text-[0.88rem] leading-relaxed text-muted">
          Across the {rated.length} rated {rated.length === 1 ? "home" : "homes"} on this site the
          average is HERS {avgHers} — meaning roughly {100 - avgHers}% less modelled energy use
          than a house built to code today.
        </p>
      )}
    </div>
  );
}

export default function WhyPage() {
  /* Turned off in `lib/page-config.ts`, this route sends visitors home rather
     than 404ing — an indexed link or a printed card outlives the switch. */
  if (!pages.whyManufactured) redirect("/");

  return (
    <>
      <PageHero
        photoKey="page/why-manufactured"
        index="01"
        eyebrow="The long answer"
        title={
          <>
            Yes, but really —
            <br />
            are they any good?
          </>
        }
        lede="A straight answer, including the parts that aren't flattering. If you only read one page on this site, read this one."
        kind="exterior"
        breadcrumb={[
          { href: "/", label: "Home" },
          { href: "/why-manufactured", label: "Why manufactured" },
        ]}
      />

      {/* Timeline */}
      <Section>
        <Reveal>
          <SectionHeading
            index="02"
            eyebrow="A short history of a bad reputation"
            title="Everything went wrong before 1976. Almost nothing has since."
            lede="The reputation attached itself to a product that no longer legally exists. Here is the actual sequence."
          />
        </Reveal>

        <ol className="mt-16 grid gap-px overflow-hidden rounded-2xl bg-line md:grid-cols-2 lg:grid-cols-3">
          {TIMELINE.map((t, i) => (
            <Reveal
              key={t.year}
              delay={i * 70}
              as="li"
              className="flex flex-col gap-4 bg-paper p-8"
            >
              <div className="flex items-baseline justify-between gap-4">
                <span className="font-mono text-sm text-ember">{t.year}</span>
                <span className="font-mono text-[0.65rem] text-muted">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="font-display text-2xl leading-snug tracking-tight text-ink">
                {t.title}
              </h3>
              <p className="text-[0.95rem] leading-relaxed text-muted">{t.body}</p>
            </Reveal>
          ))}
        </ol>
      </Section>

      {/* Comparison */}
      <section className="border-y border-line bg-surface">
        <Container className="py-20 sm:py-28">
          <Reveal>
            <SectionHeading
              index="03"
              eyebrow="Three different things"
              title="Manufactured, modular, site-built."
              lede="These get used interchangeably and they are not interchangeable. The differences change your code, your lender, your timeline and your price by a factor of three."
            />
          </Reveal>

          <Reveal className="mt-14">
            <div className="overflow-x-auto rounded-2xl border border-line bg-paper">
              <table className="w-full min-w-[46rem] border-collapse text-left">
                <caption className="sr-only">
                  Manufactured, modular and site-built homes compared across nine criteria
                </caption>
                <thead>
                  <tr className="border-b border-line">
                    <th scope="col" className="p-5 text-left">
                      <span className="eyebrow">Criterion</span>
                    </th>
                    {COMPARE.columns.map((c, i) => (
                      <th key={c} scope="col" className="p-5 text-left">
                        <span
                          className={`font-display text-lg tracking-tight ${
                            i === 0 ? "text-ember" : "text-ink"
                          }`}
                        >
                          {c}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARE.rows.map((row) => (
                    <tr key={row.label} className="border-b border-line last:border-b-0">
                      <th scope="row" className="p-5 align-top text-sm font-medium text-ink">
                        {row.label}
                      </th>
                      {row.values.map((v, i) => (
                        <td
                          key={i}
                          className={`p-5 align-top text-[0.9rem] leading-relaxed ${
                            i === 0 ? "bg-ember/[0.06] text-ink" : "text-muted"
                          }`}
                        >
                          {v}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Energy */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <Eyebrow index="04">Energy</Eyebrow>
            <h2 className="mt-5 font-display text-headline text-balance text-ink">
              The bill is where the argument ends.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-muted">
              Envelope performance is the one claim in this industry that cannot be
              fudged, because a third party puts a fan in your front door and measures it.
              Our homes leave the plant blower-door tested, with the result on paper, in
              the drawer, in the kitchen.
            </p>
            <p className="mt-5 text-lg leading-relaxed text-muted">
              A factory does this better than a job site for an unglamorous reason: the
              same crew installs the same window flashing detail four hundred times a year
              under a roof, at waist height, with the wall lying flat on a table.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Badge tone="ember">Blower-door tested</Badge>
              <Badge>Duct leakage verified</Badge>
              <Badge>ENERGY STAR pathway available</Badge>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <HersScale />
          </Reveal>
        </div>
      </Section>

      {/* Where the sceptics are right */}
      <section className="border-y border-line bg-ink py-20 text-paper dark:bg-surface dark:text-ink sm:py-28">
        <Container>
          <Reveal>
            <Eyebrow index="05" className="!text-current opacity-60">
              Where the sceptics are right
            </Eyebrow>
            <h2 className="mt-5 max-w-3xl font-display text-headline text-balance">
              Three things we are not going to talk you out of.
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed opacity-70">
              Any dealer who tells you there is no downside is telling you something else
              too, and you should listen to that instead.
            </p>
          </Reveal>

          <ol className="mt-14 grid gap-px overflow-hidden rounded-2xl bg-current/15 lg:grid-cols-3">
            {HONEST.map((h, i) => (
              <Reveal
                key={h.title}
                delay={i * 90}
                as="li"
                className="flex flex-col gap-4 bg-ink p-8 dark:bg-surface"
              >
                <span className="font-mono text-xs text-ember">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display text-2xl leading-snug tracking-tight">{h.title}</h3>
                <p className="leading-relaxed opacity-70">{h.body}</p>
              </Reveal>
            ))}
          </ol>
        </Container>
      </section>

      {/* FAQ */}
      <Section id="faq">
        <Reveal>
          <SectionHeading
            index="06"
            eyebrow="Common questions"
            title="The ones we actually get asked."
            action={
              pages.faq && faq.length > 6 ? (
                <ButtonLink href="/faq" variant="outline">
                  All {faq.length} questions
                  <Icon.Arrow className="size-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                </ButtonLink>
              ) : undefined
            }
          />
        </Reveal>
        <Reveal className="mt-12">
          <Accordion
            items={faq.slice(0, 6).map((item) => ({
              title: item.question,
              body: (
                <>
                  {item.answer.map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </>
              ),
            }))}
            defaultOpen={0}
          />
        </Reveal>

        <Reveal className="mt-16">
          <div className="flex flex-col items-start gap-6 rounded-card border border-line bg-surface p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
            <div>
              <h3 className="font-display text-2xl tracking-tight text-ink">
                Still not convinced?
              </h3>
              <p className="mt-2 max-w-lg leading-relaxed text-muted">
                Good. Come and be unconvinced in person — it takes about twenty minutes
                and a flashlight.
              </p>
            </div>
            <ButtonLink href="/contact" className="shrink-0 !px-7 !py-4 !text-base">
              Book a walkthrough
              <Icon.Arrow className="size-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
            </ButtonLink>
          </div>
        </Reveal>
      </Section>
    </>
  );
}

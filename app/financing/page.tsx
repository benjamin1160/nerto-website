import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Accordion } from "@/components/accordion";
import { PageHero } from "@/components/page-hero";
import { PaymentCalculator } from "@/components/payment-calculator";
import { Reveal } from "@/components/reveal";
import {
  Badge,
  ButtonLink,
  Container,
  Icon,
  Section,
  SectionHeading,
} from "@/components/ui";
import { company } from "@/lib/company";
import { hasPrices, priceBounds } from "@/lib/homes";
import { money } from "@/lib/format";
import { pages } from "@/lib/page-config";

export const metadata: Metadata = {
  title: "Financing",
  description:
    "Conventional, FHA, VA and cash — what each actually costs, and the order of operations that keeps a manufactured home purchase from going sideways.",
};

const PATHS = [
  {
    name: "Conventional",
    rate: "6.4 – 7.1%",
    term: "30 yr",
    down: "5% down",
    tone: "ember" as const,
    needs: "Owned land · permanent foundation · real-property title",
    body: "Fannie Mae's MH Advantage and Freddie's CHOICEHome both price manufactured homes at or near site-built rates when the home meets the eligibility criteria. Ask whether the home you are looking at is built to that specification — it is worth a great deal at closing.",
  },
  {
    name: "FHA Title II",
    rate: "6.2 – 6.9%",
    term: "30 yr",
    down: "3.5% down",
    tone: "moss" as const,
    needs: "Owned land · permanent foundation · 400+ sq ft",
    body: "The most forgiving credit profile of any real-property option, and the lowest down payment. It requires an engineer's foundation certification, so build that into the schedule rather than discovering it at the end.",
  },
  {
    name: "VA",
    rate: "6.0 – 6.7%",
    term: "30 yr",
    down: "0% down",
    tone: "moss" as const,
    needs: "Eligible service · owned land · permanent foundation",
    body: "No down payment and no mortgage insurance. Fewer lenders write VA on manufactured homes, so the shortlist is short — ask us who is writing them in Maine this month before you spend six weeks with the wrong originator.",
  },
  {
    name: "Cash / construction",
    rate: "—",
    term: "—",
    down: "—",
    tone: "neutral" as const,
    needs: "Any",
    /* The deposit schedule is this dealership's own term, not an industry
       standard — it lives in `lib/company.ts` and this row falls back to a
       claim-free line when none is set. */
    body:
      company.cashDepositSchedule ??
      "No lender, no appraisal and no rate to compare. Ask us for the deposit schedule in writing before you pay anything.",
  },
];

const ORDER = [
  {
    n: "01",
    title: "Call or visit the team",
    body: "Before a lender, before a floor plan. Ten minutes on the phone, or a walk through the homes standing on River Road, tells us where you are — land or no land, credit, budget — and tells you which of the paths above is actually open to you. If you do not own land yet, the buyer's guide at /start-here walks through the three ways onto ground.",
  },
  {
    n: "02",
    title: "Pre-approval, not pre-qualification",
    body: "A pre-qualification is a lender being polite. A pre-approval is underwriting having actually looked. Ask for the second one; it costs nothing and takes about four days, and it sets the ceiling for everything that follows.",
  },
  {
    n: "03",
    title: "Pick the home, the options and a deposit",
    body: "With the ceiling known, choose the plan, the finishes and the options. A deposit holds a build slot. Colour and finish selections stay open until the build lock date, typically three weeks before the plant run.",
  },
  {
    n: "04",
    title: "Find the land and walk the site",
    body: "If you do not own ground yet, we help you look. Once there is a parcel, we visit it: access, utilities, setbacks, soil, permits. We produce a written number for the development. This is the line item that surprises people, and it is the one nobody else will quote you up front.",
  },
  {
    n: "05",
    title: "Close at set, not at order",
    body: "You do not start paying a mortgage on a home that is still a stack of lumber. Funding happens when the home is on its piers and the foundation certification is signed.",
  },
];

const FAQ = [
  {
    title: "What credit score do I need?",
    body: (
      <p>
        We can work with credit as low as 580. If you are below that, contact us and we
        will enrol you in one of our credit restoration programs — buyers who have gone
        through it have been approved in two to six months.
      </p>
    ),
  },
];

/**
 * Reviews from buyers who came through credit restoration, shown under the
 * credit answer. Same rule as the landing page: take each one from a review
 * the customer actually published, or with their written permission, and
 * never draft one to fill the row. Empty, the block does not render.
 */
const CREDIT_REVIEWS: { quote: string; name: string; detail: string }[] = [];

export default function FinancingPage() {
  /* Turned off in `lib/page-config.ts`, this route sends visitors home rather
     than 404ing — an indexed link or a printed card outlives the switch. */
  if (!pages.financing) redirect("/");

  return (
    <>
      <PageHero
        photoKey="page/financing"
        index="01"
        eyebrow="Financing"
        title={
          <>
            Four ways to pay for it.
            <br />
            We will tell you which is yours.
          </>
        }
        lede={
          hasPrices
            ? `Homes here run ${money(priceBounds.min)} to ${money(priceBounds.max)}. What that costs you every month depends far more on how you finance it than on which one you pick.`
            : "What a home costs you every month depends far more on how you finance it than on which one you pick. Here is how the paths differ, and how to work out your own number."
        }
        kind="exterior"
        breadcrumb={[
          { href: "/", label: "Home" },
          { href: "/financing", label: "Financing" },
        ]}
      />

      {/* Paths */}
      <Section>
        <Reveal>
          <SectionHeading
            index="02"
            eyebrow="The four paths"
            title="How the paths differ, plainly."
            lede="Indicative ranges for comparing the paths against each other, not quotes and not an offer of credit. Your number comes from a lender after underwriting, and depends on credit, term, down payment and how the home is titled."
          />
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {PATHS.map((p, i) => (
            <Reveal key={p.name} delay={i * 80}>
              <div className="flex h-full flex-col rounded-card border border-line bg-surface p-7">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-display text-2xl tracking-tight text-ink">{p.name}</h3>
                  <Badge tone={p.tone}>{p.down}</Badge>
                </div>
                <div className="mt-5 flex items-baseline gap-3 border-y border-line py-4">
                  <span className="font-display text-3xl tracking-tight text-ink">{p.rate}</span>
                  <span className="font-mono text-xs text-muted">{p.term}</span>
                </div>
                <p className="mt-5 flex-1 text-[0.94rem] leading-relaxed text-muted">{p.body}</p>
                <p className="mt-6 flex gap-2.5 text-[0.8rem] leading-relaxed text-ink-soft">
                  <Icon.Check className="mt-0.5 size-4 shrink-0 text-ember" />
                  {p.needs}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Calculator */}
      <section id="calculator" className="scroll-mt-[calc(var(--chrome-h)+1.5rem)] border-y border-line bg-surface">
        <Container className="py-20 sm:py-28">
          <Reveal>
            <SectionHeading
              index="03"
              eyebrow="Run it yourself"
              title="Move the sliders. Find your number."
              lede="Put in the home and development price you are working with, then the land, the rate and the down payment. Every figure is a slider, so change the one you are unsure of and watch what it does to the month."
            />
          </Reveal>
          <Reveal className="mt-12">
            <div className="mx-auto max-w-3xl">
              {/* No listing here to take a price from, so the visitor sets
                  one. Seeded at NERTO's own example, not a home's sticker. */}
              <PaymentCalculator price={240000} editablePrice />
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Order of operations */}
      <Section>
        <Reveal>
          <SectionHeading
            index="04"
            eyebrow="Order of operations"
            title="Do these in this order and nothing goes wrong."
            lede="Almost every purchase that falls apart falls apart because somebody took the steps out of order."
          />
        </Reveal>

        <ol className="mt-14 space-y-px overflow-hidden rounded-2xl border border-line bg-line">
          {ORDER.map((s, i) => (
            <Reveal
              key={s.n}
              delay={i * 70}
              as="li"
              className="grid gap-4 bg-paper p-7 sm:grid-cols-[6rem_minmax(0,20rem)_1fr] sm:items-baseline sm:gap-8 sm:p-9"
            >
              <span className="font-mono text-sm text-ember">{s.n}</span>
              <h3 className="font-display text-2xl leading-snug tracking-tight text-ink">
                {s.title}
              </h3>
              <p className="leading-relaxed text-muted">{s.body}</p>
            </Reveal>
          ))}
        </ol>
      </Section>

      {/* FAQ */}
      <section className="border-t border-line bg-surface">
        <Container className="py-20 sm:py-28">
          <Reveal>
            <SectionHeading index="05" eyebrow="Credit" title="Asked and answered." />
          </Reveal>
          <Reveal className="mt-12">
            <Accordion items={FAQ} defaultOpen={0} />
          </Reveal>

          {CREDIT_REVIEWS.length > 0 && (
            <Reveal className="mt-12">
              <p className="eyebrow">From buyers who came through credit restoration</p>
              <div className="mt-6 grid gap-6 md:grid-cols-3">
                {CREDIT_REVIEWS.map((r) => (
                  <figure
                    key={r.name}
                    className="flex h-full flex-col rounded-card border border-line bg-paper p-7"
                  >
                    <blockquote className="flex-1 leading-relaxed text-ink">
                      &ldquo;{r.quote}&rdquo;
                    </blockquote>
                    <figcaption className="mt-5 text-sm text-muted">
                      <span className="font-medium text-ink">{r.name}</span> &middot; {r.detail}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </Reveal>
          )}

          <Reveal className="mt-16">
            <div className="flex flex-col items-start gap-6 rounded-card border border-line bg-paper p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
              <div>
                <h3 className="font-display text-2xl tracking-tight text-ink">
                  Want a real number instead of an estimate?
                </h3>
                <p className="mt-2 max-w-lg leading-relaxed text-muted">
                  Tell us the parcel, or that you are still looking for one, and we will put
                  a lender quote and a written development cost in front of you.
                </p>
              </div>
              <ButtonLink href="/contact" className="shrink-0 !px-7 !py-4 !text-base">
                Start there
                <Icon.Arrow className="size-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
              </ButtonLink>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}

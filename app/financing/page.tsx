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
import { market } from "@/lib/market";
import { hasPrices, priceBounds } from "@/lib/homes";
import { money } from "@/lib/format";
import { pages } from "@/lib/page-config";

export const metadata: Metadata = {
  title: "Financing",
  description:
    "Chattel versus real-property lending, what each actually costs, and the paperwork order that keeps a manufactured home purchase from going sideways.",
};

const PATHS = [
  {
    name: "Conventional",
    rate: "6.4 – 7.1%",
    term: "30 yr",
    down: "5% down",
    tone: "ember" as const,
    needs: "Owned land · permanent foundation · real-property title",
    body: "Fannie Mae's MH Advantage and Freddie's CHOICEHome both price manufactured homes at or near site-built rates when the home meets the eligibility criteria. Our CrossMod homes are built to that specification on purpose.",
  },
  {
    name: "FHA Title II",
    rate: "6.2 – 6.9%",
    term: "30 yr",
    down: "3.5% down",
    tone: "moss" as const,
    needs: "Owned land · permanent foundation · 400+ sq ft",
    body: "The most forgiving credit profile of any real-property option, and the lowest down payment. Requires an engineer's foundation certification, which we schedule as part of the set.",
  },
  {
    name: "VA",
    rate: "6.0 – 6.7%",
    term: "30 yr",
    down: "0% down",
    tone: "moss" as const,
    needs: "Eligible service · owned land · permanent foundation",
    body: "No down payment and no mortgage insurance. Fewer lenders write VA on manufactured homes, so the shortlist is short — we keep a current one.",
  },
  {
    name: "USDA Rural",
    rate: "6.1 – 6.8%",
    term: "30 yr",
    down: "0% down",
    tone: "moss" as const,
    needs: "Eligible rural parcel · new home only · income limits",
    /* Which tracts are USDA-eligible is a fact about one market, so it comes
       from `lib/market.ts` and falls back to a portable sentence. */
    body:
      market.usdaNote ??
      "USDA eligibility is drawn by tract rather than by town, and the map surprises people. Worth ten minutes with it before you assume you don't qualify — note that it applies to land you own, not a leased pad.",
  },
  {
    name: "Chattel",
    rate: "8.4 – 10.2%",
    term: "20–23 yr",
    down: "5% down",
    tone: "neutral" as const,
    needs: "Leased pad · personal-property title",
    body: "The home is collateral, the land is not. Closes in two to three weeks instead of six, which genuinely matters if you are in a lease that ends. Costs roughly two points more for the life of the loan.",
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
    title: "Land first, always",
    body: "Before a lender, before a floor plan. Whether you own or lease decides which of the six paths above you are even eligible for, and it changes the monthly figure by hundreds of dollars. If you do not own land yet, the buyer's guide at /start-here walks through the three ways onto ground.",
  },
  {
    n: "02",
    title: "Pre-approval, not pre-qualification",
    body: "A pre-qualification is a lender being polite. A pre-approval is underwriting having actually looked. Ask for the second one; it costs nothing and takes about four days.",
  },
  {
    n: "03",
    title: "Site check and cost-to-set",
    body: "Access, utilities, setbacks, soil, permits. We produce a written number. This is the line item that surprises people, and it is the one nobody else will quote you up front.",
  },
  {
    n: "04",
    title: "Order and lock",
    body: "Deposit holds a build slot. Colour and finish selections stay open until the build lock date, typically three weeks before the plant run.",
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
        Real-property lending generally starts around 620, and FHA will go lower with
        compensating factors. Chattel lenders write down to about 575 at a price. If you
        are below 620 and can wait six months, the difference between fixing your score
        and not fixing it is usually larger than the difference between any two homes on
        this site.
      </p>
    ),
  },
  {
    title: "Do you make money on the financing?",
    body: (
      <p>
        No. We are not a licensed originator and we do not take a referral fee from the
        lenders on our list. We keep the list because a dealer who sends you to a lender
        that cannot close on a HUD-code home wastes six weeks of your life and one of
        ours.
      </p>
    ),
  },
  {
    title: "Can I convert a chattel loan to a mortgage later?",
    body: (
      <p>
        Yes, and people do. It requires acquiring the land (or the community converting to
        resident ownership), installing a permanent foundation, and retiring the personal
        property title through your state&apos;s conversion process. It is paperwork, an
        engineer&apos;s certification and a refinance — not a rebuild.
      </p>
    ),
  },
  {
    title: "What does the set actually cost?",
    body: (
      <p>
        On a prepared pad in one of our communities: $12,000–$19,000 for a double-section,
        including transport, crane-free set, marriage-line finish, anchoring, skirting and
        utility connections. On raw land, add site work — which can be anything from
        $8,000 to $60,000 depending on access, septic and power distance. This is exactly
        why we survey before you order.
      </p>
    ),
  },
];

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
            Six ways to pay for it.
            <br />
            Two of them are a mistake.
          </>
        }
        lede={
          hasPrices
            ? `Homes here run ${money(priceBounds.min)} to ${money(priceBounds.max)}. What that costs you every month depends far more on how you finance it than on which one you pick.`
            : "What a home costs you every month depends far more on how you finance it than on which one you pick. Here is how the two paths differ, and how to work out your own number."
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
            eyebrow="The six paths"
            title="Rates as of this quarter, plainly."
            lede="Ranges are what our buyers actually closed at in the last ninety days, not teaser rates. Your number depends on credit, term and how the home is titled."
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
              title="Move the sliders. Watch the gap."
              lede="Put in the price you are working with, then switch between the two loan types with everything else held constant. That difference is the whole argument for buying the land."
            />
          </Reveal>
          <Reveal className="mt-12">
            <div className="mx-auto max-w-3xl">
              {/* No listing here to take a price from, so the visitor sets
                  one. Seeded at a round number, not a home's sticker. */}
              <PaymentCalculator price={150000} editablePrice />
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
            lede="Almost every purchase that falls apart falls apart because somebody did step four before step one."
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
            <SectionHeading index="05" eyebrow="Money questions" title="Asked and answered." />
          </Reveal>
          <Reveal className="mt-12">
            <Accordion items={FAQ} defaultOpen={0} />
          </Reveal>

          <Reveal className="mt-16">
            <div className="flex flex-col items-start gap-6 rounded-card border border-line bg-paper p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
              <div>
                <h3 className="font-display text-2xl tracking-tight text-ink">
                  Want a real number instead of an estimate?
                </h3>
                <p className="mt-2 max-w-lg leading-relaxed text-muted">
                  Tell us the parcel or the community and we will put a lender quote and a
                  written cost-to-set in front of you.
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

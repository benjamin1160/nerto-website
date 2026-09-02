import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
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
import { communities } from "@/lib/communities";
import { listings } from "@/lib/homes";
import { site } from "@/lib/site";
import { pages } from "@/lib/page-config";

export const metadata: Metadata = {
  title: "No land? Start here",
  description:
    "How buying a manufactured home actually works when you do not own land: leasing a pad, buying a lot, land-home packages, what you pay beyond the home, and why the title matters more than the floor plan.",
};

/* The three ways onto ground. Ordered by what they cost to enter, which is
   the opposite of the order they pay you back in. */
const ROUTES = [
  {
    name: "Lease a pad",
    verdict: "Cheapest to enter",
    tone: "neutral" as const,
    body: "You buy the home; the community owns the ground and you pay lot rent monthly. Nothing to buy but the home, and you can be in one in weeks rather than months. The home is usually titled as personal property, so it depreciates the way a vehicle does — and the rent is set by whoever owns the community.",
    ask: "Ask the office what lot rent has done over the last ten years, and what it covers. If nobody will tell you, that is the answer.",
  },
  {
    name: "Buy the lot",
    verdict: "Builds equity",
    tone: "ember" as const,
    body: "You own the dirt. With a permanent foundation the home can be titled as real property, which puts it on the same appreciation curve as the site-built house next door and unlocks conventional, FHA, VA and USDA lending. Costs the most to get into, and it is the only route that reliably pays you back.",
    ask: "Before you buy a parcel, ask us to check access, utilities, setbacks and flood zone. A cheap lot with no water line is not a cheap lot.",
  },
  {
    name: "Land-home package",
    verdict: "One closing",
    tone: "moss" as const,
    body: "The parcel, the site work and the home financed together on a single loan and closed once. More paperwork up front, fewer surprises later, and usually the cheapest money available to somebody buying both at the same time.",
    ask: "Get the site-work number in writing before the loan is sized. It is the line item that moves, and it is the one most people never see quoted.",
  },
];

/* Deliberately in the order the money actually leaves, not the order a
   sales floor would like you to take it in. */
const STEPS = [
  {
    n: "01",
    title: "Settle the ground first",
    body: "Lease, buy, or a package. This single decision moves the monthly payment by hundreds of dollars and decides which loans you are even eligible for. Everything below depends on it, which is why nothing above it is worth doing first.",
  },
  {
    n: "02",
    title: "Budget the whole number",
    body: "The home is not the cost. Add site work, foundation, transport and set, skirting, steps, utility connections, permits — plus lot rent or the parcel itself. Ask any dealer for that whole number in writing, early. We will give you ours before you have chosen anything.",
  },
  {
    n: "03",
    title: "Get pre-approved, not pre-qualified",
    body: "A pre-qualification is a lender being polite. A pre-approval is underwriting having looked. It costs nothing, takes a few days, and it tells you which of the routes above is real for you rather than aspirational.",
  },
  {
    n: "04",
    title: "Match the plan to the pad",
    body: "A 32-foot-wide home will not go on every community lot or down every road. Once we know where it is going, we can tell you which of the twenty plans on the lot can actually be set there — before you fall for one that cannot.",
  },
  {
    n: "05",
    title: "Site check and a written cost-to-set",
    body: "Access, utilities, setbacks, soil, permits, and the pad or foundation itself. This is the step that surprises people, and it is the one you want on paper rather than in a conversation.",
  },
  {
    n: "06",
    title: "Order, build, deliver, set",
    body: "A deposit holds a build slot; selections stay open until the build lock date. The home is framed indoors on a jig and inspected in the plant, then delivered on its own chassis and set — usually inside a couple of days once it arrives.",
  },
  {
    n: "07",
    title: "Trim, connect, hand over keys",
    body: "Marriage-line finish where there is one, utility hookups, skirting, tie-downs, and the walkthrough. On owned land, the foundation certification is signed here and the loan funds — you do not pay a mortgage on a home that is still a stack of lumber.",
  },
];

/* Every line that is not the home itself. Amounts vary too much by site to
   publish; what matters is that a buyer knows to ask about each one. */
const BEYOND = [
  {
    title: "Pad or foundation",
    body: "Piers and anchors in a community, or an engineered foundation on owned land. Real-property titling needs the second one.",
  },
  {
    title: "Site work",
    body: "Clearing, grading, driveway, culvert, septic or sewer tap, well or water line, power run. The single biggest variable in the whole purchase.",
  },
  {
    title: "Transport and set",
    body: "Hauling each section and craning or rolling it into place. Distance and access decide it.",
  },
  {
    title: "Skirting, steps and decks",
    body: "Required before most inspections sign off, and rarely included in the number on a listing anywhere.",
  },
  {
    title: "Utility connections",
    body: "From the stub to the home: water, sewer, power, gas. Short runs are cheap; long ones are not.",
  },
  {
    title: "Permits and inspections",
    body: "County permit, setback and zoning sign-off, electrical and plumbing inspections, and the foundation certification where one is needed.",
  },
  {
    title: "Lot rent or the parcel",
    body: "Rent plus a deposit in a community; the purchase price, closing costs and property tax on a lot you buy.",
  },
  {
    title: "Insurance and taxes",
    body: "Manufactured-home policies are their own product. On personal-property title you may pay a vehicle-style tax rather than property tax.",
  },
];

const FAQ = [
  {
    title: "Can I buy a manufactured home if I don't own land?",
    body: (
      <p>
        Yes — most buyers do not own land when they start. You lease a homesite in a
        community and own the home on it, which is the fastest and cheapest way in. The
        trade is that the home is usually titled as personal property, so it depreciates,
        and the lot rent is set by the community owner. If you would rather build equity,
        the other two routes above are worth pricing before you commit.
      </p>
    ),
  },
  {
    title: "Can I get a real mortgage on one?",
    body: (
      <p>
        On land you own, with a permanent foundation and a real-property title:
        conventional, FHA, VA and USDA lenders all write on manufactured homes, and
        Fannie Mae&apos;s MH Advantage and Freddie Mac&apos;s CHOICEHome programmes price
        eligible homes at or near site-built rates. On a leased pad it is a chattel loan
        — a real loan, secured on the home rather than the ground, at a higher rate and a
        shorter term. Both are financing; one is cheaper.{" "}
        <Link href="/financing" className="text-ember underline-offset-4 hover:underline">
          The financing page walks through each path.
        </Link>
      </p>
    ),
  },
  {
    title: "Does a manufactured home appreciate?",
    body: (
      <p>
        Homes on owned land, on a permanent foundation, titled as real property, behave
        like houses. Homes on a rented pad, titled as personal property, generally behave
        like vehicles. That is a land and titling question rather than a construction
        question — the home itself is identical either way — and it is the single most
        important thing to understand before you sign anything.
      </p>
    ),
  },
  {
    title: "What is a CrossMod home?",
    body: (
      <p>
        A HUD-code home built to a specification that lets it appraise against site-built
        houses: permanent foundation, a porch, drywall throughout, higher roof pitch. It
        is the category that closes the gap between manufactured and site-built lending.
        We keep one on the lot to show what it looks like in person.
      </p>
    ),
  },
  {
    title: "How long does the whole thing take?",
    body: (
      <p>
        From a signed order, a plant build slot is typically a few weeks and the set
        itself is a couple of days. The part that takes real time is the ground: a
        community application can clear in a week, while a parcel that needs a septic
        permit and a power run can take a season. Start there and the rest follows
        quickly.
      </p>
    ),
  },
  {
    title: "Can I move the home later?",
    body: (
      <p>
        Physically, yes — it left the plant on a chassis. Practically it is expensive,
        needs permits and a transport company, and older homes do not always survive the
        trip well. Plan the home where it is going to stay, and treat the ability to move
        it as an emergency option rather than a feature.
      </p>
    ),
  },
  {
    title: "What should I ask a community before I sign a lease?",
    body: (
      <p>
        What the lot rent is and what it includes; what it has been each of the last ten
        years; who owns the community and whether it has changed hands recently; what the
        rules say about pets, guests, subletting and selling your home in place; what
        happens to your lease if you sell; and whether the community charges an exit or
        transfer fee. Get the answers on paper.
      </p>
    ),
  },
];

export default function StartHerePage() {
  /* Turned off in `lib/page-config.ts`, this route sends visitors home rather
     than 404ing — an indexed link or a printed card outlives the switch. */
  if (!pages.startHere) redirect("/");

  const smallest = Math.min(...listings.map((l) => l.sqft));

  return (
    <>
      <PageHero
        photoKey="page/start-here"
        index="01"
        eyebrow="No land? Start here"
        title={
          <>
            You do not need
            <br />
            an acre to start.
          </>
        }
        lede="Most people buying a manufactured home do not own the ground it will sit on. Here is how the whole purchase actually works — the land question first, because it decides everything after it."
        kind="exterior"
        size="tall"
        breadcrumb={[
          { href: "/", label: "Home" },
          { href: "/start-here", label: "Start here" },
        ]}
      />

      {/* Three routes onto ground */}
      <Section>
        <Reveal>
          <SectionHeading
            index="02"
            eyebrow="Three ways onto ground"
            title="The land decision, before the floor plan."
            lede="Nobody in this industry wants to have this conversation first, because it is the one that costs money. It is also the one that decides your monthly payment, your interest rate, and whether the home is worth more or less in fifteen years."
          />
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {ROUTES.map((r, i) => (
            <Reveal key={r.name} delay={i * 100}>
              <div className="flex h-full flex-col rounded-card border border-line bg-surface p-8">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-display text-2xl tracking-tight text-ink">{r.name}</h3>
                  <Badge tone={r.tone}>{r.verdict}</Badge>
                </div>
                <p className="mt-5 flex-1 leading-relaxed text-muted">{r.body}</p>
                <p className="mt-6 flex gap-2.5 border-t border-line pt-5 text-[0.88rem] leading-relaxed text-ink-soft">
                  <Icon.Shield className="mt-0.5 size-4 shrink-0 text-ember" />
                  {r.ask}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={120}>
          <p className="mt-10 max-w-3xl text-lg leading-relaxed text-muted">
            All {communities.length} communities we work with are land-lease properties
            within about half an hour of the lot in {site.address.city}.{" "}
            <Link
              href="/communities"
              className="text-ember underline-offset-4 hover:underline"
            >
              See what each one is like
            </Link>
            , or send us a parcel number and we will tell you what it takes to set a home
            on it.
          </p>
        </Reveal>
      </Section>

      {/* Order of operations */}
      <section className="border-y border-line bg-surface">
        <Container className="py-20 sm:py-28">
          <Reveal>
            <SectionHeading
              index="03"
              eyebrow="In order"
              title="Seven steps, and the order matters."
              lede="Done in this order, a manufactured home purchase is unremarkable. Done out of order — plan first, land last — is where the stories come from."
            />
          </Reveal>

          <ol className="mt-14 grid gap-px overflow-hidden rounded-2xl bg-line sm:grid-cols-2">
            {STEPS.map((s) => (
              <li key={s.n} className="flex flex-col gap-3 bg-paper p-8">
                <span className="font-mono text-xs text-ember">{s.n}</span>
                <h3 className="font-display text-2xl leading-snug tracking-tight text-ink">
                  {s.title}
                </h3>
                <p className="leading-relaxed text-muted">{s.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* Beyond the home */}
      <Section>
        <Reveal>
          <SectionHeading
            index="04"
            eyebrow="What you pay for beyond the home"
            title="The number on a listing is not the number."
            lede="These are the lines that turn a home price into a project cost. We quote every one of them in writing before you order, because the alternative is finding out about them one at a time."
          />
        </Reveal>

        <div className="mt-14 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {BEYOND.map((b, i) => (
            <Reveal key={b.title} delay={(i % 4) * 80}>
              <div className="border-t border-line pt-6">
                <h3 className="font-display text-xl leading-snug tracking-tight text-ink">
                  {b.title}
                </h3>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-muted">{b.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Titling */}
      <section className="border-y border-line bg-ink text-paper dark:bg-surface dark:text-ink">
        <Container className="py-20 sm:py-28">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
            <Reveal>
              <Eyebrow index="05" className="!text-current opacity-60">
                Personal property or real property
              </Eyebrow>
              <h2 className="mt-5 font-display text-headline text-balance">
                Same home. Two completely different assets.
              </h2>
            </Reveal>

            <Reveal delay={100}>
              <div className="space-y-6 text-lg leading-relaxed opacity-80">
                <p>
                  A manufactured home leaves the plant with a certificate of origin, much
                  like a vehicle. On a leased pad it usually stays that way — titled as
                  personal property, financed with a chattel loan, taxed and insured
                  accordingly, and depreciating on paper no matter how well it is built.
                </p>
                <p>
                  Set the identical home on land you own, on a permanent foundation, and
                  retire that title into the real estate, and it becomes a house in the
                  eyes of a lender, an appraiser and the county. Longer term, lower rate,
                  and it moves with the housing market instead of against it.
                </p>
                <p>
                  Neither is wrong. Leasing a pad gets people into a home years earlier
                  than saving for a parcel would. But it should be a decision you made,
                  not one that happened to you at a closing table.
                </p>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <Section id="faq">
        <Reveal>
          <SectionHeading
            index="06"
            eyebrow="Common questions"
            title="The ones we get asked on the lot."
          />
        </Reveal>
        <div className="mt-12">
          <Accordion items={FAQ} />
        </div>
      </Section>

      {/* Closing */}
      <Section className="!pt-0">
        <Reveal>
          <div className="rounded-[1.5rem] border border-line bg-surface p-10 text-center sm:p-16">
            <h2 className="mx-auto max-w-2xl font-display text-headline text-balance text-ink">
              Come and ask the awkward questions.
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted">
              Twenty plans are standing on the lot in {site.address.city}, from{" "}
              {smallest} square feet up. Bring a parcel number, a community name, or
              neither — we will start wherever you are.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/contact" className="!px-7 !py-4 !text-base">
                Book a walkthrough
                <Icon.Arrow className="size-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
              </ButtonLink>
              <ButtonLink href="/listings" variant="outline" className="!px-7 !py-4 !text-base">
                See every plan
              </ButtonLink>
            </div>
          </div>
        </Reveal>
      </Section>
    </>
  );
}

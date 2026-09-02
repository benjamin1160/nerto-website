import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Accordion } from "@/components/accordion";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { ButtonLink, Container, Icon, Section, SectionHeading } from "@/components/ui";
import { faq } from "@/lib/faq";
import { pages } from "@/lib/page-config";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Questions",
  description: `The questions buyers ask ${site.name} before they buy, and the answers, in full. Titling, financing, wind zones, what the price covers and how long the whole thing takes.`,
};

export default function FaqPage() {
  /* Turned off in `lib/page-config.ts`, this route sends visitors home rather
     than 404ing — an indexed link or a printed card outlives the switch. */
  if (!pages.faq || faq.length === 0) redirect("/");

  return (
    <>
      <PageHero
        photoKey="page/faq"
        index="01"
        eyebrow={`${faq.length} questions`}
        title={
          <>
            The questions,
            <br />
            answered in full.
          </>
        }
        lede="Every one of these gets asked on the lot most weeks. None of the answers get shorter in person."
        kind="porch"
        breadcrumb={[
          { href: "/", label: "Home" },
          { href: "/faq", label: "Questions" },
        ]}
      />

      <Section>
        <Reveal>
          <Accordion
            items={faq.map((item) => ({
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
      </Section>

      <section className="border-t border-line bg-surface">
        <Container className="py-20 sm:py-24">
          <Reveal>
            <SectionHeading
              index="02"
              eyebrow="Not covered here"
              title="Ask us the one that isn't on this page."
              lede="Somebody who has set a few thousand of these will answer it, and will tell you when the answer is “it depends on your parcel”."
              action={
                <ButtonLink href="/contact">
                  Book a walkthrough
                  <Icon.Arrow className="size-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                </ButtonLink>
              }
            />
          </Reveal>
        </Container>
      </section>
    </>
  );
}

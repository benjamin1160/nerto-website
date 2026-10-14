import type { Metadata } from "next";
import { ButtonLink, Container, Eyebrow, Icon } from "@/components/ui";
import { site } from "@/lib/site";

/**
 * Where every form on the site lands once a lead has gone through.
 *
 * It exists for measurement as much as for the visitor: a URL that is only
 * ever reached by submitting a form is the conversion Google Ads and GA count
 * ("page view of /thank-you"), and `?form=` says which form it was. The
 * actions in `app/actions.ts` and `app/land-deals/actions.ts` redirect here;
 * the chat widget does not, because a chat is a conversation, not a page load.
 *
 * Kept out of the index and the sitemap — a stranger arriving from search
 * would inflate the count it exists to keep.
 */
export const metadata: Metadata = {
  title: "Thank you",
  description: `Your details are with ${site.name}.`,
  robots: { index: false, follow: false },
};

/** What each form asked for, so the page answers the request that was made. */
const COPY: Record<string, { title: string; body: string }> = {
  "walkthrough-request": {
    title: "That's booked on our side.",
    body: "A real person will be in touch to confirm the time. No pressure, no obligation.",
  },
  "prequalify-page": {
    title: "Got it — we'll call you.",
    body: "We'll call you with a pre-approval range, usually the same day.",
  },
  "land-deals-map": {
    title: "Got it — we'll call you.",
    body: "We'll call you with a pre-approval range, usually the same day.",
  },
};

const DEFAULT_COPY = {
  title: "Thank you — that's with us.",
  body: "We'll get back to you within 24 hours.",
};

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ form?: string | string[] }>;
}) {
  const { form } = await searchParams;
  const copy = (typeof form === "string" && COPY[form]) || DEFAULT_COPY;

  return (
    <section className="flex min-h-[70svh] items-center py-24 sm:py-32">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-moss text-white">
            <Icon.Check className="size-7" />
          </span>
          <Eyebrow className="mt-8 justify-center">Request received</Eyebrow>
          <h1 className="mt-5 font-display text-4xl text-balance text-ink sm:text-5xl">
            {copy.title}
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted">
            {copy.body} Want to talk sooner? Call{" "}
            <a href={site.phoneHref} className="font-semibold text-ink underline underline-offset-4">
              {site.phone}
            </a>
            .
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/listings" className="!px-7 !py-4 !text-base">
              Browse the homes
              <Icon.Arrow className="size-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
            </ButtonLink>
            <ButtonLink href="/" variant="outline" className="!px-7 !py-4 !text-base">
              Back to the start
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}

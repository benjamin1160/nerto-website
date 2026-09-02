import Link from "next/link";
import { Container, Icon } from "./ui";
import type { Promotion } from "@/lib/promotions";

const fullDate = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

/**
 * The offer band, directly under the hero.
 *
 * It only ever renders a promotion that `lib/promotions.ts` says is live, so
 * an expired offer stops appearing on its own date rather than on the day
 * somebody remembers to delete it.
 */
export function PromotionBanner({ promotion }: { promotion: Promotion }) {
  const ends = promotion.endsOn ? new Date(`${promotion.endsOn}T00:00:00Z`) : undefined;

  return (
    <section id="promotion" className="border-b border-line bg-ember text-white">
      <Container className="flex flex-col gap-6 py-7 sm:flex-row sm:items-center sm:justify-between sm:py-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:gap-5">
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-white/70">
            {promotion.kicker}
          </p>
          <div>
            <p className="font-display text-xl leading-snug tracking-tight sm:text-2xl">
              {promotion.headline}
            </p>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-white/85">
              {promotion.body}
              {ends && !Number.isNaN(ends.getTime()) && (
                <> Ends {fullDate.format(ends)}.</>
              )}
            </p>
          </div>
        </div>

        <Link
          href={promotion.href ?? "/contact"}
          className="group inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-white px-6 py-3 text-sm font-medium text-ink transition-opacity hover:opacity-90 sm:self-auto"
        >
          {promotion.ctaText ?? "Get the details"}
          <Icon.Arrow className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </Container>
    </section>
  );
}

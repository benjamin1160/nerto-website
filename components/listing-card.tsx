import Link from "next/link";
import { ViewTransition } from "react";
import { Scene } from "./artwork/scene";
import { SaveButton } from "./saved-homes";
import { Badge, cx, Icon } from "./ui";
import { money, num, priceText } from "@/lib/format";
import { getCommunity } from "@/lib/communities";
import {
  sectionLabels,
  seriesLabel,
  statusLabels,
  styleLabels,
  type Listing,
} from "@/lib/homes";

function StatusBadge({ listing }: { listing: Listing }) {
  if (listing.status === "sold") return <Badge tone="muted">Sold</Badge>;
  if (listing.status === "pending") return <Badge tone="neutral">Sale pending</Badge>;
  if (listing.status === "coming-soon") return <Badge tone="moss">Coming soon</Badge>;
  if (listing.daysListed !== undefined && listing.daysListed <= 10)
    return <Badge tone="ember">Just listed</Badge>;
  return <Badge tone="neutral">{statusLabels[listing.status]}</Badge>;
}

/** Build, style, series and model — whichever of them this listing knows. */
function metaLine(listing: Listing, ...extra: (string | undefined)[]): string {
  const parts = [
    listing.series && seriesLabel(listing.series),
    listing.model,
    ...extra,
  ].filter(Boolean);
  return parts.length ? parts.join(" · ") : `${listing.beds} bed · ${listing.baths} bath`;
}

/** The card image: a home's first scene, which is not always an exterior. */
function coverKind(listing: Listing) {
  return listing.scenes[0]?.kind ?? "exterior";
}

export function SpecStrip({
  listing,
  className,
}: {
  listing: Listing;
  className?: string;
}) {
  return (
    <ul className={cx("flex flex-wrap items-center gap-x-5 gap-y-2", className)}>
      <li className="flex items-center gap-1.5">
        <Icon.Bed className="size-4 text-muted" />
        <span className="font-mono text-[0.8rem] text-ink-soft">{listing.beds} bd</span>
      </li>
      <li className="flex items-center gap-1.5">
        <Icon.Bath className="size-4 text-muted" />
        <span className="font-mono text-[0.8rem] text-ink-soft">{listing.baths} ba</span>
      </li>
      <li className="flex items-center gap-1.5">
        <Icon.Ruler className="size-4 text-muted" />
        <span className="font-mono text-[0.8rem] text-ink-soft">{num(listing.sqft)} sq ft</span>
      </li>
      {listing.widthFt !== undefined && listing.lengthFt !== undefined && (
        <li className="flex items-center gap-1.5">
          <Icon.Truck className="size-4 text-muted" />
          <span className="font-mono text-[0.8rem] text-ink-soft">
            {listing.widthFt}′ × {listing.lengthFt}′
          </span>
        </li>
      )}
    </ul>
  );
}

export function ListingCard({
  listing,
  priority,
  className,
}: {
  listing: Listing;
  priority?: boolean;
  className?: string;
}) {
  const community = listing.communitySlug ? getCommunity(listing.communitySlug) : undefined;
  const cover = coverKind(listing);

  return (
    <article
      className={cx(
        "group relative flex flex-col overflow-hidden rounded-card border border-line bg-surface transition-all duration-500 hover:-translate-y-1 hover:border-line-strong hover:shadow-[0_28px_60px_-38px_rgb(var(--shadow-color)/0.7)]",
        listing.status === "sold" && "opacity-90",
        className,
      )}
    >
      <div className="grain relative aspect-[4/3] overflow-hidden bg-surface-2">
        <ViewTransition name={`home-${listing.slug}`}>
          <Scene
            kind={cover}
            photoKey={`${listing.slug}/${cover}`}
            sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
            label={`${listing.name} — front elevation`}
            className="size-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
          />
        </ViewTransition>

        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between p-4">
          <StatusBadge listing={listing} />
          <div className="pointer-events-auto">
            <SaveButton slug={listing.slug} name={listing.name} />
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/55 to-transparent" />
        <p className="pointer-events-none absolute bottom-4 left-4 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-white/85">
          {[
            listing.sections && sectionLabels[listing.sections],
            listing.style && styleLabels[listing.style],
          ]
            .filter(Boolean)
            .join(" · ") || `${num(listing.sqft)} sq ft`}
        </p>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-2xl leading-tight tracking-tight text-ink">
              {listing.name}
            </h3>
            <p className="mt-1 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted">
              {metaLine(listing)}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p
              className={cx(
                "font-display leading-none tracking-tight text-ink",
                /* "Call for pricing" is a sentence, not a figure: held on one
                   line it sits beside the name instead of breaking in half
                   and squeezing the heading. */
                listing.price === undefined
                  ? "whitespace-nowrap text-sm"
                  : "text-2xl",
              )}
            >
              {priceText(listing.price)}
            </p>
            {listing.wasPrice && (
              <p className="mt-1 font-mono text-[0.7rem] text-muted line-through">
                {money(listing.wasPrice)}
              </p>
            )}
          </div>
        </div>

        <p className="mt-4 text-[0.95rem] leading-relaxed text-muted">{listing.tagline}</p>

        <SpecStrip listing={listing} className="mb-5 mt-5" />

        <div className="mt-auto flex items-center justify-between gap-4 border-t border-line pt-4">
          <span className="flex items-center gap-1.5 text-[0.8rem] text-muted">
            <Icon.Pin className="size-3.5" />
            {community ? `${community.name} · ${community.city}, ${community.state}` : "Available to order"}
          </span>
          <span className="flex items-center gap-1 text-[0.8rem] font-medium text-ink transition-colors group-hover:text-ember">
            View
            <Icon.Arrow className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </div>

      <Link
        href={`/listings/${listing.slug}`}
        className="absolute inset-0 z-10"
        aria-label={`${listing.name} — ${priceText(listing.price)}`}
        prefetch={priority ? true : undefined}
      >
        <span className="sr-only">View {listing.name}</span>
      </Link>
    </article>
  );
}

/** Wide row used by the list view on /listings. */
export function ListingRow({ listing }: { listing: Listing }) {
  const community = listing.communitySlug ? getCommunity(listing.communitySlug) : undefined;
  const cover = coverKind(listing);

  return (
    <article className="group relative grid grid-cols-1 gap-6 overflow-hidden rounded-card border border-line bg-surface p-4 transition-all duration-500 hover:border-line-strong hover:shadow-[0_24px_50px_-38px_rgb(var(--shadow-color)/0.6)] sm:grid-cols-[minmax(0,15rem)_1fr] sm:p-5">
      <div className="grain relative aspect-[4/3] overflow-hidden rounded-xl bg-surface-2 sm:aspect-[5/4]">
        <Scene
          kind={cover}
          photoKey={`${listing.slug}/${cover}`}
          sizes="(min-width: 768px) 33vw, 100vw"
          label={`${listing.name} — front elevation`}
          className="size-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
        />
        <div className="pointer-events-none absolute left-3 top-3">
          <StatusBadge listing={listing} />
        </div>
      </div>

      <div className="flex flex-col justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <h3 className="font-display text-2xl tracking-tight text-ink">{listing.name}</h3>
            <p
              className={cx(
                "font-display tracking-tight text-ink",
                listing.price === undefined ? "text-base" : "text-2xl",
              )}
            >
              {priceText(listing.price)}
            </p>
          </div>
          <p className="mt-1 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted">
            {metaLine(listing, listing.sections && sectionLabels[listing.sections])}
          </p>
          {listing.tagline && (
            <p className="mt-3 max-w-xl text-[0.95rem] leading-relaxed text-muted">
              {listing.tagline}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <SpecStrip listing={listing} />
          <span className="flex items-center gap-1.5 text-[0.8rem] text-muted">
            <Icon.Pin className="size-3.5" />
            {community ? `${community.name}, ${community.state}` : "To order"}
          </span>
        </div>
      </div>

      <Link href={`/listings/${listing.slug}`} className="absolute inset-0 z-10">
        <span className="sr-only">View {listing.name}</span>
      </Link>
    </article>
  );
}

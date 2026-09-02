"use client";

import { ListingCard } from "./listing-card";
import { useSavedHomes } from "./saved-homes";
import { money, num, priceText } from "@/lib/format";
import { ButtonLink, buttonStyles, cx, Icon } from "./ui";
import type { Listing } from "@/lib/homes";

export function SavedHomesList({ listings }: { listings: Listing[] }) {
  const { saved, ready, clear } = useSavedHomes();

  if (!ready) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-[28rem] animate-pulse rounded-card border border-line bg-surface"
          />
        ))}
      </div>
    );
  }

  const picked = saved
    .map((slug) => listings.find((l) => l.slug === slug))
    .filter((l): l is Listing => Boolean(l));

  if (picked.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line-strong px-8 py-24 text-center">
        <Icon.Heart className="mx-auto size-8 text-muted" />
        <p className="mt-6 font-display text-3xl tracking-tight text-ink">
          Nothing saved yet.
        </p>
        <p className="mx-auto mt-4 max-w-md leading-relaxed text-muted">
          Tap the heart on any home and it lands here. The list lives in this browser, so
          it survives a refresh but never leaves your machine.
        </p>
        <ButtonLink href="/listings" className="mt-8">
          Browse the homes
          <Icon.Arrow className="size-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
        </ButtonLink>
      </div>
    );
  }

  /* Averaged over the saved homes that actually carry a price, so one
     quote-on-enquiry home cannot drag the average toward zero. */
  const pricedPicks = picked.filter((l): l is Listing & { price: number } => l.price !== undefined);
  const avgPrice = pricedPicks.length
    ? pricedPicks.reduce((a, l) => a + l.price, 0) / pricedPicks.length
    : undefined;
  const avgSqft = picked.reduce((a, l) => a + l.sqft, 0) / picked.length;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-line pb-6">
        <dl className="flex flex-wrap gap-x-10 gap-y-4">
          <div>
            <dt className="eyebrow">Saved</dt>
            <dd className="mt-2 font-display text-3xl tracking-tight text-ink">
              {picked.length}
            </dd>
          </div>
          {avgPrice !== undefined && (
            <div>
              <dt className="eyebrow">
                Average price{pricedPicks.length < picked.length && " (of priced)"}
              </dt>
              <dd className="mt-2 font-display text-3xl tracking-tight text-ink">
                {money(avgPrice)}
              </dd>
            </div>
          )}
          <div>
            <dt className="eyebrow">Average size</dt>
            <dd className="mt-2 font-display text-3xl tracking-tight text-ink">
              {num(Math.round(avgSqft))} sq ft
            </dd>
          </div>
        </dl>
        <button type="button" onClick={clear} className={cx(buttonStyles.small)}>
          <Icon.Close className="size-3.5" />
          Clear list
        </button>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {picked.map((l) => (
          <ListingCard key={l.slug} listing={l} className="h-full" />
        ))}
      </div>

      {picked.length > 1 && (
        <div className="mt-16">
          <h2 className="eyebrow">Side by side</h2>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-surface">
            <table className="w-full min-w-[40rem] border-collapse text-left">
              <caption className="sr-only">Saved homes compared</caption>
              <thead>
                <tr className="border-b border-line">
                  <th scope="col" className="p-5">
                    <span className="eyebrow">Spec</span>
                  </th>
                  {picked.map((l) => (
                    <th key={l.slug} scope="col" className="p-5">
                      <span className="font-display text-lg tracking-tight text-ink">
                        {l.name}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(
                  [
                    ["Price", (l: Listing) => priceText(l.price)],
                    ["Beds", (l: Listing) => l.beds],
                    ["Baths", (l: Listing) => l.baths],
                    ["Living area", (l: Listing) => `${num(l.sqft)} sq ft`],
                    [
                      "Box",
                      (l: Listing) =>
                        l.widthFt !== undefined && l.lengthFt !== undefined
                          ? `${l.widthFt}′ × ${l.lengthFt}′`
                          : "—",
                    ],
                    [
                      "Per sq ft",
                      (l: Listing) => (l.price === undefined ? "—" : money(l.price / l.sqft)),
                    ],
                    ["HERS", (l: Listing) => l.hers ?? "—"],
                    ["Series", (l: Listing) => l.series ?? "—"],
                  ] as const
                ).map(([label, get]) => (
                  <tr key={label} className="border-b border-line last:border-b-0">
                    <th scope="row" className="p-5 text-sm font-medium text-ink">
                      {label}
                    </th>
                    {picked.map((l) => (
                      <td key={l.slug} className="p-5 font-mono text-sm text-muted">
                        {get(l)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

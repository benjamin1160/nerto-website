import Link from "next/link";
import { cx } from "./ui";
import {
  sizeCategoryFacets,
  type Listing,
  type SizeCategory,
} from "@/lib/homes";

/**
 * The buckets a buyer shops by — tiny, single, double, triple, mods — as a row
 * of big obvious buttons. This is the primary way into the catalogue on both
 * the landing page and `/listings`.
 *
 * A bucket with nothing in it is not rendered. A lot with no triple-wides
 * shows three buttons, not four with one that leads to an empty page — the
 * same rule the rest of the template follows about not advertising what is
 * not there. The footprint under each label is measured from the homes
 * actually in that bucket, so it cannot disagree with the catalogue.
 *
 * Two modes. Given `active`/`onSelect` it behaves as a filter control; given
 * neither it renders links to `/listings?size=<id>`, which is what the
 * landing page wants.
 */
export function SizeCategories({
  from,
  active,
  onSelect,
  className,
}: {
  /** Measure the counts against this catalogue. Defaults to all listings. */
  from?: Listing[];
  active?: SizeCategory | null;
  onSelect?: (id: SizeCategory | null) => void;
  className?: string;
}) {
  const facets = sizeCategoryFacets(from).filter((f) => f.count > 0);
  if (facets.length < 2) return null;

  const shell =
    "relative flex flex-col items-center justify-center rounded-xl border p-4 text-center transition-all duration-300 hover:scale-[1.02] md:p-5";
  const on = "border-ember bg-ember-wash";
  const off = "border-line bg-paper hover:border-ember";

  return (
    <div
      className={cx(
        "grid grid-cols-2 gap-3 md:gap-4",
        facets.length >= 5
          ? "md:grid-cols-5"
          : facets.length >= 4
            ? "md:grid-cols-4"
            : "md:grid-cols-3",
        className,
      )}
    >
      {facets.map((facet) => {
        const selected = active === facet.id;
        const body = (
          <>
            <span className="mb-2 text-2xl leading-none" aria-hidden>
              {facet.glyph}
            </span>
            <span
              className={cx(
                "text-sm font-semibold md:text-base",
                selected ? "text-ember" : "text-ink",
              )}
            >
              {facet.label}
            </span>
            <span className="mt-0.5 text-xs text-muted">
              {facet.range} · {facet.count} home{facet.count === 1 ? "" : "s"}
            </span>
          </>
        );

        return onSelect ? (
          <button
            key={facet.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onSelect(selected ? null : facet.id)}
            className={cx(shell, selected ? on : off)}
          >
            {body}
          </button>
        ) : (
          <Link
            key={facet.id}
            href={`/listings?size=${facet.id}`}
            className={cx(shell, off)}
          >
            {body}
          </Link>
        );
      })}
    </div>
  );
}

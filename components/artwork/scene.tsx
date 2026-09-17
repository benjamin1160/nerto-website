import Image from "next/image";
import type { SceneKind } from "@/lib/homes";
import { photoFor } from "@/lib/photos";
import { cx } from "../ui";

/**
 * One entry point for every image on the site.
 *
 * `photoKey` is looked up in `lib/photos.ts`; when it resolves, that
 * photograph is rendered.
 *
 * When it does not, there are two outcomes and the difference matters:
 *
 *   Given a `plan`, the manufacturer's floor-plan drawing is shown instead,
 *   captioned "Floor plan" in the corner, contained rather than cropped, and
 *   on white. It is a drawing and it says so. Most of this catalogue is plans
 *   nobody has photographed — Pine Grove leads its own model pages with the
 *   same drawing — so this is the difference between a browsable catalogue
 *   and three hundred grey rectangles.
 *
 *   Given neither, the space is held by an empty plate saying a photograph is
 *   still to come. What never happens is a drawing shown *as* a photograph,
 *   or one home's picture standing in for another's.
 *
 * `kind` is carried for the alt text and for callers that reason about
 * scene order; it does not select any artwork.
 */
export function Scene({
  kind,
  label,
  className,
  photoKey,
  photo,
  plan,
  sizes = "100vw",
  focus,
}: {
  kind: SceneKind;
  label: string;
  className?: string;
  /** Look this key up in `lib/photos.ts`, e.g. `netr-g-3157/kitchen`. */
  photoKey?: string;
  /** A photo path that bypasses the manifest, e.g. `/photos/one-off.jpg`. */
  photo?: string;
  /**
   * The manufacturer's floor-plan drawing, shown only when no photograph
   * resolves. Always rendered as a labelled drawing, never as a photograph.
   */
  plan?: string;
  sizes?: string;
  /**
   * Which part of the photo to keep when `object-cover` crops it. Most shots
   * of a home are sky-heavy — centring the crop on a tall, narrow box (a
   * phone-width hero) can leave mostly sky on screen and crop the home
   * itself out of frame. `"bottom"` biases the crop toward the ground.
   */
  focus?: "center" | "bottom";
}) {
  const src = photo ?? photoFor(photoKey);

  if (src) {
    return (
      <div className={cx("relative overflow-hidden", className)}>
        <Image
          src={src}
          alt={label}
          fill
          sizes={sizes}
          className={cx("object-cover", focus === "bottom" ? "object-bottom" : "object-center")}
        />
      </div>
    );
  }

  if (plan) {
    return (
      <div className={cx("relative overflow-hidden bg-white", className)}>
        <Image
          src={plan}
          alt={`${label} — manufacturer's floor plan drawing`}
          fill
          sizes={sizes}
          /* Contained, not cropped: a floor plan with its edges cut off is
             not a floor plan. The white ground is the drawing's own. */
          className="object-contain p-3"
        />
        <span className="pointer-events-none absolute bottom-2 left-2 rounded bg-black/55 px-2 py-1 font-mono text-[0.6rem] uppercase tracking-[0.15em] text-white">
          Floor plan
        </span>
      </div>
    );
  }

  return (
    <div
      className={cx("relative overflow-hidden bg-surface-2", className)}
      role="img"
      aria-label={`${label} — photograph to come`}
      data-scene={kind}
    >
      <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
        <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted">
          Photograph to come
        </span>
      </div>
    </div>
  );
}

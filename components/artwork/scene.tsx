import Image from "next/image";
import type { SceneKind } from "@/lib/homes";
import { photoFor } from "@/lib/photos";
import { cx } from "../ui";

/**
 * One entry point for every image on the site.
 *
 * This site shows photographs and nothing else. `photoKey` is looked up in
 * `lib/photos.ts`; when it resolves, that photograph is rendered. When it
 * does not, the space is held by an empty plate that says a photograph is
 * still to come — never by a drawing of a home that does not exist.
 *
 * `kind` is carried for the alt text and for callers that reason about
 * scene order; it no longer selects any artwork.
 */
export function Scene({
  kind,
  label,
  className,
  photoKey,
  photo,
  sizes = "100vw",
}: {
  kind: SceneKind;
  label: string;
  className?: string;
  /** Look this key up in `lib/photos.ts`, e.g. `buttercup/kitchen`. */
  photoKey?: string;
  /** A photo path that bypasses the manifest, e.g. `/photos/one-off.jpg`. */
  photo?: string;
  sizes?: string;
}) {
  const src = photo ?? photoFor(photoKey);

  if (src) {
    return (
      <div className={cx("relative overflow-hidden", className)}>
        <Image src={src} alt={label} fill sizes={sizes} className="object-cover" />
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

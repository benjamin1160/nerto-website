import Link from "next/link";
import type { ReactNode } from "react";
import { Scene } from "./artwork/scene";
import { Container, cx, Eyebrow, Icon } from "./ui";
import type { SceneKind } from "@/lib/homes";

/**
 * Every route opens on the same armature: a full-bleed dark scene, an
 * indexed eyebrow, a display headline and an optional lede. It also gives
 * the fixed header a dark surface to sit on at scroll position zero.
 */
export function PageHero({
  index,
  eyebrow,
  title,
  lede,
  kind = "exterior",
  photoKey,
  breadcrumb,
  children,
  size = "default",
}: {
  index: string;
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
  kind?: SceneKind;
  /** Key into `lib/photos.ts`. Without a photograph the hero is an empty plate. */
  photoKey?: string;
  breadcrumb?: { href: string; label: string }[];
  children?: ReactNode;
  size?: "default" | "tall";
}) {
  return (
    <section
      className={cx(
        "relative isolate flex flex-col justify-end overflow-hidden pb-14 pt-16 sm:pb-20 sm:pt-24",
        size === "tall" ? "min-h-[72svh]" : "min-h-[54svh]",
      )}
    >
      <div className="grain absolute inset-0 -z-10">
        <Scene
          kind={kind}
          photoKey={photoKey}
          label=""
          className="size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/45" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
      </div>

      <Container>
        {breadcrumb && (
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-white/55">
              {breadcrumb.map((b, i) => (
                <li key={b.href} className="flex items-center gap-2">
                  {i > 0 && <Icon.Chevron className="size-3" />}
                  <Link href={b.href} className="transition-colors hover:text-white">
                    {b.label}
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
        )}

        <Eyebrow index={index} className="!text-white/65">
          {eyebrow}
        </Eyebrow>

        <h1 className="mt-6 max-w-4xl font-display text-headline text-balance text-white">
          {title}
        </h1>

        {lede && (
          <p className="mt-7 max-w-2xl text-lg leading-relaxed text-white/80">{lede}</p>
        )}

        {children}
      </Container>
    </section>
  );
}

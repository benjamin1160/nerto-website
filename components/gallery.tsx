"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ViewTransition } from "react";
import { Scene } from "./artwork/scene";
import { cx, Icon } from "./ui";
import type { Scene as SceneData } from "@/lib/homes";

const KIND_LABEL: Record<string, string> = {
  exterior: "Exterior",
  living: "Great room",
  kitchen: "Kitchen",
  bedroom: "Primary suite",
  bath: "Primary bath",
  porch: "Porch",
};

export function Gallery({
  scenes,
  name,
  slug,
}: {
  scenes: SceneData[];
  name: string;
  slug: string;
}) {
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  const go = useCallback(
    (delta: number) => setIndex((i) => (i + delta + scenes.length) % scenes.length),
    [scenes.length],
  );

  useEffect(() => {
    if (!lightbox) return;
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, go]);

  const current = scenes[index];

  return (
    <>
      <figure className="flex flex-col gap-3">
        <div className="group grain relative aspect-[16/10] overflow-hidden rounded-card border border-line bg-surface-2">
          {index === 0 ? (
            <ViewTransition name={`home-${slug}`}>
              <Scene
                kind={current.kind}
                photoKey={`${slug}/${current.kind}`}
                sizes="(min-width: 1024px) 66vw, 100vw"
                label={`${name} — ${current.caption}`}
                className="size-full object-cover"
              />
            </ViewTransition>
          ) : (
            <Scene
              kind={current.kind}
              photoKey={`${slug}/${current.kind}`}
              sizes="(min-width: 1024px) 66vw, 100vw"
              label={`${name} — ${current.caption}`}
              className="size-full object-cover"
            />
          )}

          <button
            type="button"
            onClick={() => setLightbox(true)}
            className="absolute inset-0 cursor-zoom-in"
            aria-label={`Open ${name} gallery full screen`}
          />

          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-black/70 to-transparent p-5">
            <figcaption className="text-[0.85rem] text-white/85">{current.caption}</figcaption>
            <span className="shrink-0 rounded-full bg-black/45 px-3 py-1 font-mono text-[0.7rem] text-white/85 backdrop-blur-sm">
              {index + 1} / {scenes.length}
            </span>
          </div>

          {[-1, 1].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => go(d)}
              aria-label={d < 0 ? "Previous image" : "Next image"}
              className={cx(
                "absolute top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-white/25 bg-black/35 text-white opacity-0 backdrop-blur-md transition-all duration-300 hover:bg-black/60 focus-visible:opacity-100 group-hover:opacity-100 sm:opacity-0",
                d < 0 ? "left-4" : "right-4",
              )}
            >
              <Icon.Chevron className={cx("size-5", d < 0 && "rotate-180")} />
            </button>
          ))}
        </div>

        <ul className="grid grid-cols-6 gap-2 sm:gap-3">
          {scenes.map((s, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-current={i === index}
                className={cx(
                  "group relative block aspect-[4/3] w-full overflow-hidden rounded-lg border transition-all duration-300",
                  i === index
                    ? "border-ember ring-1 ring-ember"
                    : "border-line opacity-65 hover:opacity-100",
                )}
              >
                <Scene
                  kind={s.kind}
                  photoKey={`${slug}/${s.kind}`}
                  sizes="120px"
                  label=""
                  className="size-full object-cover"
                />
                <span className="sr-only">{KIND_LABEL[s.kind] ?? s.kind}</span>
              </button>
            </li>
          ))}
        </ul>
      </figure>

      {lightbox && (
        <div
          className="fixed inset-0 z-[60] flex flex-col bg-black/95 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`${name} gallery`}
        >
          <div className="flex items-center justify-between px-5 py-4 sm:px-8">
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-white/60">
              {name} · {KIND_LABEL[current.kind] ?? current.kind}
            </p>
            <button
              ref={closeRef}
              type="button"
              onClick={() => setLightbox(false)}
              className="grid size-10 place-items-center rounded-full border border-white/25 text-white transition-colors hover:bg-white/15"
              aria-label="Close gallery"
            >
              <Icon.Close className="size-5" />
            </button>
          </div>

          <div className="relative flex flex-1 items-center justify-center px-4 pb-6 sm:px-16">
            <div className="grain relative aspect-[16/10] w-full max-w-6xl overflow-hidden rounded-xl">
              <Scene
                kind={current.kind}
                photoKey={`${slug}/${current.kind}`}
                sizes="90vw"
                label={`${name} — ${current.caption}`}
                className="size-full object-cover"
              />
            </div>

            {[-1, 1].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => go(d)}
                aria-label={d < 0 ? "Previous image" : "Next image"}
                className={cx(
                  "absolute top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full border border-white/25 text-white transition-colors hover:bg-white/15",
                  d < 0 ? "left-2 sm:left-5" : "right-2 sm:right-5",
                )}
              >
                <Icon.Chevron className={cx("size-6", d < 0 && "rotate-180")} />
              </button>
            ))}
          </div>

          <p className="px-5 pb-8 text-center text-sm text-white/70 sm:px-8">
            {current.caption}
            <span className="ml-3 font-mono text-xs text-white/40">
              {index + 1} / {scenes.length} · ← → to navigate · Esc to close
            </span>
          </p>
        </div>
      )}
    </>
  );
}

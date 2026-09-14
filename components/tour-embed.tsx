"use client";

import { useState } from "react";
import { Icon } from "./ui";

/**
 * A Matterport walkthrough, as a click-to-load facade.
 *
 * Same bargain the video shelf strikes: nothing is requested from Matterport
 * until the visitor presses play. A tour is several megabytes of scan data
 * and it sets third-party cookies, and most people who open a listing are
 * there for the floor plan and the specs — so the frame stays unmounted and
 * the page costs what the rest of the page costs until somebody asks for it.
 *
 * Pressing play swaps this panel for the real viewer, which then opens
 * already inside the house.
 */
export function TourEmbed({ src, name }: { src: string; name: string }) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <iframe
        className="size-full"
        src={src}
        title={`${name} — 3D walkthrough`}
        /* `xr-spatial-tracking` is what lets the viewer use a headset or
           phone gyroscope; without it Matterport falls back to drag-to-look,
           which works but is the lesser experience on a phone. */
        allow="xr-spatial-tracking; gyroscope; accelerometer; fullscreen; autoplay"
        allowFullScreen
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      className="group flex size-full flex-col items-center justify-center gap-4 bg-surface-2 p-8 text-center transition-colors hover:bg-surface"
    >
      <span className="flex size-16 items-center justify-center rounded-full bg-ember text-white transition-transform group-hover:scale-105">
        <Icon.Arrow className="size-6" />
      </span>
      <span className="font-display text-lg text-ink">
        Start the walkthrough
      </span>
      <span className="max-w-sm text-sm leading-relaxed text-muted">
        Walk through {name} room by room. Drag to look around, click the floor
        to move, and use the dollhouse button to see the whole house at once.
      </span>
    </button>
  );
}

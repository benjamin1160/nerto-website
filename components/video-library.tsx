"use client";

import Image from "next/image";
import { useState } from "react";
import { Icon } from "./ui";
import {
  isSelfHosted,
  videoEmbedUrl,
  videoPoster,
  type Video,
} from "@/lib/videos";

/**
 * One video on the shelf, as a click-to-play facade.
 *
 * Nothing is requested from YouTube or Vimeo until the visitor presses play,
 * so a page of twelve explainers costs one page's worth of network rather
 * than twelve embedded players, and an unplayed page sets no third-party
 * cookie. Pressing play swaps the still for the real player, already
 * autoplaying, which is what the press asked for.
 *
 * A URL neither service recognises and which is not a file under `public/`
 * degrades to a plain link out. A broken iframe tells a visitor nothing; a
 * link at least still goes somewhere.
 */
export function VideoCard({ video }: { video: Video }) {
  const [playing, setPlaying] = useState(false);
  const poster = videoPoster(video);
  const selfHosted = isSelfHosted(video.url);
  const embed = selfHosted ? undefined : videoEmbedUrl(video.url);
  const playable = selfHosted || embed !== undefined;

  return (
    <article className="flex flex-col overflow-hidden rounded-card border border-line bg-surface transition-colors hover:border-line-strong">
      <div className="relative aspect-video overflow-hidden bg-surface-2">
        {playing && selfHosted ? (
          <video
            className="size-full object-cover"
            src={video.url}
            poster={poster}
            controls
            autoPlay
            playsInline
          />
        ) : playing && embed ? (
          <iframe
            className="size-full"
            src={embed}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <>
            {poster ? (
              /* YouTube thumbnails are remote and not worth an optimiser
                 round trip; a local poster goes through next/image. */
              poster.startsWith("/") ? (
                <Image
                  src={poster}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={poster} alt="" className="size-full object-cover" />
              )
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted">
                  {playable ? "Press play" : "Watch"}
                </span>
              </div>
            )}

            {playable ? (
              <button
                type="button"
                onClick={() => setPlaying(true)}
                aria-label={`Play “${video.title}”`}
                className="group absolute inset-0 grid place-items-center bg-black/25 transition-colors hover:bg-black/40"
              >
                <span className="grid size-16 place-items-center rounded-full bg-white/95 text-ink shadow-lg transition-transform duration-300 group-hover:scale-110">
                  <Icon.Arrow className="ml-1 size-6" />
                </span>
              </button>
            ) : (
              <a
                href={video.url}
                target="_blank"
                rel="noreferrer"
                className="absolute inset-0 grid place-items-center bg-black/25 text-white transition-colors hover:bg-black/40"
              >
                <span className="rounded-full bg-white/95 px-5 py-2.5 text-sm font-medium text-ink">
                  Watch
                </span>
              </a>
            )}

            {video.duration && (
              <span className="absolute bottom-3 right-3 rounded bg-black/75 px-2 py-1 font-mono text-[0.7rem] text-white">
                {video.duration}
              </span>
            )}
          </>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-xl leading-snug tracking-tight text-ink">
          {video.title}
        </h3>
        <p className="mt-3 flex-1 leading-relaxed text-muted">{video.summary}</p>
      </div>
    </article>
  );
}

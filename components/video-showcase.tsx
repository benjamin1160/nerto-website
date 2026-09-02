import Link from "next/link";
import { Container, Icon } from "./ui";

/**
 * A single full-width video band.
 *
 * The template ships no video, so `videoShowcase` in `lib/page-config.ts` is
 * null and this never renders. Point it at a file under `public/` — an mp4 of
 * a set, a walkthrough, the plant — and the band appears where the config
 * says it does. `mobileUrl` is optional and only worth setting when the
 * landscape crop is unwatchable on a phone.
 */
export function VideoShowcase({
  video,
}: {
  video: {
    url: string;
    mobileUrl?: string;
    headline: string;
    subheadline?: string;
    ctaText?: string;
    ctaHref?: string;
  };
}) {
  return (
    <section id="video-showcase" className="relative isolate overflow-hidden bg-ink text-paper">
      <video
        className="absolute inset-0 size-full object-cover opacity-55"
        autoPlay
        muted
        loop
        playsInline
        preload="none"
      >
        {video.mobileUrl && (
          <source src={video.mobileUrl} media="(max-width: 640px)" type="video/mp4" />
        )}
        <source src={video.url} type="video/mp4" />
      </video>

      <Container className="relative py-24 sm:py-32">
        <h2 className="max-w-3xl font-display text-[clamp(2rem,5vw,3.5rem)] leading-[1.05] tracking-tight">
          {video.headline}
        </h2>
        {video.subheadline && (
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/80">
            {video.subheadline}
          </p>
        )}
        {video.ctaText && (
          <Link
            href={video.ctaHref ?? "/contact"}
            className="group mt-10 inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 text-base font-medium text-ink transition-opacity hover:opacity-90"
          >
            {video.ctaText}
            <Icon.Arrow className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        )}
      </Container>
    </section>
  );
}

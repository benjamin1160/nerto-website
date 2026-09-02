/**
 * Informational videos — the explainers.
 *
 * A turnkey builder spends most of its phone time answering the same four or
 * five questions: what the process actually is, why a construction loan is
 * not the same thing as the end loan, what site work costs, what a set day
 * looks like. Those answers are the same every time, so they are worth
 * filming once and pointing at.
 *
 * SHIPS EMPTY, and `pages.videos` in `lib/page-config.ts` is off to match.
 * Add one video and turn the switch on; `/videos`, the nav links and the
 * footer entry all start existing together.
 *
 * `url` takes either shape:
 *
 *   A YouTube or Vimeo link — watch, share or embed form, all understood by
 *   `videoEmbedUrl` below. Nothing loads from either service until a visitor
 *   presses play, so an unplayed page sets no third-party cookies.
 *
 *   A file under `public/`, e.g. `/videos/the-process.mp4`, which plays in
 *   the browser's own player with nothing third-party involved at all.
 *
 * This is separate from `videoShowcase` in `lib/page-config.ts`, which is one
 * silent background clip behind a headline on the landing page. That is
 * decoration; this is content somebody sat down to watch.
 */

/** The shelf a video sits on. Topics with nothing in them are not rendered. */
export type VideoTopic = "process" | "financing" | "land" | "homes";

export type Video = {
  /** URL fragment and React key, kebab-case. */
  slug: string;
  title: string;
  /** One or two sentences under the title. */
  summary: string;
  topic: VideoTopic;
  /** A YouTube/Vimeo link, or a file under `public/`. See the note above. */
  url: string;
  /**
   * Poster still, a path under `public/`. Omit it for a YouTube video and the
   * thumbnail is taken from YouTube; omit it for anything else and the card
   * shows a plain plate rather than a stolen frame.
   */
  poster?: string;
  /** Runtime as it should read, e.g. "4:12". */
  duration?: string;
  /** ISO `YYYY-MM-DD`. Orders the shelf; undated videos sort last. */
  publishedOn?: string;
};

export const videos: Video[] = [];

/**
 * The shelves, in the order they should be read: what happens, then how it is
 * paid for, then the two things people ask about afterwards.
 */
export const videoTopics: { id: VideoTopic; label: string; blurb: string }[] = [
  {
    id: "process",
    label: "How it works",
    blurb: "From the first conversation to the day you get the keys.",
  },
  {
    id: "financing",
    label: "Paying for it",
    blurb:
      "Construction loans, end loans, and what the difference actually means for your money.",
  },
  {
    id: "land",
    label: "Land and site work",
    blurb: "Permits, septic, wells, foundations — the half of the job under the house.",
  },
  {
    id: "homes",
    label: "The homes",
    blurb: "Walkthroughs, options, and how a home is built before it reaches you.",
  },
];

/** Videos on one shelf, newest first. */
export function videosByTopic(topic: VideoTopic): Video[] {
  return videos
    .filter((v) => v.topic === topic)
    .sort((a, b) => (b.publishedOn ?? "").localeCompare(a.publishedOn ?? ""));
}

/** Shelves that actually hold something — an empty one is not rendered. */
export function populatedTopics() {
  return videoTopics
    .map((t) => ({ ...t, videos: videosByTopic(t.id) }))
    .filter((t) => t.videos.length > 0);
}

/** A file we can hand to `<video>` rather than an iframe. */
export function isSelfHosted(url: string): boolean {
  return url.startsWith("/");
}

const YOUTUBE =
  /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/;
const VIMEO = /vimeo\.com\/(?:video\/)?(\d+)/;

/** The YouTube id in a URL, or undefined — also what picks the thumbnail. */
export function youTubeId(url: string): string | undefined {
  return url.match(YOUTUBE)?.[1];
}

/**
 * The embeddable form of a video URL.
 *
 * `youtube-nocookie.com` rather than `youtube.com` on purpose: the page
 * already does not load anything until play is pressed, and this keeps the
 * press itself from writing an advertising cookie.
 *
 * Returns undefined for a URL neither service recognises, which is the signal
 * to render the link rather than an embed — a broken iframe says nothing,
 * whereas a link at least still goes somewhere.
 */
export function videoEmbedUrl(url: string): string | undefined {
  const yt = youTubeId(url);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&rel=0`;
  const vimeo = url.match(VIMEO)?.[1];
  if (vimeo) return `https://player.vimeo.com/video/${vimeo}?autoplay=1`;
  return undefined;
}

/** The still to show before play: the poster, else YouTube's own thumbnail. */
export function videoPoster(video: Video): string | undefined {
  if (video.poster) return video.poster;
  const yt = youTubeId(video.url);
  return yt ? `https://i.ytimg.com/vi/${yt}/hqdefault.jpg` : undefined;
}

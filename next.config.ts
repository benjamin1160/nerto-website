import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Next 16 only serves qualities on this allowlist; 90 is for the hero photo.
    qualities: [75, 90],
    /* YouTube's own thumbnails, for videos in `lib/videos.ts` that carry no
       local poster. Nothing else is fetched from a third party at render
       time — see the note in `components/video-library.tsx` about the player
       itself not loading until somebody presses play. */
    remotePatterns: [{ protocol: "https", hostname: "i.ytimg.com" }],
  },
  experimental: {
    // Lets listing-card artwork morph into the detail-page hero on navigation.
    viewTransition: true,
  },
  /* The catalogue lives at /listings. It used to live at /homes, and the
     inbound links — indexed pages, printed cards, whatever a previous site
     pointed at — outlive the rename, so the old paths keep resolving. */
  async redirects() {
    return [
      { source: "/homes", destination: "/listings", permanent: true },
      { source: "/homes/:slug", destination: "/listings/:slug", permanent: true },
      // Model search is the listings band on the landing page, not a page.
      { source: "/model-search", destination: "/#listings", permanent: false },
    ];
  },
};

export default nextConfig;

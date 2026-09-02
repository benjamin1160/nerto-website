import { Landing } from "@/components/landing";

/**
 * The home page is the landing composition and nothing else. Which bands it
 * shows, and in what order, is `lib/page-config.ts` and
 * `components/landing.tsx` — the same pair every custom page under
 * `/p/<slug>` renders through.
 */
export default function HomePage() {
  return <Landing />;
}

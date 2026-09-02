import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { HomeFinder } from "@/components/home-finder";
import { pages } from "@/lib/page-config";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Build a home",
  description: `Four questions and ${site.name} narrows the catalogue down to the homes that fit your bedrooms, your ground and your budget. Nothing to sign, no credit pull.`,
  robots: { index: true, follow: true },
};

/**
 * The wizard owns the whole screen — no page hero, no numbered eyebrow, and
 * the floating call button steps aside (see `components/floating-call.tsx`).
 * A visitor part-way through a four-step form does not need more chrome.
 */
export default function NewHomePage() {
  if (!pages.buildAHome) redirect("/");
  return <HomeFinder />;
}

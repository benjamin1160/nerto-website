import type { MetadataRoute } from "next";
import { publishedPosts } from "@/lib/blog";
import { publishedCustomPages } from "@/lib/custom-pages";
import { listings } from "@/lib/homes";
import { pages, type OptionalPage } from "@/lib/page-config";
import { publishedProjects } from "@/lib/projects";
import { livePromotions } from "@/lib/promotions";
import { site } from "@/lib/site";

/* A route turned off in `lib/page-config.ts` redirects to `/`, so it has no
   business being in here. `page` is the switch that governs each entry;
   entries without one are always present. */
const STATIC_ROUTES: { path: string; priority: number; page?: OptionalPage }[] = [
  { path: "", priority: 1 },
  { path: "/listings", priority: 0.9, page: "listings" },
  { path: "/new-home", priority: 0.85, page: "buildAHome" },
  { path: "/communities", priority: 0.8, page: "communities" },
  { path: "/land-deals", priority: 0.85, page: "landDeals" },
  { path: "/start-here", priority: 0.85, page: "startHere" },
  { path: "/why-manufactured", priority: 0.8, page: "whyManufactured" },
  { path: "/financing", priority: 0.7, page: "financing" },
  { path: "/prequalify", priority: 0.75, page: "prequalify" },
  { path: "/faq", priority: 0.7, page: "faq" },
  { path: "/projects", priority: 0.8, page: "projects" },
  { path: "/videos", priority: 0.7, page: "videos" },
  { path: "/blog", priority: 0.6, page: "blog" },
  { path: "/promotions", priority: 0.6, page: "promotions" },
  { path: "/address", priority: 0.6, page: "address" },
  { path: "/about", priority: 0.6, page: "about" },
  { path: "/contact", priority: 0.6, page: "contact" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const entry = (path: string, priority: number) => ({
    url: `${site.url}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority,
  });

  const staticRoutes = STATIC_ROUTES.filter(
    (r) => !r.page || (pages[r.page] && (r.page !== "promotions" || livePromotions().length > 0)),
  ).map((r) => entry(r.path, r.priority));

  const homes = pages.listings
    ? listings.map((l) => entry(`/listings/${l.slug}`, 0.85))
    : [];

  const notes = pages.blog ? publishedPosts().map((p) => entry(`/blog/${p.slug}`, 0.5)) : [];

  /* A project page is evidence a search engine should see, so it ranks above
     a note. Both vanish with their switch, same as every other route. */
  const work = pages.projects
    ? publishedProjects().map((p) => entry(`/projects/${p.slug}`, 0.7))
    : [];

  const custom = publishedCustomPages()
    .filter((page) => listings.some((l) => l.series === page.series))
    .map((page) => entry(`/p/${page.slug}`, 0.7));

  return [...staticRoutes, ...homes, ...work, ...notes, ...custom];
}

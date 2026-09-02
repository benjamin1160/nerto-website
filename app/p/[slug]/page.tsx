import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Landing } from "@/components/landing";
import { customPageBySlug, publishedCustomPages } from "@/lib/custom-pages";
import { listings } from "@/lib/homes";

/**
 * A custom page is the landing page with the listings band narrowed to one
 * series — see `lib/custom-pages.ts`. Everything else about the composition,
 * including which bands appear at all, still comes from
 * `lib/page-config.ts`, so these pages cannot drift away from `/`.
 */
export function generateStaticParams() {
  return publishedCustomPages().map((page) => ({ slug: page.slug }));
}

export async function generateMetadata(props: PageProps<"/p/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const page = customPageBySlug(slug);
  if (!page) return {};

  return {
    title: page.title,
    description: page.description ?? page.subheadline,
    alternates: { canonical: `/p/${page.slug}` },
    openGraph: {
      title: page.title,
      description: page.description ?? page.subheadline,
      url: `/p/${page.slug}`,
    },
  };
}

export default async function CustomPage(props: PageProps<"/p/[slug]">) {
  const { slug } = await props.params;
  const page = customPageBySlug(slug);
  if (!page) notFound();

  /* An ad pointing at a page with no homes on it looks like it worked, which
     is worse than a 404. So a series that matches nothing is a 404. */
  if (!listings.some((l) => l.series === page.series)) notFound();

  return (
    <Landing
      listingSeries={page.series}
      listingsHeadline={page.title}
      listingsLede={page.subheadline}
    />
  );
}

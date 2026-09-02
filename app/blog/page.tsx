import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { Icon, Section } from "@/components/ui";
import { publishedPosts } from "@/lib/blog";
import { pages } from "@/lib/page-config";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Notes",
  description: `Things worth writing down from the lot at ${site.name} — what buyers get wrong, what the paperwork actually says, and what a set looks like from the inside.`,
};

const postDate = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

export default function BlogPage() {
  /* No posts written and the page does not exist. `pages.blog` ships off for
     exactly that reason — an empty blog is worse than no blog. */
  if (!pages.blog) redirect("/");

  const posts = publishedPosts();
  if (posts.length === 0) redirect("/");

  return (
    <>
      <PageHero
        photoKey="page/blog"
        index="01"
        eyebrow={`${posts.length} ${posts.length === 1 ? "note" : "notes"}`}
        title={
          <>
            Written down
            <br />
            so we stop repeating it.
          </>
        }
        lede="Longer answers than a walkthrough allows, from the people doing the work."
        kind="porch"
        breadcrumb={[
          { href: "/", label: "Home" },
          { href: "/blog", label: "Notes" },
        ]}
      />

      <Section>
        <div className="grid gap-px overflow-hidden rounded-2xl bg-line">
          {posts.map((post, i) => (
            <Reveal key={post.slug} delay={i * 70} className="bg-paper">
              <Link
                href={`/blog/${post.slug}`}
                className="group flex flex-col gap-4 p-8 transition-colors hover:bg-surface sm:flex-row sm:items-baseline sm:gap-10 sm:p-10"
              >
                <p className="shrink-0 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted sm:w-40">
                  {postDate.format(new Date(`${post.publishedOn}T00:00:00Z`))}
                </p>
                <div className="flex-1">
                  <h2 className="font-display text-2xl leading-snug tracking-tight text-ink transition-colors group-hover:text-ember sm:text-3xl">
                    {post.title}
                  </h2>
                  <p className="mt-3 max-w-2xl leading-relaxed text-muted">{post.excerpt}</p>
                  {post.author && (
                    <p className="mt-4 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted">
                      {post.author}
                    </p>
                  )}
                </div>
                <Icon.Arrow className="size-5 shrink-0 text-muted transition-transform duration-300 group-hover:translate-x-1 group-hover:text-ember" />
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>
    </>
  );
}

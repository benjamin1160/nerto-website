import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { ButtonLink, Container, Icon } from "@/components/ui";
import { postBySlug, publishedPosts } from "@/lib/blog";
import { pages } from "@/lib/page-config";

const postDate = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

export function generateStaticParams() {
  return pages.blog ? publishedPosts().map((post) => ({ slug: post.slug })) : [];
}

export async function generateMetadata(
  props: PageProps<"/blog/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const post = postBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: `/blog/${post.slug}`,
      publishedTime: post.publishedOn,
    },
  };
}

export default async function BlogPostPage(props: PageProps<"/blog/[slug]">) {
  if (!pages.blog) redirect("/");

  const { slug } = await props.params;
  const post = postBySlug(slug);
  if (!post) notFound();

  return (
    <>
      <PageHero
        photoKey={`blog/${post.slug}`}
        index="01"
        eyebrow={postDate.format(new Date(`${post.publishedOn}T00:00:00Z`))}
        title={post.title}
        lede={post.excerpt}
        kind="living"
        breadcrumb={[
          { href: "/", label: "Home" },
          { href: "/blog", label: "Notes" },
          { href: `/blog/${post.slug}`, label: post.title },
        ]}
      />

      <Container className="py-16 sm:py-24">
        <Reveal className="mx-auto max-w-2xl">
          <div className="space-y-6 text-[1.05rem] leading-relaxed text-ink-soft">
            {post.body.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>

          {post.author && (
            <p className="mt-12 border-t border-line pt-6 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted">
              {post.author}
            </p>
          )}

          <ButtonLink href="/blog" variant="outline" className="mt-12">
            All notes
            <Icon.Arrow className="size-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
          </ButtonLink>
        </Reveal>
      </Container>
    </>
  );
}

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ContactBand } from "@/components/contact-band";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { VideoCard } from "@/components/video-library";
import { Container, Eyebrow } from "@/components/ui";
import { pages } from "@/lib/page-config";
import { site } from "@/lib/site";
import { populatedTopics, videos } from "@/lib/videos";

export const metadata: Metadata = {
  title: "Videos",
  description: `Short explainers from ${site.name} — how the build process works, the difference between a construction loan and your end loan, and what site work involves.`,
};

export default function VideosPage() {
  /* Off until `lib/videos.ts` holds something. A page of empty shelves reads
     as a company that promised videos and never made them. */
  if (!pages.videos) redirect("/");

  const topics = populatedTopics();
  if (topics.length === 0) redirect("/");

  let n = 1;
  const index = () => String(n++).padStart(2, "0");

  return (
    <>
      <PageHero
        photoKey="page/videos"
        index={index()}
        eyebrow={`${videos.length} ${videos.length === 1 ? "video" : "videos"}`}
        title={
          <>
            The answers
            <br />
            we give every week.
          </>
        }
        lede="The same questions come up on every first phone call. Here they are answered once, properly, so you can watch them before you ring rather than after."
        kind="living"
        breadcrumb={[
          { href: "/", label: "Home" },
          { href: "/videos", label: "Videos" },
        ]}
      />

      {topics.map((topic) => (
        <section key={topic.id} className="border-b border-line last:border-b-0">
          <Container className="py-16 sm:py-20">
            <Reveal>
              <Eyebrow index={index()}>{topic.label}</Eyebrow>
              <h2 className="mt-5 max-w-2xl font-display text-headline text-balance text-ink">
                {topic.blurb}
              </h2>
            </Reveal>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {topic.videos.map((video, i) => (
                <Reveal key={video.slug} delay={i * 70}>
                  <VideoCard video={video} />
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      ))}

      <ContactBand />
    </>
  );
}

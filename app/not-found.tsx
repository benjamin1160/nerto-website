import { Scene } from "@/components/artwork/scene";
import { ButtonLink, Container, Eyebrow, Icon } from "@/components/ui";

export default function NotFound() {
  return (
    <section
      className="relative isolate flex min-h-[86svh] items-end overflow-hidden pb-20 pt-40"
    >
      <div className="grain absolute inset-0 -z-10">
        <Scene
          kind="exterior"
          photoKey="page/not-found"
          label=""
          className="size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/45" />
      </div>

      <Container>
        <Eyebrow index="404" className="!text-white/60">
          Nothing on this pad
        </Eyebrow>
        <h1 className="mt-6 max-w-3xl font-display text-display text-balance text-white">
          That home has already been set somewhere else.
        </h1>
        <p className="mt-7 max-w-xl text-lg leading-relaxed text-white/75">
          The page you were after has moved or never existed. The lot, however, is
          still full.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <ButtonLink href="/listings" className="!px-7 !py-4 !text-base">
            Browse the homes
            <Icon.Arrow className="size-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
          </ButtonLink>
          <ButtonLink
            href="/"
            variant="outline"
            className="!border-white/30 !px-7 !py-4 !text-base !text-white hover:!border-white hover:!bg-white hover:!text-ink"
          >
            Back to the start
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}

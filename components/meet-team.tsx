import { Scene } from "./artwork/scene";
import { Reveal } from "./reveal";
import { ButtonLink, Icon, Section, SectionHeading } from "./ui";
import type { TeamMember } from "@/lib/company";

const KINDS = ["living", "porch", "kitchen", "bedroom"] as const;

/**
 * The introduction band on the landing page: two or three of the people a
 * visitor will actually meet, then a link to the rest on `/about`.
 *
 * It renders whoever is in `company.team` and nothing else — no stock
 * portraits, no invented roles. A dealership that lists no staff turns
 * `sections.meetTeam` off, or simply leaves `team` empty, and the band
 * disappears. Portraits come from `page/about-team-N` in `lib/photos.ts`;
 * a missing key leaves the plate empty rather than substituting a stranger.
 */
export function MeetTeam({
  index,
  team,
  note,
}: {
  index: string;
  team: TeamMember[];
  note?: string;
}) {
  const shown = team.slice(0, 3);

  return (
    <Section id="meet-team">
      <Reveal>
        <SectionHeading
          index={index}
          eyebrow="Who you'll actually meet"
          title={
            <>
              Nobody here works
              <br />
              on commission.
            </>
          }
          lede={note}
          action={
            team.length > shown.length ? (
              <ButtonLink href="/about" variant="outline">
                Meet everyone
                <Icon.Arrow className="size-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
              </ButtonLink>
            ) : undefined
          }
        />
      </Reveal>

      <div className="mt-14 grid gap-px overflow-hidden rounded-2xl bg-line sm:grid-cols-3">
        {shown.map((member, i) => (
          <Reveal key={member.name} delay={i * 90} className="bg-paper">
            <div className="flex h-full flex-col">
              <div className="grain relative aspect-[4/5] overflow-hidden bg-surface-2">
                <Scene
                  kind={KINDS[i % KINDS.length]}
                  photoKey={`page/about-team-${i + 1}`}
                  sizes="(min-width: 640px) 33vw, 100vw"
                  label={member.name}
                  className="size-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  {member.since && (
                    <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-white/65">
                      Since {member.since}
                    </p>
                  )}
                  <p className="mt-1 font-display text-xl tracking-tight text-white">
                    {member.name}
                  </p>
                  <p className="text-sm text-white/75">{member.role}</p>
                </div>
              </div>
              <p className="flex-1 p-6 text-[0.95rem] leading-relaxed text-muted">{member.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

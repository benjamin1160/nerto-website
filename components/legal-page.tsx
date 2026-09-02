import { PageHero } from "./page-hero";
import { Reveal } from "./reveal";
import { Container } from "./ui";
import type { LegalSection } from "@/lib/legal";
import { site } from "@/lib/site";

const longDate = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

const TOKENS: Record<string, string | undefined> = {
  "{name}": site.name,
  "{email}": site.email,
  "{phone}": site.phone,
  "{state}": site.address.region,
};

/** Substitutes the business's own details. A clause whose token has no value
    is dropped rather than rendered with a hole in it. */
function fill(text: string): string | null {
  let out = text;
  for (const [token, value] of Object.entries(TOKENS)) {
    if (!out.includes(token)) continue;
    if (!value) return null;
    out = out.split(token).join(value);
  }
  return out;
}

/**
 * The shared armature for `/privacy-policy` and `/terms`: a hero, a revision
 * date, and numbered clauses out of `lib/legal.ts`. Both pages are the same
 * shape on purpose — a visitor checking one after the other should not have
 * to re-learn where anything is.
 */
export function LegalPage({
  title,
  lede,
  updated,
  sections,
  breadcrumbLabel,
  breadcrumbHref,
}: {
  title: string;
  lede: string;
  /** ISO date, `YYYY-MM-DD`. */
  updated: string;
  sections: LegalSection[];
  breadcrumbLabel: string;
  breadcrumbHref: string;
}) {
  return (
    <>
      <PageHero
        index="01"
        eyebrow={`Last updated ${longDate.format(new Date(`${updated}T00:00:00Z`))}`}
        title={title}
        lede={lede}
        kind="exterior"
        breadcrumb={[
          { href: "/", label: "Home" },
          { href: breadcrumbHref, label: breadcrumbLabel },
        ]}
      />

      <Container className="py-16 sm:py-24">
        <div className="mx-auto max-w-2xl">
          {sections.map((section, i) => {
            const body = section.body
              .map((block) =>
                Array.isArray(block)
                  ? block.map(fill).filter((s): s is string => s !== null)
                  : fill(block),
              )
              .filter((block) =>
                Array.isArray(block) ? block.length > 0 : block !== null,
              );
            if (body.length === 0) return null;

            return (
              <Reveal key={section.heading} delay={i * 40} as="section" className="mt-12 first:mt-0">
                <h2 className="flex items-baseline gap-4 font-display text-2xl tracking-tight text-ink">
                  <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-ember">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {section.heading}
                </h2>
                <div className="mt-5 space-y-5 leading-relaxed text-muted">
                  {body.map((block, j) =>
                    Array.isArray(block) ? (
                      <ul key={j} className="ml-1 space-y-2.5">
                        {block.map((item, k) => (
                          <li key={k} className="flex gap-3">
                            <span aria-hidden className="mt-2.5 size-1 shrink-0 rounded-full bg-ember" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p key={j}>{block}</p>
                    ),
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </>
  );
}

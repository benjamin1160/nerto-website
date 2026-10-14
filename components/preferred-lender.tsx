import Image from "next/image";
import { Reveal } from "./reveal";
import { ButtonLink, Icon, Section, SectionHeading } from "./ui";
import type { PreferredLender as Lender } from "@/lib/company";

const tel = (phone: string) => `tel:+1${phone.replace(/\D/g, "")}`;

/**
 * The loan officer NERTO sends buyers to, on `/financing`.
 *
 * Two things here are not decoration. The officer's NMLS ID sits beside
 * their name, because federal rules require it anywhere a loan officer is
 * advertised; and the small print says plainly that NERTO is not the lender
 * and that a buyer may use any lender they like — a recommendation that
 * reads as a requirement is the thing to avoid with a referral.
 */
export function PreferredLender({ index, lender }: { index: string; lender: Lender }) {
  return (
    <Section id="lender">
      <Reveal>
        <SectionHeading
          index={index}
          eyebrow="Our preferred lender"
          title="Talk to the lender we work with."
          lede={`${lender.name} at ${lender.company.replace(/ LLC$/, "")} knows how our builds are financed — home, land and site work — so the questions a lender new to manufactured and modular homes would ask have been answered before.`}
        />
      </Reveal>

      <Reveal className="mt-12">
        <div className="grid gap-8 rounded-card border border-line bg-surface p-7 sm:p-10 md:grid-cols-[auto_1fr] md:items-center md:gap-12">
          {lender.photo && (
            <Image
              src={lender.photo}
              alt={`${lender.name}, ${lender.title}`}
              width={176}
              height={176}
              className="size-32 rounded-full object-cover sm:size-44"
            />
          )}

          <div>
            <h3 className="font-display text-3xl tracking-tight text-ink">{lender.name}</h3>
            <p className="mt-1 text-muted">
              {lender.title}, {lender.company} &middot; NMLS #{lender.nmls}
            </p>

            <ul className="mt-6 grid gap-3 text-[0.95rem] text-ink-soft sm:grid-cols-2">
              <li className="flex items-center gap-2.5">
                <Icon.Phone className="size-4 shrink-0 text-ember" />
                <a href={tel(lender.phone)} className="hover:text-ink hover:underline">
                  {lender.phone}
                </a>
                <span className="text-muted">office</span>
              </li>
              {lender.mobile && (
                <li className="flex items-center gap-2.5">
                  <Icon.Phone className="size-4 shrink-0 text-ember" />
                  <a href={tel(lender.mobile)} className="hover:text-ink hover:underline">
                    {lender.mobile}
                  </a>
                  <span className="text-muted">mobile</span>
                </li>
              )}
              <li className="flex min-w-0 items-center gap-2.5 sm:col-span-2">
                <Icon.Mail className="size-4 shrink-0 text-ember" />
                <a href={`mailto:${lender.email}`} className="break-all hover:text-ink hover:underline">
                  {lender.email}
                </a>
              </li>
              {lender.office && (
                <li className="flex items-start gap-2.5 sm:col-span-2">
                  <Icon.Pin className="mt-0.5 size-4 shrink-0 text-ember" />
                  {lender.office}
                </li>
              )}
            </ul>

            {lender.loanPrograms && lender.loanPrograms.length > 0 && (
              <div className="mt-7 border-t border-line pt-6">
                <p className="eyebrow">Loans {lender.name.split(" ")[0]} offers</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {lender.loanPrograms.map((p) => (
                    <li
                      key={p.name}
                      className="rounded-full border border-line bg-paper px-3.5 py-1.5 text-sm font-medium text-ink"
                    >
                      {p.name}
                    </li>
                  ))}
                </ul>
                {lender.loanPrograms.some((p) => p.note) && (
                  <dl className="mt-4 space-y-1.5 text-sm leading-relaxed text-muted">
                    {lender.loanPrograms
                      .filter((p) => p.note)
                      .map((p) => (
                        <div key={p.name}>
                          <dt className="inline font-semibold text-ink">{p.name}: </dt>
                          <dd className="inline">{p.note}</dd>
                        </div>
                      ))}
                  </dl>
                )}
              </div>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              {lender.applyUrl && (
                <ButtonLink
                  href={lender.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="!px-7 !py-4 !text-base"
                >
                  Apply with {lender.name.split(" ")[0]}
                  <Icon.External className="size-4" />
                </ButtonLink>
              )}
              <ButtonLink
                href={lender.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="outline"
                className="!px-7 !py-4 !text-base"
              >
                View profile &amp; reviews
                <Icon.External className="size-4" />
              </ButtonLink>
            </div>
          </div>
        </div>
      </Reveal>

      <p className="mt-6 max-w-4xl text-xs leading-relaxed text-muted">
        NERTO Homes is not a lender and does not make credit decisions. You are free to
        use any lender you choose. Loans are offered by {lender.company}, NMLS #
        {lender.companyNmls} (
        <a
          href={`https://www.nmlsconsumeraccess.org/EntityDetails.aspx/COMPANY/${lender.companyNmls}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2"
        >
          NMLS Consumer Access
        </a>
        ); {lender.name}, NMLS #{lender.nmls}
        {lender.licensedIn ? `, licensed in ${lender.licensedIn}` : ""}. Equal Housing
        Opportunity. All loans subject to credit approval and underwriting.
      </p>
    </Section>
  );
}

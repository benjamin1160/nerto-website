"use client";

import { useActionState } from "react";
import { requestPreApproval } from "@/app/land-deals/actions";
import { EMPTY_LEAD_STATE } from "@/lib/land/lead";
import { Container, cx, Icon } from "./ui";
import { LeadContext } from "./lead-context";
import { site } from "@/lib/site";

const BUDGETS = [
  { value: "", label: "Select a range" },
  { value: "under-50k", label: "Under $50,000" },
  { value: "50-100k", label: "$50,000 – $100,000" },
  { value: "100-150k", label: "$100,000 – $150,000" },
  { value: "150-200k", label: "$150,000 – $200,000" },
  { value: "200k-plus", label: "$200,000+" },
];

/**
 * The enquiry form in the closing band.
 *
 * It is the counterpart to `components/quote-form.tsx`, not a duplicate of
 * it. That one is six fields in the hero for somebody who will not scroll;
 * this one is for somebody who has scrolled the whole page, is further along,
 * and will happily say where they want to live and what they can spend. Both
 * post to the same Server Action and are told apart in the CRM by `source`.
 *
 * It renders bare — no card of its own. The band around it supplies the
 * panel, so this can also be dropped into a page that already has one.
 *
 * The promise under the heading is the only thing here a business has to
 * keep, so it is one sentence and it is a day, not an hour.
 */
export function ContactBand() {
  const [state, action, pending] = useActionState(requestPreApproval, EMPTY_LEAD_STATE);
  const err = state.fieldErrors ?? {};
  const was = state.values ?? {};

  const label = "mb-1.5 block text-sm font-medium text-ink";
  const field =
    "w-full rounded-lg border border-line bg-paper px-4 py-3 text-sm text-ink transition-colors placeholder:text-muted focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/25";
  const req = (
    <span className="text-[var(--ember)]" aria-hidden>
      {" "}
      *
    </span>
  );

  if (state.status === "ok") {
    return (
      <div className="flex flex-col items-start gap-4 py-4">
        <span className="grid size-11 place-items-center rounded-full bg-moss text-white">
          <Icon.Check className="size-5" />
        </span>
        <p className="text-xl font-semibold text-ink">That&apos;s with us.</p>
        <p className="max-w-md text-sm leading-relaxed text-muted">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="source" value="landing-contact" />

      {/* Honeypot: real people leave this empty. */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />
      <LeadContext />

      <div>
        <h3 className="text-xl font-semibold text-ink">Contact us</h3>
        <p className="mt-1 text-sm text-muted">
          We&apos;ll get back to you within 24 hours.
        </p>
      </div>

      <div>
        <label className={label} htmlFor="contact-name">
          Name{req}
        </label>
        <input
          id="contact-name"
          name="name"
          autoComplete="name"
          placeholder="Your full name"
          defaultValue={was.name}
          required
          aria-invalid={!!err.name}
          className={cx(field, err.name && "border-ember")}
        />
        {err.name && <p className="mt-1.5 text-xs text-ember">{err.name}</p>}
      </div>

      <div>
        <label className={label} htmlFor="contact-email">
          Email{req}
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          defaultValue={was.email}
          required
          aria-invalid={!!err.email}
          className={cx(field, err.email && "border-ember")}
        />
        {err.email && <p className="mt-1.5 text-xs text-ember">{err.email}</p>}
      </div>

      <div>
        <label className={label} htmlFor="contact-phone">
          Phone{req}
        </label>
        <input
          id="contact-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder={site.phone}
          defaultValue={was.phone}
          required
          aria-invalid={!!err.phone}
          className={cx(field, err.phone && "border-ember")}
        />
        {err.phone && <p className="mt-1.5 text-xs text-ember">{err.phone}</p>}
      </div>

      <div>
        <label className={label} htmlFor="contact-budget">
          Budget{req}
        </label>
        <div className="relative">
          <Icon.Dollar className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
          {/* Keyed so a rejected submission does not blank it — see quote-form. */}
          <select
            key={`budget-${was.budget ?? ""}`}
            id="contact-budget"
            name="budget"
            defaultValue={was.budget ?? ""}
            required
            aria-invalid={!!err.budget}
            className={cx(field, "appearance-none pl-10", err.budget && "border-ember")}
          >
            {BUDGETS.map((o) => (
              <option key={o.value} value={o.value} disabled={o.value === ""}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        {err.budget && <p className="mt-1.5 text-xs text-ember">{err.budget}</p>}
      </div>

      <div>
        <label className={label} htmlFor="contact-location">
          Desired location{req}
        </label>
        <div className="relative">
          <Icon.Pin className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            id="contact-location"
            name="location"
            placeholder="City, state or county"
            defaultValue={was.location}
            required
            aria-invalid={!!err.location}
            className={cx(field, "pl-10", err.location && "border-ember")}
          />
        </div>
        {err.location && <p className="mt-1.5 text-xs text-ember">{err.location}</p>}
      </div>

      {state.status === "error" && Object.keys(err).length === 0 && (
        <p className="text-sm text-ember">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[image:var(--gradient)] py-4 text-base font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:bg-[image:var(--gradient-hover)] disabled:opacity-70"
      >
        {!pending && <Icon.Send className="size-5 shrink-0" />}
        {pending ? "Sending…" : "Get in touch"}
      </button>

      <p className="text-center text-xs leading-relaxed text-muted">
        By submitting, you agree to receive communications from us. We do not sell your
        details, and one reply saying stop ends it.
      </p>
    </form>
  );
}

/**
 * The same form for a page with no panel of its own to put it in — the foot
 * of `/projects`, each project, and `/videos`. `ContactBand` renders bare and
 * stretches to whatever holds it, so dropped straight into a page it runs to
 * the edges of the screen; this gives it the section, gutter and card the
 * landing page's closing band gives it.
 */
export function ContactSection({ id }: { id?: string }) {
  return (
    <section
      id={id}
      className="scroll-mt-[calc(var(--chrome-h)+1.5rem)] border-t border-line bg-surface-2"
    >
      <Container className="py-20 sm:py-24">
        <div className="mx-auto max-w-xl rounded-2xl border border-line bg-surface p-6 shadow-[var(--card-shadow)] md:p-8">
          <ContactBand />
        </div>
      </Container>
    </section>
  );
}

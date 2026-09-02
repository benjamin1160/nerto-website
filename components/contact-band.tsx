"use client";

import { useActionState } from "react";
import { requestPreApproval } from "@/app/land-deals/actions";
import { EMPTY_LEAD_STATE } from "@/lib/land/lead";
import { cx, Icon } from "./ui";
import { site } from "@/lib/site";

const BUDGETS = [
  { value: "", label: "Select a range" },
  { value: "under-80k", label: "Under $80,000" },
  { value: "80-140k", label: "$80,000 – $140,000" },
  { value: "140-200k", label: "$140,000 – $200,000" },
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

      <div>
        <h3 className="text-xl font-semibold text-ink">Contact us</h3>
        <p className="mt-1 text-sm text-muted">
          We&apos;ll get back to you within one working day.
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
          Email
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          defaultValue={was.email}
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
          Budget
        </label>
        <div className="relative">
          <Icon.Dollar className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <select
            id="contact-budget"
            name="budget"
            defaultValue={was.budget ?? ""}
            className={cx(field, "appearance-none pl-10")}
          >
            {BUDGETS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={label} htmlFor="contact-location">
          Desired location
        </label>
        <div className="relative">
          <Icon.Pin className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            id="contact-location"
            name="location"
            placeholder="City, state or county"
            defaultValue={was.location}
            className={cx(field, "pl-10")}
          />
        </div>
      </div>

      {state.status === "error" && !err.name && !err.phone && !err.email && (
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

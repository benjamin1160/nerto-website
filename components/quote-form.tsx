"use client";

import { useActionState } from "react";
import { requestPreApproval } from "@/app/land-deals/actions";
import { LeadContext } from "./lead-context";
import { EMPTY_LEAD_STATE } from "@/lib/land/lead";
import { cx, Icon } from "./ui";
import { site } from "@/lib/site";

/* Four answers that actually change what we say back. Anything more and the
   card stops being a thing somebody fills in on the way past. */
const BUYER_TYPES = [
  { value: "", label: "What best describes you? *" },
  { value: "self", label: "Buying for myself" },
  { value: "land-owner", label: "Land owner" },
  { value: "investor", label: "Investor" },
  { value: "exploring", label: "Just exploring" },
];

const BUDGETS = [
  { value: "", label: "Budget" },
  { value: "under-50k", label: "Under $50,000" },
  { value: "50-100k", label: "$50,000 – $100,000" },
  { value: "100-150k", label: "$100,000 – $150,000" },
  { value: "150-200k", label: "$150,000 – $200,000" },
  { value: "200k-plus", label: "$200,000+" },
];

/**
 * The quote card that sits beside the headline in the hero.
 *
 * It is dark on purpose, and it is the only dark thing above the fold. The
 * page is white, the photograph behind it is bright, and a white card on a
 * white-ish scrim reads as part of the background rather than as the thing
 * to fill in. Near-black gives it an edge without adding a third colour.
 *
 * Six fields is the ceiling. The long version — county, monthly payment,
 * notes — is `components/pre-approval-form.tsx` on `/prequalify` and
 * `/land-deals`; this one exists to catch somebody who is not going to click
 * through to either. All of them post to the same Server Action and are told
 * apart in the CRM by their `source`.
 */
export function QuoteForm() {
  const [state, action, pending] = useActionState(requestPreApproval, EMPTY_LEAD_STATE);
  const err = state.fieldErrors ?? {};
  const was = state.values ?? {};

  /* Fixed near-black rather than palette tokens: this card sits on a
     photograph in both themes, so it must not follow the page from white to
     slate underneath it. */
  const field =
    "w-full rounded-lg border border-[#333333] bg-[#2a2a2a] px-4 py-3 text-sm text-white transition-colors placeholder:text-white/45 focus:border-[var(--ember)] focus:outline-none focus:ring-2 focus:ring-[var(--ember)]/40";

  return (
    <div className="rounded-2xl border border-[#333333] bg-[#1a1a1a] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.12)] md:p-8">
      {state.status === "ok" ? (
        <div className="flex flex-col items-start gap-4 py-4">
          <span className="grid size-11 place-items-center rounded-full bg-moss text-white">
            <Icon.Check className="size-5" />
          </span>
          <p className="text-xl font-semibold text-white">Got it — we&apos;ll call you.</p>
          <p className="max-w-md text-sm leading-relaxed text-white/70">{state.message}</p>
        </div>
      ) : (
        <form action={action} className="space-y-3">
          <input type="hidden" name="source" value="landing-quote" />

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

          <h3 className="mb-4 text-xl font-semibold text-white">
            Get a free home &amp; land quote
          </h3>

          <div>
            <input
              name="name"
              autoComplete="name"
              placeholder="Your name *"
              aria-label="Your name"
              defaultValue={was.name}
              required
              aria-invalid={!!err.name}
              className={cx(field, err.name && "!border-[var(--ember)]")}
            />
            {err.name && <p className="mt-1.5 text-xs text-white/80">{err.name}</p>}
          </div>

          <div>
            <input
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Email"
              aria-label="Email"
              defaultValue={was.email}
              aria-invalid={!!err.email}
              className={cx(field, err.email && "!border-[var(--ember)]")}
            />
            {err.email && <p className="mt-1.5 text-xs text-white/80">{err.email}</p>}
          </div>

          <div>
            <input
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="Phone *"
              aria-label="Phone"
              defaultValue={was.phone}
              required
              aria-invalid={!!err.phone}
              className={cx(field, err.phone && "!border-[var(--ember)]")}
            />
            {err.phone && <p className="mt-1.5 text-xs text-white/80">{err.phone}</p>}
          </div>

          <select
            name="landStatus"
            aria-label="What best describes you?"
            defaultValue={was.landStatus ?? ""}
            className={cx(field, "appearance-none")}
          >
            {BUYER_TYPES.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          <div className="grid grid-cols-2 gap-3">
            <select
              name="budget"
              aria-label="Budget"
              defaultValue={was.budget ?? ""}
              className={cx(field, "appearance-none")}
            >
              {BUDGETS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <input
              name="location"
              placeholder="Location"
              aria-label="Location"
              defaultValue={was.location}
              className={field}
            />
          </div>

          {state.status === "error" && !err.name && !err.phone && !err.email && (
            <p className="text-sm text-white/80">{state.message}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[image:var(--gradient)] py-4 text-base font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:bg-[image:var(--gradient-hover)] disabled:opacity-70"
          >
            {!pending && <Icon.Send className="size-5 shrink-0" />}
            {pending ? "Sending…" : "Get your free quote"}
          </button>

          <p className="text-center text-xs text-white/50">
            No credit check. Or call{" "}
            <a href={site.phoneHref} className="underline underline-offset-2">
              {site.phone}
            </a>
            .
          </p>
        </form>
      )}
    </div>
  );
}

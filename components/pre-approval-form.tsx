"use client";

import { useActionState } from "react";
import { requestPreApproval } from "@/app/land-deals/actions";
import { BY_PRICE } from "@/lib/land/areas";
import { EMPTY_LEAD_STATE, type LeadSource } from "@/lib/land/lead";
import { money } from "@/lib/format";
import { site } from "@/lib/site";
import { buttonStyles, cx, Icon } from "./ui";

const field =
  "w-full rounded-xl border border-line-strong bg-paper px-4 py-3 text-[0.95rem] text-ink placeholder:text-muted transition-colors focus:border-ink focus:outline-none";

/**
 * The land-deals lead form. Unlike `components/inquiry-form.tsx`, which
 * resolves locally, this one posts to a Server Action that forwards to
 * `LEAD_WEBHOOK_URL` — see `app/land-deals/actions.ts`.
 */
export function PreApprovalForm({ source = "land-deals-map" }: { source?: LeadSource }) {
  const [state, action, pending] = useActionState(requestPreApproval, EMPTY_LEAD_STATE);
  const err = state.fieldErrors ?? {};
  const was = state.values ?? {};

  if (state.status === "ok") {
    return (
      <div className="flex flex-col items-start gap-5 rounded-card border border-line bg-surface p-8 sm:p-10">
        <span className="grid size-12 place-items-center rounded-full bg-moss text-paper dark:text-ink">
          <Icon.Check className="size-6" />
        </span>
        <div>
          <h3 className="font-display text-2xl tracking-tight text-ink">
            You&apos;re in the queue.
          </h3>
          <p className="mt-3 max-w-md leading-relaxed text-muted">{state.message}</p>
        </div>
        <p className="text-sm text-muted">
          Can&apos;t wait? Call{" "}
          <a href={site.phoneHref} className="text-ink underline underline-offset-4">
            {site.phone}
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="grid gap-5 sm:grid-cols-2">
      <input type="hidden" name="source" value={source} />

      {/* Honeypot: real people leave this empty. */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      <label className="block">
        <span className="eyebrow">Your name</span>
        <input
          name="name"
          autoComplete="name"
          placeholder="Alex Whitfield"
          defaultValue={was.name}
          required
          aria-invalid={!!err.name}
          aria-describedby={err.name ? "err-land-name" : undefined}
          className={cx(field, "mt-2.5", err.name && "border-ember")}
        />
        {err.name && (
          <span id="err-land-name" className="mt-2 block text-xs text-ember">
            {err.name}
          </span>
        )}
      </label>

      <label className="block">
        <span className="eyebrow">Mobile number</span>
        <input
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder={site.phone}
          defaultValue={was.phone}
          required
          aria-invalid={!!err.phone}
          aria-describedby={err.phone ? "err-land-phone" : undefined}
          className={cx(field, "mt-2.5", err.phone && "border-ember")}
        />
        {err.phone && (
          <span id="err-land-phone" className="mt-2 block text-xs text-ember">
            {err.phone}
          </span>
        )}
      </label>

      <label className="block">
        <span className="eyebrow">Email (optional)</span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          placeholder="alex@example.com"
          defaultValue={was.email}
          aria-invalid={!!err.email}
          aria-describedby={err.email ? "err-land-email" : undefined}
          className={cx(field, "mt-2.5", err.email && "border-ember")}
        />
        {err.email && (
          <span id="err-land-email" className="mt-2 block text-xs text-ember">
            {err.email}
          </span>
        )}
      </label>

      <label className="block">
        <span className="eyebrow">County you&apos;re looking at</span>
        <select
          name="county"
          defaultValue={was.county ?? ""}
          aria-invalid={!!err.county}
          aria-describedby={err.county ? "err-land-county" : undefined}
          className={cx(field, "mt-2.5", err.county && "border-ember")}
        >
          <option value="">Not sure yet</option>
          {BY_PRICE.map((a) => (
            <option key={a.slug} value={a.slug}>
              {a.county} — from {money(a.startingPayment)}/mo
            </option>
          ))}
        </select>
        {err.county && (
          <span id="err-land-county" className="mt-2 block text-xs text-ember">
            {err.county}
          </span>
        )}
      </label>

      <label className="block">
        <span className="eyebrow">Do you have land?</span>
        <select
          name="landStatus"
          defaultValue={was.landStatus ?? "looking"}
          className={cx(field, "mt-2.5")}
        >
          <option value="own">I already own it</option>
          <option value="under-contract">Under contract on a parcel</option>
          <option value="found">Found one I like</option>
          <option value="looking">Still looking</option>
          <option value="no-idea">No idea where to start</option>
        </select>
      </label>

      <label className="block">
        <span className="eyebrow">Comfortable monthly payment</span>
        <input
          name="budget"
          inputMode="numeric"
          placeholder="$1,500"
          defaultValue={was.budget}
          className={cx(field, "mt-2.5")}
        />
      </label>

      <label className="block sm:col-span-2">
        <span className="eyebrow">Anything else? (optional)</span>
        <textarea
          name="notes"
          rows={3}
          placeholder="Bedrooms you need, credit concerns, a parcel link — whatever helps."
          defaultValue={was.notes}
          className={cx(field, "mt-2.5")}
        />
      </label>

      {state.status === "error" && (
        <p
          role="alert"
          className="rounded-xl border border-ember bg-surface-2 px-4 py-3 text-sm text-ink sm:col-span-2"
        >
          {state.message}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center">
        <button type="submit" disabled={pending} className={cx(buttonStyles.primary, "!py-3.5")}>
          {pending ? "Sending…" : "Get my pre-approval range"}
        </button>
        <p className="text-xs leading-relaxed text-muted">
          Soft check to start — no hit to your credit. We answer with a real number, not a
          brochure.
        </p>
      </div>
    </form>
  );
}

"use client";

import { useActionState } from "react";
import { requestWalkthrough } from "@/app/actions";
import { listings, seriesLabel } from "@/lib/homes";
import { EMPTY_WALKTHROUGH_STATE, TIME_SLOTS } from "@/lib/walkthrough";
import { LeadContext } from "./lead-context";
import { buttonStyles, cx, Icon } from "./ui";

/**
 * The walkthrough request, on the contact page and at the foot of every
 * listing.
 *
 * It posts to `requestWalkthrough` in `app/actions.ts`, which validates
 * again — a Server Function is reachable by direct POST — and hands the lead
 * to `lib/ghl/submit.ts`. Field names are the ones the CRM mapping expects:
 * `name`, `email`, `phone`, `home`, `date`, `slot`, `message`, `callFirst`.
 */
export function InquiryForm({
  defaultHome,
  title = "Book a walkthrough",
  lede = "Pick a slot and we will confirm by phone within one business hour. No deposit, no sales floor, no pressure to sit at a desk.",
  compact = false,
}: {
  defaultHome?: string;
  title?: string;
  lede?: string;
  compact?: boolean;
}) {
  const [state, action, pending] = useActionState(
    requestWalkthrough,
    EMPTY_WALKTHROUGH_STATE,
  );
  const errors = state.fieldErrors ?? {};
  const was = state.values ?? {};

  const field =
    "w-full rounded-xl border border-line-strong bg-paper px-4 py-3 text-[0.95rem] text-ink placeholder:text-muted transition-colors focus:border-ink focus:outline-none";

  if (state.status === "ok") {
    return (
      <div
        className={cx(
          "flex flex-col items-start gap-5 rounded-card border border-line bg-surface",
          compact ? "p-6" : "p-8 sm:p-10",
        )}
      >
        <span className="grid size-12 place-items-center rounded-full bg-moss text-paper dark:text-ink">
          <Icon.Check className="size-6" />
        </span>
        <div>
          <h3 className="font-display text-2xl tracking-tight text-ink">
            That&apos;s booked on our side.
          </h3>
          <p className="mt-3 max-w-md leading-relaxed text-muted">
            You&apos;ll get a text confirming the slot, and a real person will call to check
            what you want to see. Bring the sceptic. Bring boots — we&apos;ll get under a home.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form
      action={action}
      noValidate
      className={cx(
        "rounded-card border border-line bg-surface",
        compact ? "p-6" : "p-6 sm:p-9",
      )}
    >
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

      <h3 className="font-display text-2xl tracking-tight text-ink">{title}</h3>
      <p className="mt-3 text-[0.92rem] leading-relaxed text-muted">{lede}</p>

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="eyebrow">Your name</span>
          <input
            name="name"
            autoComplete="name"
            placeholder="Alex Whitfield"
            defaultValue={was.name}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "err-name" : undefined}
            className={cx(field, "mt-2.5", errors.name && "border-ember")}
          />
          {errors.name && (
            <span id="err-name" className="mt-2 block text-xs text-ember">
              {errors.name}
            </span>
          )}
        </label>

        <label className="block">
          <span className="eyebrow">Email</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            placeholder="alex@example.com"
            defaultValue={was.email}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "err-email" : undefined}
            className={cx(field, "mt-2.5", errors.email && "border-ember")}
          />
          {errors.email && (
            <span id="err-email" className="mt-2 block text-xs text-ember">
              {errors.email}
            </span>
          )}
        </label>

        <label className="block">
          <span className="eyebrow">Phone (optional)</span>
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="(207) 555-0100"
            defaultValue={was.phone}
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? "err-phone" : undefined}
            className={cx(field, "mt-2.5", errors.phone && "border-ember")}
          />
          {errors.phone && (
            <span id="err-phone" className="mt-2 block text-xs text-ember">
              {errors.phone}
            </span>
          )}
        </label>

        <label className="block sm:col-span-2">
          <span className="eyebrow">Home you want to see</span>
          <select
            name="home"
            defaultValue={was.home ?? defaultHome ?? ""}
            className={cx(field, "mt-2.5 cursor-pointer")}
          >
            <option value="">Not sure yet — show me a few</option>
            {listings.map((l) => (
              <option key={l.slug} value={l.slug}>
                {l.series ? `${l.name} — ${seriesLabel(l.series)}` : l.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="eyebrow">Preferred date</span>
          <input
            name="date"
            type="date"
            defaultValue={was.date}
            aria-invalid={!!errors.date}
            aria-describedby={errors.date ? "err-date" : undefined}
            className={cx(field, "mt-2.5", errors.date && "border-ember")}
          />
          {errors.date && (
            <span id="err-date" className="mt-2 block text-xs text-ember">
              {errors.date}
            </span>
          )}
        </label>

        <label className="block">
          <span className="eyebrow">Time that works</span>
          <select name="slot" defaultValue={was.slot} className={cx(field, "mt-2.5 cursor-pointer")}>
            {TIME_SLOTS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>

        <label className="block sm:col-span-2">
          <span className="eyebrow">Anything we should know</span>
          <textarea
            name="message"
            rows={3}
            defaultValue={was.message}
            placeholder="We have a half-acre outside Chelsea and no idea whether it will perc."
            className={cx(field, "mt-2.5 resize-y")}
          />
        </label>

        <label className="flex cursor-pointer items-start gap-3 sm:col-span-2">
          <input
            name="callFirst"
            type="checkbox"
            defaultChecked={state.callFirst}
            className="mt-0.5 size-4 shrink-0 accent-[var(--ember)]"
          />
          <span className="text-[0.88rem] leading-relaxed text-muted">
            Call me before I drive out — I have questions that will save us both a trip.
          </span>
        </label>
      </div>

      {state.status === "error" && !errors.name && !errors.email && !errors.phone && !errors.date && (
        <p
          role="alert"
          className="mt-6 rounded-xl border border-ember bg-surface-2 px-4 py-3 text-sm text-ink"
        >
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className={cx(buttonStyles.primary, "mt-7 w-full !py-4 text-base")}
      >
        {pending ? "Sending…" : "Request the walkthrough"}
        {!pending && (
          <Icon.Arrow className="size-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
        )}
      </button>
    </form>
  );
}

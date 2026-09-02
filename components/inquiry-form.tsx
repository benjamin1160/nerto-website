"use client";

import { useState, type FormEvent } from "react";
import { listings, seriesLabel } from "@/lib/homes";
import { buttonStyles, cx, Icon } from "./ui";

type Errors = Partial<Record<"name" | "email" | "phone" | "date", string>>;

const TIME_SLOTS = ["Morning (9–12)", "Midday (12–3)", "Afternoon (3–6)", "Weekend only"];

/**
 * Demo form: it validates properly and then resolves locally. Wire the
 * `submit` branch to a Server Action or your CRM endpoint when you deploy.
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
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");

  function validate(data: FormData): Errors {
    const next: Errors = {};
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const date = String(data.get("date") ?? "");

    if (name.length < 2) next.name = "Tell us what to call you.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email)) next.email = "That email doesn't look right.";
    if (phone && phone.replace(/\D/g, "").length < 10)
      next.phone = "Ten digits, or leave it blank.";
    if (date && new Date(date) < new Date(new Date().toDateString()))
      next.date = "Pick a date that hasn't happened yet.";
    return next;
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const found = validate(data);
    setErrors(found);
    if (Object.keys(found).length) {
      const first = e.currentTarget.querySelector<HTMLElement>("[aria-invalid='true']");
      first?.focus();
      return;
    }
    setState("sending");
    await new Promise((r) => setTimeout(r, 700));
    setState("sent");
  }

  const field =
    "w-full rounded-xl border border-line-strong bg-paper px-4 py-3 text-[0.95rem] text-ink placeholder:text-muted transition-colors focus:border-ink focus:outline-none";

  if (state === "sent") {
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
        <button
          type="button"
          onClick={() => setState("idle")}
          className={cx(buttonStyles.small)}
        >
          Book another
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className={cx(
        "rounded-card border border-line bg-surface",
        compact ? "p-6" : "p-6 sm:p-9",
      )}
    >
      <h3 className="font-display text-2xl tracking-tight text-ink">{title}</h3>
      <p className="mt-3 text-[0.92rem] leading-relaxed text-muted">{lede}</p>

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="eyebrow">Your name</span>
          <input
            name="name"
            autoComplete="name"
            placeholder="Alex Whitfield"
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
            placeholder="(352) 555-0100"
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
          <select name="home" defaultValue={defaultHome ?? ""} className={cx(field, "mt-2.5 cursor-pointer")}>
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
          <select name="slot" className={cx(field, "mt-2.5 cursor-pointer")}>
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
            placeholder="We have a half-acre outside Sisters and no idea whether it will perc."
            className={cx(field, "mt-2.5 resize-y")}
          />
        </label>

        <label className="flex cursor-pointer items-start gap-3 sm:col-span-2">
          <input
            name="callFirst"
            type="checkbox"
            className="mt-0.5 size-4 shrink-0 accent-[var(--ember)]"
          />
          <span className="text-[0.88rem] leading-relaxed text-muted">
            Call me before I drive out — I have questions that will save us both a trip.
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={state === "sending"}
        className={cx(buttonStyles.primary, "mt-7 w-full !py-4 text-base")}
      >
        {state === "sending" ? "Sending…" : "Request the walkthrough"}
        {state !== "sending" && (
          <Icon.Arrow className="size-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
        )}
      </button>

      <p className="mt-4 text-center text-xs text-muted">
        Demo form — submissions resolve locally and are never sent anywhere.
      </p>
    </form>
  );
}

"use client";

import { useMemo, useState } from "react";
import { monthlyPayment, money, moneyRounded } from "@/lib/format";
import { cx, Icon } from "./ui";

/**
 * One financing path: the buyer owns the ground, the home sits on a
 * permanent foundation and titles as real property, and a conventional, FHA
 * or VA lender writes a mortgage on the whole thing. The seed values are
 * NERTO's own — a $240,000 home on a $40,000 parcel at 3.5% with 3.5% down —
 * and every one of them is a slider.
 */
const LOAN = {
  rate: 3.5,
  term: 30,
  minDown: 3.5,
  note: "You own the ground and the home sits on a permanent foundation, so it titles as real property. Conventional, FHA and VA all lend here.",
};

function Field({
  label,
  value,
  children,
}: {
  label: string;
  value: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-4">
        <span className="eyebrow">{label}</span>
        <span className="font-mono text-sm text-ink">{value}</span>
      </span>
      <span className="mt-3 block">{children}</span>
    </label>
  );
}

export function PaymentCalculator({
  price: initialPrice,
  compact = false,
  editablePrice = false,
}: {
  price: number;
  compact?: boolean;
  /** Standing alone on /financing there is no listing to take a price from,
   *  so the visitor supplies one rather than the page inventing a figure. */
  editablePrice?: boolean;
}) {
  const [homePrice, setHomePrice] = useState(initialPrice);
  const price = editablePrice ? homePrice : initialPrice;

  const [downPct, setDownPct] = useState<number>(LOAN.minDown);
  const [rate, setRate] = useState<number>(LOAN.rate);
  const [term, setTerm] = useState<number>(LOAN.term);
  const [landCost, setLandCost] = useState(40000);
  const [taxRate, setTaxRate] = useState(0.9);
  const [insurance, setInsurance] = useState(95);

  const total = price + landCost;
  const down = Math.round((total * downPct) / 100);
  const principal = total - down;

  const pi = useMemo(() => monthlyPayment(principal, rate, term), [principal, rate, term]);
  const tax = (total * (taxRate / 100)) / 12;
  const monthly = pi + tax + insurance;
  const lifetimeInterest = pi * term * 12 - principal;

  const slices = [
    { label: "Principal & interest", value: pi, color: "var(--ember)" },
    { label: "Property tax", value: tax, color: "var(--moss)" },
    { label: "Insurance", value: insurance, color: "var(--sky)" },
  ].filter((s) => s.value > 0);

  return (
    <div
      className={cx(
        "rounded-card border border-line bg-surface",
        compact ? "p-6" : "p-6 sm:p-9",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h3 className="font-display text-2xl tracking-tight text-ink">
          What it actually costs a month
        </h3>
        <span className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted">
          Estimate
        </span>
      </div>

      <p className="mt-4 flex gap-2.5 text-[0.85rem] leading-relaxed text-muted">
        <Icon.Shield className="mt-0.5 size-4 shrink-0 text-ember" />
        {LOAN.note}
      </p>

      {/* Result */}
      <div className="mt-8 rounded-xl border border-line bg-paper p-6">
        <p className="eyebrow">Estimated monthly</p>
        <p className="mt-2 font-display text-5xl leading-none tracking-tight text-ink">
          {moneyRounded(monthly)}
          <span className="ml-2 font-sans text-base font-normal text-muted">/ mo</span>
        </p>

        <div className="mt-6 flex h-2.5 overflow-hidden rounded-full bg-surface-2">
          {slices.map((s) => (
            <span
              key={s.label}
              className="h-full"
              style={{ width: `${(s.value / monthly) * 100}%`, background: s.color }}
            />
          ))}
        </div>
        <dl className="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-3">
          {slices.map((s) => (
            <div key={s.label} className="flex items-center gap-2">
              <span className="size-2 shrink-0 rounded-full" style={{ background: s.color }} />
              <dt className="flex-1 text-[0.78rem] text-muted">{s.label}</dt>
              <dd className="font-mono text-[0.78rem] text-ink">{moneyRounded(s.value)}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Inputs */}
      <div className="mt-8 grid gap-7 sm:grid-cols-2">
        {editablePrice && (
          <Field label="Home and development price" value={money(price)}>
            <input
              type="range"
              min={40000}
              max={600000}
              step={2500}
              value={price}
              onChange={(e) => setHomePrice(Number(e.target.value))}
              className="w-full accent-[var(--ember)]"
            />
          </Field>
        )}

        <Field label="Down payment" value={`${downPct}% · ${money(down)}`}>
          <input
            type="range"
            min={LOAN.minDown}
            max={40}
            step={0.5}
            value={downPct}
            onChange={(e) => setDownPct(Number(e.target.value))}
            className="w-full accent-[var(--ember)]"
          />
        </Field>

        <Field label="Interest rate" value={`${rate.toFixed(2)}%`}>
          <input
            type="range"
            min={2}
            max={13}
            step={0.05}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="w-full accent-[var(--ember)]"
          />
        </Field>

        <Field label="Term" value={`${term} years`}>
          <div className="flex flex-wrap gap-2">
            {[15, 20, 30].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTerm(t)}
                aria-pressed={term === t}
                className={cx(
                  "rounded-full border px-3 py-1.5 text-[0.78rem] transition-colors",
                  term === t
                    ? "border-ink bg-ink text-paper"
                    : "border-line-strong text-ink-soft hover:border-ink",
                )}
              >
                {t} yr
              </button>
            ))}
          </div>
        </Field>

        <Field label="Land cost" value={money(landCost)}>
          <input
            type="range"
            min={0}
            max={250000}
            step={5000}
            value={landCost}
            onChange={(e) => setLandCost(Number(e.target.value))}
            className="w-full accent-[var(--ember)]"
          />
        </Field>
        <Field label="Property tax rate" value={`${taxRate.toFixed(2)}%`}>
          <input
            type="range"
            min={0}
            max={2.5}
            step={0.05}
            value={taxRate}
            onChange={(e) => setTaxRate(Number(e.target.value))}
            className="w-full accent-[var(--ember)]"
          />
        </Field>

        <Field label="Insurance" value={`${money(insurance)} / mo`}>
          <input
            type="range"
            min={0}
            max={400}
            step={5}
            value={insurance}
            onChange={(e) => setInsurance(Number(e.target.value))}
            className="w-full accent-[var(--ember)]"
          />
        </Field>
      </div>

      {/* Summary */}
      <dl className="mt-8 grid gap-x-8 gap-y-3 border-t border-line pt-6 sm:grid-cols-2">
        {[
          { k: "Home + land", v: money(total) },
          { k: "Amount financed", v: money(principal) },
          { k: "Interest over the term", v: money(Math.round(lifetimeInterest)) },
          { k: "Total of payments", v: money(Math.round(pi * term * 12 + down)) },
        ].map((r) => (
            <div key={r.k} className="flex items-baseline justify-between gap-4">
              <dt className="text-sm text-muted">{r.k}</dt>
              <dd className="font-mono text-sm text-ink">{r.v}</dd>
            </div>
          ))}
      </dl>

      <p className="mt-6 text-xs leading-relaxed text-muted">
        Illustrative only. Rates move, and your actual terms depend on credit, the
        parcel and the lender. We will put a real lender quote in front of you before
        you sign anything.
      </p>
    </div>
  );
}

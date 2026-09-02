"use client";

import { useMemo, useState } from "react";
import { monthlyPayment, money, moneyRounded } from "@/lib/format";
import { cx, Icon } from "./ui";

/**
 * Two financing paths matter for a manufactured home, and they price very
 * differently. The calculator makes that difference the headline rather
 * than burying it in a footnote.
 */
const LOAN_TYPES = [
  {
    id: "land-home",
    label: "Land + home",
    rate: 6.65,
    term: 30,
    minDown: 5,
    note: "You own the ground and the home sits on a permanent foundation, so it titles as real property. Conventional, FHA, VA and USDA all lend here.",
  },
  {
    id: "chattel",
    label: "Home only (chattel)",
    rate: 8.95,
    term: 23,
    minDown: 5,
    note: "The home sits on a leased pad and is titled like a vehicle. Faster to close, shorter term, and roughly two points more expensive over the life of the loan.",
  },
] as const;

type LoanId = (typeof LOAN_TYPES)[number]["id"];

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
  const [loanId, setLoanId] = useState<LoanId>("land-home");
  const loan = LOAN_TYPES.find((l) => l.id === loanId)!;

  const [downPct, setDownPct] = useState(10);
  const [rate, setRate] = useState<number>(loan.rate);
  const [term, setTerm] = useState<number>(loan.term);
  const [landCost, setLandCost] = useState(65000);
  const [lotRent, setLotRent] = useState(725);
  const [taxRate, setTaxRate] = useState(0.9);
  const [insurance, setInsurance] = useState(95);

  function pickLoan(id: LoanId) {
    const next = LOAN_TYPES.find((l) => l.id === id)!;
    setLoanId(id);
    setRate(next.rate);
    setTerm(next.term);
  }

  const isLandHome = loanId === "land-home";
  const total = price + (isLandHome ? landCost : 0);
  const down = Math.round((total * downPct) / 100);
  const principal = total - down;

  const pi = useMemo(() => monthlyPayment(principal, rate, term), [principal, rate, term]);
  const tax = isLandHome ? (total * (taxRate / 100)) / 12 : 0;
  const rent = isLandHome ? 0 : lotRent;
  const monthly = pi + tax + insurance + rent;
  const lifetimeInterest = pi * term * 12 - principal;

  const slices = [
    { label: "Principal & interest", value: pi, color: "var(--ember)" },
    { label: isLandHome ? "Property tax" : "Lot rent", value: isLandHome ? tax : rent, color: "var(--moss)" },
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

      {/* Loan type — the decision that matters most */}
      <div className="mt-6 grid gap-2 sm:grid-cols-2">
        {LOAN_TYPES.map((l) => (
          <button
            key={l.id}
            type="button"
            onClick={() => pickLoan(l.id)}
            aria-pressed={loanId === l.id}
            className={cx(
              "rounded-xl border px-4 py-3 text-left transition-all duration-300",
              loanId === l.id
                ? "border-ink bg-ink text-paper"
                : "border-line-strong text-ink-soft hover:border-ink",
            )}
          >
            <span className="block text-sm font-medium">{l.label}</span>
            <span
              className={cx(
                "mt-0.5 block font-mono text-[0.7rem]",
                loanId === l.id ? "opacity-70" : "text-muted",
              )}
            >
              ~{l.rate}% · {l.term} yr
            </span>
          </button>
        ))}
      </div>

      <p className="mt-4 flex gap-2.5 text-[0.85rem] leading-relaxed text-muted">
        <Icon.Shield className="mt-0.5 size-4 shrink-0 text-ember" />
        {loan.note}
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
          <Field label="Home price" value={money(price)}>
            <input
              type="range"
              min={40000}
              max={300000}
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
            min={loan.minDown}
            max={40}
            step={1}
            value={downPct}
            onChange={(e) => setDownPct(Number(e.target.value))}
            className="w-full accent-[var(--ember)]"
          />
        </Field>

        <Field label="Interest rate" value={`${rate.toFixed(2)}%`}>
          <input
            type="range"
            min={4}
            max={13}
            step={0.05}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="w-full accent-[var(--ember)]"
          />
        </Field>

        <Field label="Term" value={`${term} years`}>
          <div className="flex flex-wrap gap-2">
            {[15, 20, 23, 30].map((t) => (
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

        {isLandHome ? (
          <>
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
          </>
        ) : (
          <Field label="Lot rent" value={`${money(lotRent)} / mo`}>
            <input
              type="range"
              min={0}
              max={1600}
              step={5}
              value={lotRent}
              onChange={(e) => setLotRent(Number(e.target.value))}
              className="w-full accent-[var(--ember)]"
            />
          </Field>
        )}

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
          { k: isLandHome ? "Home + land" : "Home price", v: money(total) },
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
        community, and whether the home titles as real or personal property. We will
        put a real lender quote in front of you before you sign anything.
      </p>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ListingCard } from "./listing-card";
import { buttonStyles, Icon } from "./ui";
import { listings, sectionLabels, type Listing } from "@/lib/homes";
import { money } from "@/lib/format";
import { site } from "@/lib/site";

/**
 * The Build-A-Home wizard behind `/new-home`.
 *
 * It asks the four questions that actually narrow twenty plans down to three
 * — how many bedrooms, how wide the ground will take, what the money looks
 * like, and where the home is going — and then shows the matches. Nothing is
 * submitted anywhere: the answers filter the catalogue in the browser and the
 * last step hands the visitor to `/contact` with the plan already chosen.
 *
 * Wire the final step to a Server Action or your CRM when you deploy, the
 * same way `components/inquiry-form.tsx` is meant to be wired.
 */

type Answers = {
  beds: string;
  sections: string;
  budget: string;
  land: string;
};

const QUESTIONS: {
  key: keyof Answers;
  label: string;
  help: string;
  options: { value: string; label: string; note?: string }[];
}[] = [
  {
    key: "beds",
    label: "How many bedrooms do you need?",
    help: "Count the ones you will actually use. An office is a bedroom on the floor plan and on the appraisal.",
    options: [
      { value: "1", label: "One or two", note: "Singles, couples, a first home" },
      { value: "3", label: "Three", note: "The most common answer by a distance" },
      { value: "4", label: "Four or more", note: "Bigger families, multi-generational" },
      { value: "", label: "Not sure yet" },
    ],
  },
  {
    key: "sections",
    label: "How wide can the ground take?",
    help: "A single section fits down a tight drive. A double needs room for two loads and a crane-free set.",
    options: [
      { value: "single", label: "Single-section", note: "One load, tightest access" },
      { value: "double", label: "Double-section", note: "Two loads, joined on site" },
      { value: "triple", label: "Triple-section", note: "Widest footprint we set" },
      { value: "", label: "No idea — tell me" },
    ],
  },
  {
    key: "budget",
    label: "What are you working with?",
    help: "Price of the home only. Land, site work and utilities are quoted separately, and we will not pretend otherwise.",
    options: [
      { value: "80000", label: `Under ${money(80000)}` },
      { value: "140000", label: `Up to ${money(140000)}` },
      { value: "220000", label: `Up to ${money(220000)}` },
      { value: "", label: "Show me everything" },
    ],
  },
  {
    key: "land",
    label: "Where is it going?",
    help: "This is the question that decides whether your home appreciates, so it is the one we ask before anything else in person too.",
    options: [
      { value: "own", label: "On land I own" },
      { value: "buying", label: "On land I still need to buy" },
      { value: "community", label: "In a community, on a leased pad" },
      { value: "", label: "Still working that out" },
    ],
  },
];

function matches(answers: Answers): Listing[] {
  return listings.filter((l) => {
    if (l.status === "sold") return false;
    if (answers.beds === "1" && l.beds > 2) return false;
    if (answers.beds === "3" && l.beds !== 3) return false;
    if (answers.beds === "4" && l.beds < 4) return false;
    if (answers.sections && l.sections !== answers.sections) return false;
    if (answers.budget && l.price !== undefined && l.price > Number(answers.budget)) return false;
    return true;
  });
}

const EMPTY: Answers = { beds: "", sections: "", budget: "", land: "" };

export function HomeFinder() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(EMPTY);

  const done = step >= QUESTIONS.length;
  const results = useMemo(() => (done ? matches(answers) : []), [done, answers]);
  const progress = Math.round((Math.min(step, QUESTIONS.length) / QUESTIONS.length) * 100);

  function choose(key: keyof Answers, value: string) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    setStep((s) => s + 1);
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-16 sm:py-24">
      <div className="flex items-center justify-between gap-6">
        <Link href="/" className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted transition-colors hover:text-ink">
          {site.short}
        </Link>
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted">
          {done ? "Done" : `Step ${step + 1} of ${QUESTIONS.length}`}
        </p>
      </div>

      <div className="mt-5 h-px w-full bg-line">
        <div
          className="h-px bg-ember transition-all duration-500"
          style={{ width: `${done ? 100 : progress}%` }}
        />
      </div>

      {!done ? (
        <div className="mt-14">
          <h1 className="font-display text-[clamp(1.8rem,5vw,3rem)] leading-[1.1] tracking-tight text-ink">
            {QUESTIONS[step].label}
          </h1>
          <p className="mt-5 max-w-xl leading-relaxed text-muted">{QUESTIONS[step].help}</p>

          <div className="mt-10 grid gap-px overflow-hidden rounded-2xl bg-line">
            {QUESTIONS[step].options.map((option) => (
              <button
                key={option.label}
                type="button"
                onClick={() => choose(QUESTIONS[step].key, option.value)}
                className="group flex items-center justify-between gap-6 bg-paper p-6 text-left transition-colors hover:bg-surface"
              >
                <span>
                  <span className="block font-display text-xl tracking-tight text-ink transition-colors group-hover:text-ember">
                    {option.label}
                  </span>
                  {option.note && (
                    <span className="mt-1 block text-sm text-muted">{option.note}</span>
                  )}
                </span>
                <Icon.Arrow className="size-5 shrink-0 text-muted transition-transform duration-300 group-hover:translate-x-1 group-hover:text-ember" />
              </button>
            ))}
          </div>

          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="mt-8 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted transition-colors hover:text-ink"
            >
              ← Back
            </button>
          )}
        </div>
      ) : (
        <div className="mt-14">
          <h1 className="font-display text-[clamp(1.8rem,5vw,3rem)] leading-[1.1] tracking-tight text-ink">
            {results.length === 0
              ? "Nothing on the lot matches that."
              : `${results.length} ${results.length === 1 ? "plan fits" : "plans fit"}.`}
          </h1>
          <p className="mt-5 max-w-xl leading-relaxed text-muted">
            {results.length === 0
              ? "Which happens, and usually means the answer is a plan we order rather than one standing here. Tell us the constraint and we will find it."
              : "Walk them back to back in an afternoon. Nothing below is a stock photograph of a home we do not have."}
          </p>

          <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-3 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted">
            {answers.beds && <div><dt className="inline">Beds </dt><dd className="inline text-ink">{answers.beds === "1" ? "1–2" : answers.beds === "4" ? "4+" : answers.beds}</dd></div>}
            {answers.sections && <div><dt className="inline">Width </dt><dd className="inline text-ink">{sectionLabels[answers.sections as keyof typeof sectionLabels]}</dd></div>}
            {answers.budget && <div><dt className="inline">Budget </dt><dd className="inline text-ink">under {money(Number(answers.budget))}</dd></div>}
            {answers.land && <div><dt className="inline">Ground </dt><dd className="inline text-ink">{answers.land === "own" ? "Owned" : answers.land === "buying" ? "Buying" : "Community"}</dd></div>}
          </dl>

          {results.length > 0 && (
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {results.slice(0, 6).map((listing) => (
                <ListingCard key={listing.slug} listing={listing} className="h-full" />
              ))}
            </div>
          )}

          <div className="mt-12 flex flex-wrap gap-3">
            <Link href="/contact" className={buttonStyles.primary}>
              Book a walkthrough
              <Icon.Arrow className="size-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
            </Link>
            <Link href="/listings" className={buttonStyles.outline}>
              Browse everything
            </Link>
            <button
              type="button"
              onClick={() => {
                setAnswers(EMPTY);
                setStep(0);
              }}
              className={buttonStyles.outline}
            >
              Start over
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

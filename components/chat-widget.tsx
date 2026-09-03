"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { usePathname } from "next/navigation";
import { attribution } from "@/lib/attribution";
import {
  CHAT_DONE,
  CHAT_FAILED,
  CHAT_GREETING,
  CHAT_LABELS,
  CHAT_SCRIPT,
  type ChatChoice,
} from "@/lib/chat";
import { site } from "@/lib/site";
import { useSavedHomes } from "./saved-homes";
import { cx, Icon } from "./ui";

/* Routes that own the whole screen — the same two the floating call button
   stays off, for the same reason: a visitor part-way through a long form does
   not need a second one climbing over it. */
const HIDDEN_ON = ["/new-home", "/prequalify"];

/** Where the thread is kept, so navigating the site does not restart it. */
const STORE_KEY = "nerto:chat";

type Turn = { from: "us" | "them"; text: string };

type Answers = {
  topic?: string;
  landStatus?: string;
  name?: string;
  phone?: string;
  email?: string;
  notes?: string;
};

type Saved = { step: number; turns: Turn[]; answers: Answers; status: Status };
type Status = "asking" | "sending" | "done" | "failed";

const digits = (s: string) => s.replace(/\D/g, "");
const firstName = (name?: string) => (name ?? "").trim().split(/\s+/)[0] ?? "";
const fill = (text: string, answers: Answers) =>
  text.replace("{first}", firstName(answers.name) || "there");

/**
 * The chat widget: a guided intake in a chat's clothes.
 *
 * It asks the five things a callback actually needs and posts them to
 * `/api/chat`, which upserts the contact into GoHighLevel with the transcript
 * and the attribution attached. Everything it says is data — `lib/chat.ts` —
 * so the script can be rewritten without coming in here.
 *
 * Two things it deliberately is not. It is not an AI, and it says so in its
 * first message rather than letting somebody find out after typing a
 * question about their credit. And it is not a widget from somebody else's
 * CDN: no third-party script, no cookie, no iframe, nothing loaded at render
 * time — which is why it matches the site instead of arriving in its own
 * typeface, and why it costs nothing to a visitor who never opens it.
 *
 * It posts twice. The moment a name and a number exist the lead goes,
 * because somebody who answers two questions and closes the tab is a lead
 * and losing them is the expensive mistake. The rest of the conversation
 * follows at the end and updates the same contact.
 */
export function ChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [answers, setAnswers] = useState<Answers>({});
  const [status, setStatus] = useState<Status>("asking");
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | undefined>();

  /* The shortlist, read through a ref so the sender is not rebuilt every
     time somebody hearts a home in another tab. */
  const { saved } = useSavedHomes();
  const savedRef = useRef<string[]>(saved);
  useEffect(() => {
    savedRef.current = saved;
  }, [saved]);

  const threadRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  /* Whether the half-finished lead has already been sent, so the second post
     updates rather than duplicating the work, and whether it actually landed
     — which decides if the closing post has to tag the contact or whether the
     opening one already did. */
  const partialSent = useRef(false);
  const partialLanded = useRef(false);

  const current = CHAT_SCRIPT[step];

  /* ---- Remembering the thread across pages --------------------------- */

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(STORE_KEY);
      if (!raw) return;
      const stored = JSON.parse(raw) as Saved;
      if (!Array.isArray(stored.turns)) return;
      setStep(Math.min(stored.step ?? 0, CHAT_SCRIPT.length));
      setTurns(stored.turns);
      setAnswers(stored.answers ?? {});
      setStatus(stored.status ?? "asking");
      if (stored.answers?.phone) {
        partialSent.current = true;
        partialLanded.current = true;
      }
    } catch {
      /* A blocked store just means the thread starts fresh. */
    }
  }, []);

  useEffect(() => {
    if (turns.length === 0) return;
    try {
      window.sessionStorage.setItem(
        STORE_KEY,
        JSON.stringify({ step, turns, answers, status } satisfies Saved),
      );
    } catch {
      /* Nothing to do; the thread simply won't survive the next page. */
    }
  }, [step, turns, answers, status]);

  /* ---- Housekeeping while it is open --------------------------------- */

  useEffect(() => {
    if (!open) return;
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: "smooth" });
    if (current?.kind !== "choice") inputRef.current?.focus();
  }, [open, turns, step, current?.kind]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  /* ---- Sending ------------------------------------------------------- */

  const send = useCallback(
    async (next: Answers, transcript: Turn[], final: boolean) => {
      const body = {
        name: next.name,
        phone: next.phone,
        email: next.email,
        topic: next.topic,
        landStatus: next.landStatus,
        notes: next.notes,
        transcript: transcript.map((t) => `${t.from === "us" ? "NERTO" : "Them"}: ${t.text}`).join("\n"),
        savedHomes: savedRef.current.slice(0, 30).join(","),
        attribution: attribution(),
        /* One conversation is one inbound. If the opening post already
           landed, it tagged them, and the closing post leaves the tag alone
           rather than firing the CRM's automation a second time. */
        retag: !partialLanded.current,
      };
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error(`chat responded ${res.status}`);
        if (!final) partialLanded.current = true;
        return true;
      } catch (err) {
        /* The half-way post is allowed to fail quietly — it is a bonus, and
           the visitor is still mid-conversation. The final one is not. */
        if (!final) console.warn("[chat] partial send failed", err);
        return false;
      }
    },
    [],
  );

  /* ---- Answering ----------------------------------------------------- */

  const advance = useCallback(
    async (said: string, patch: Answers, reply?: string) => {
      const nextAnswers = { ...answers, ...patch };
      const nextTurns: Turn[] = [...turns, { from: "them", text: said }];
      if (reply) nextTurns.push({ from: "us", text: reply });

      setAnswers(nextAnswers);
      setDraft("");
      setError(undefined);

      const nextStep = step + 1;
      const finished = nextStep >= CHAT_SCRIPT.length;

      if (!finished) {
        const asking = CHAT_SCRIPT[nextStep];
        nextTurns.push({ from: "us", text: fill(asking.prompt, nextAnswers) });
        setTurns(nextTurns);
        setStep(nextStep);

        /* The lead exists as soon as there is a name and a number. Fire and
           forget: the visitor keeps answering while it goes. */
        if (!partialSent.current && nextAnswers.name && digits(nextAnswers.phone ?? "").length >= 10) {
          partialSent.current = true;
          void send(nextAnswers, nextTurns, false);
        }
        return;
      }

      setTurns(nextTurns);
      setStep(nextStep);
      setStatus("sending");
      const ok = await send(nextAnswers, nextTurns, true);
      setStatus(ok ? "done" : "failed");
    },
    [answers, send, step, turns],
  );

  function onChoice(choice: ChatChoice) {
    void advance(choice.label, { topic: choice.label, ...(choice.sets ?? {}) }, choice.reply);
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!current) return;
    const value = draft.trim();

    if (current.kind === "phone" && digits(value).length < 10) {
      setError(current.invalid);
      return;
    }
    if (current.kind === "email" && value && !/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(value)) {
      setError(current.invalid);
      return;
    }
    if (current.id === "name" && value.length < 2) {
      setError(current.invalid);
      return;
    }
    if (!value && !current.skipLabel) {
      setError(current.invalid);
      return;
    }

    void advance(value || "—", { [current.id]: value } as Answers);
  }

  function skip() {
    if (!current) return;
    void advance(current.skipLabel ?? "Skip", {});
  }

  function restart() {
    partialSent.current = false;
    partialLanded.current = false;
    setStep(0);
    setAnswers({});
    setStatus("asking");
    setDraft("");
    setError(undefined);
    setTurns([]);
    try {
      window.sessionStorage.removeItem(STORE_KEY);
    } catch {
      /* Nothing to clear. */
    }
    openThread(true);
  }

  /** Opening seeds the greeting and the first question, once. */
  const openThread = useCallback((force = false) => {
    setOpen(true);
    setTurns((existing) => {
      if (existing.length && !force) return existing;
      return [
        ...CHAT_GREETING.map((text) => ({ from: "us" as const, text })),
        { from: "us" as const, text: CHAT_SCRIPT[0].prompt },
      ];
    });
  }, []);

  if (HIDDEN_ON.some((r) => pathname === r || pathname.startsWith(`${r}/`))) return null;

  const bubble =
    "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[0.9rem] leading-relaxed";

  return (
    <>
      {/* The launcher. It sits above the call button, which stays the louder
          of the two — a phone call is worth more than a form. */}
      {!open && (
        <button
          type="button"
          onClick={() => openThread()}
          aria-label={CHAT_LABELS.open}
          className="group fixed bottom-24 right-6 z-40 flex items-center gap-2 rounded-full border border-line-strong bg-surface px-4 py-3 text-[0.85rem] font-medium text-ink shadow-xl transition-transform duration-300 hover:scale-105"
        >
          <Icon.Chat className="size-5 shrink-0 text-ember" />
          <span className="hidden sm:inline">{CHAT_LABELS.bubble}</span>
        </button>
      )}

      {open && (
        <div
          role="dialog"
          aria-label={CHAT_LABELS.title}
          aria-modal="false"
          className="fixed bottom-6 right-4 z-50 flex h-[min(34rem,calc(100dvh-6rem))] w-[min(23rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-card border border-line bg-paper shadow-2xl sm:right-6"
        >
          <header className="flex items-start justify-between gap-3 border-b border-line bg-surface px-4 py-3">
            <div>
              <p className="text-[0.95rem] font-semibold text-ink">{CHAT_LABELS.title}</p>
              <p className="text-xs text-muted">{CHAT_LABELS.subtitle}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={CHAT_LABELS.close}
              className="-mr-1 grid size-8 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-ink"
            >
              <Icon.Close className="size-4" />
            </button>
          </header>

          <div
            ref={threadRef}
            aria-live="polite"
            className="flex-1 space-y-2.5 overflow-y-auto px-4 py-4"
          >
            {turns.map((turn, i) => (
              <div
                key={i}
                className={cx("flex", turn.from === "them" ? "justify-end" : "justify-start")}
              >
                <p
                  className={cx(
                    bubble,
                    turn.from === "them"
                      ? "bg-[image:var(--gradient)] text-white"
                      : "bg-surface-2 text-ink",
                  )}
                >
                  {turn.text}
                </p>
              </div>
            ))}

            {status === "sending" && (
              <p className={cx(bubble, "bg-surface-2 text-muted")}>Sending…</p>
            )}

            {status === "done" && (
              <div className="rounded-2xl border border-line bg-surface p-4">
                <p className="flex items-center gap-2 text-[0.95rem] font-semibold text-ink">
                  <Icon.Check className="size-4 text-moss" />
                  {fill(CHAT_DONE.headline, answers)}
                </p>
                <p className="mt-2 text-[0.85rem] leading-relaxed text-muted">
                  {CHAT_DONE.body}
                </p>
                <p className="mt-3 text-xs text-muted">{site.hours}</p>
              </div>
            )}

            {status === "failed" && (
              <div className="rounded-2xl border border-ember bg-surface p-4">
                <p className="text-[0.95rem] font-semibold text-ink">{CHAT_FAILED.headline}</p>
                <p className="mt-2 text-[0.85rem] leading-relaxed text-muted">
                  {CHAT_FAILED.body}
                </p>
              </div>
            )}
          </div>

          <footer className="border-t border-line bg-surface px-3 py-3">
            {status === "asking" && current?.kind === "choice" && (
              <div className="flex flex-wrap gap-2">
                {current.choices?.map((choice) => (
                  <button
                    key={choice.label}
                    type="button"
                    onClick={() => onChoice(choice)}
                    className="rounded-full border border-line-strong px-3 py-2 text-[0.82rem] text-ink transition-colors hover:border-ink hover:bg-ink hover:text-paper"
                  >
                    {choice.label}
                  </button>
                ))}
              </div>
            )}

            {status === "asking" && current && current.kind !== "choice" && (
              <form onSubmit={onSubmit} className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    type={current.kind === "phone" ? "tel" : current.kind === "email" ? "email" : "text"}
                    inputMode={current.kind === "phone" ? "tel" : undefined}
                    autoComplete={
                      current.id === "name"
                        ? "name"
                        : current.kind === "phone"
                          ? "tel"
                          : current.kind === "email"
                            ? "email"
                            : "off"
                    }
                    placeholder={current.placeholder}
                    aria-label={fill(current.prompt, answers)}
                    aria-invalid={!!error}
                    className="w-full rounded-full border border-line-strong bg-paper px-4 py-2.5 text-[0.9rem] text-ink placeholder:text-muted focus:border-ink focus:outline-none"
                  />
                  <button
                    type="submit"
                    aria-label={CHAT_LABELS.send}
                    className="grid size-10 shrink-0 place-items-center rounded-full bg-[image:var(--gradient)] text-white transition-transform hover:scale-105"
                  >
                    <Icon.Send className="size-4" />
                  </button>
                </div>
                {error && <p className="px-2 text-xs text-ember">{error}</p>}
                {current.skipLabel && (
                  <button
                    type="button"
                    onClick={skip}
                    className="self-start px-2 text-xs text-muted underline underline-offset-4 hover:text-ink"
                  >
                    {current.skipLabel}
                  </button>
                )}
              </form>
            )}

            {(status === "done" || status === "failed") && (
              <div className="flex items-center justify-between gap-3">
                <a
                  href={site.phoneHref}
                  className="flex items-center gap-2 text-[0.85rem] font-medium text-ink"
                >
                  <Icon.Phone className="size-4 text-ember" />
                  {site.phone}
                </a>
                <button
                  type="button"
                  onClick={restart}
                  className="text-xs text-muted underline underline-offset-4 hover:text-ink"
                >
                  {CHAT_LABELS.restart}
                </button>
              </div>
            )}
          </footer>
        </div>
      )}
    </>
  );
}

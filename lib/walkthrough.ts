/**
 * The walkthrough request's action state — the counterpart to
 * `lib/land/lead.ts`, for `components/inquiry-form.tsx`.
 *
 * It lives outside the `"use server"` module for the same reason that one
 * does: such a module may only export async functions, so the initial-state
 * constant cannot live there.
 */
export const WALKTHROUGH_FIELDS = [
  "name",
  "email",
  "phone",
  "home",
  "date",
  "slot",
  "message",
] as const;

export type WalkthroughField = (typeof WALKTHROUGH_FIELDS)[number];

export type WalkthroughState = {
  status: "idle" | "ok" | "error";
  message: string;
  fieldErrors?: Partial<Record<WalkthroughField, string>>;
  /** Echoed back so a rejected submission does not wipe what was typed. */
  values?: Partial<Record<WalkthroughField, string>>;
  /** Whether "call me first" was ticked, for the same reason. */
  callFirst?: boolean;
};

export const EMPTY_WALKTHROUGH_STATE: WalkthroughState = { status: "idle", message: "" };

/** The four windows the lot offers. Shared with the CRM's dropdown. */
export const TIME_SLOTS = [
  "Morning (9–12)",
  "Midday (12–3)",
  "Afternoon (3–6)",
  "Weekend only",
] as const;

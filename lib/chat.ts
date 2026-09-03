/**
 * The chat widget's script.
 *
 * This is a **guided intake**, not a robot pretending to be a person and not
 * an AI. It asks the four things a callback needs — what they want, their
 * name, a number, and anything else — and says so. Nothing on this site
 * should imply a human is typing when one is not, and nothing here answers a
 * question about price, credit or delivery on the business's behalf.
 *
 * Everything the widget says lives here, in order, so the script can be
 * rewritten without touching `components/chat-widget.tsx`. A step is one
 * question; a `choice` step is a row of buttons, the rest are a text box.
 *
 * The lead reaches GoHighLevel through `app/api/chat/route.ts` — the same
 * `submitLead` path the forms use — and lands as a contact tagged
 * `website-chat-widget` with the whole transcript on it.
 */

export type ChatChoice = {
  label: string;
  /** What the CRM should learn from this answer, if anything. */
  sets?: { landStatus?: string };
  /** What the widget says back before moving on. */
  reply?: string;
};

export type ChatStep = {
  id: "topic" | "name" | "phone" | "email" | "notes";
  /** What the widget asks. `{first}` is replaced with their first name. */
  prompt: string;
  kind: "choice" | "text" | "phone" | "email";
  /** Choice steps only. */
  choices?: ChatChoice[];
  /** Optional steps show a way past them. */
  skipLabel?: string;
  placeholder?: string;
  /** Shown under the box when the answer does not pass. */
  invalid?: string;
};

/** The first thing on screen when the panel opens. */
export const CHAT_GREETING = [
  "Hi — you're through to the lot on River Road.",
  "This is a short form wearing a chat's clothes: four questions, then a real person calls you back. Nobody is typing at the other end right now.",
];

/** The label on the bubble, and the heading in the panel. */
export const CHAT_LABELS = {
  bubble: "Chat with us",
  title: "Ask about a home",
  /** Under the title. Kept honest about what this is. */
  subtitle: "Four questions, then a callback",
  /** The button that opens it, for screen readers. */
  open: "Open the chat",
  close: "Close the chat",
  send: "Send",
  restart: "Start again",
};

export const CHAT_SCRIPT: ChatStep[] = [
  {
    id: "topic",
    prompt: "What brings you in?",
    kind: "choice",
    choices: [
      {
        label: "I want to see a home",
        reply: "Four homes are standing on the lot, and everything else in the catalogue we can order in.",
      },
      {
        label: "Financing and rent to own",
        reply: "That's the conversation we have most days, and it goes better on the phone than in a chat window.",
      },
      {
        label: "I already own land",
        sets: { landStatus: "own" },
        reply: "Good — that changes the whole plan, and usually for the better.",
      },
      {
        label: "I need land as well",
        sets: { landStatus: "looking" },
        reply: "Then we'll talk about ground first and the house second. That order matters.",
      },
      { label: "Something else", reply: "Tell us on the call — we'll come to it." },
    ],
  },
  {
    id: "name",
    prompt: "Who are we speaking to?",
    kind: "text",
    placeholder: "Your name",
    invalid: "A name, so we know who to ask for.",
  },
  {
    id: "phone",
    prompt: "Thanks, {first}. What's the best number to reach you on?",
    kind: "phone",
    placeholder: "(207) 555-0100",
    invalid: "Ten digits, please — that's the number we call.",
  },
  {
    id: "email",
    prompt: "An email too, if you'd rather have it in writing?",
    kind: "email",
    placeholder: "you@example.com",
    skipLabel: "Skip",
    invalid: "That email doesn't look right — or skip it.",
  },
  {
    id: "notes",
    prompt: "Anything we should know before we call?",
    kind: "text",
    placeholder: "Bedrooms, budget, a parcel you're looking at…",
    skipLabel: "Nothing to add",
  },
];

/** What it says once the lead has landed. `{first}` is replaced. */
export const CHAT_DONE = {
  headline: "Got it, {first}.",
  body: "Somebody from the lot will call you back — same day during opening hours. If you'd rather not wait, the number below rings the same phone.",
};

/** What it says when the lead did not land. Honest, and gives them the phone. */
export const CHAT_FAILED = {
  headline: "That didn't send.",
  body: "Something broke on our end rather than yours. Call or text us and we'll pick it up from there.",
};

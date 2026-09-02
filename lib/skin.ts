/**
 * Skins — the whole palette, the typeface pairing and the corner radii, as
 * data, so one template can wear more than one look.
 *
 * `app/globals.css` still holds the token *structure*: which custom
 * properties exist, how Tailwind maps them, and the Hearthline values as the
 * built-in fallback. What this file does is let a deployment swap every one
 * of those values at once. `app/layout.tsx` reads `activeSkin` and emits the
 * chosen skin's tokens into the document head, light and dark together.
 *
 * That is the same idea Mobile Home Manager uses to dress one codebase as
 * many dealerships. The difference is that this is a static template, so the
 * skin is picked at build time in this file rather than per request from a
 * database.
 *
 * To add a skin: copy a block below, change the values, add its id to
 * `SkinId`, and point `activeSkin` at it. To restyle a single deployment
 * without adding a skin, edit `:root` and `.dark` in `app/globals.css` — the
 * skin only overrides what it names, so both approaches work.
 *
 * Typefaces are the one thing that cannot be fully data-driven: `next/font`
 * has to see its calls literally to self-host the files at build time. So the
 * families are loaded in `app/layout.tsx` and a skin picks between them by
 * name here.
 */

export type SkinId = "hearthline" | "nerto";

/**
 * Font stacks a skin can choose between. All but `system` are self-hosted by
 * `next/font` in `app/layout.tsx`; `system` downloads nothing and renders in
 * whatever the reader's device calls its interface face, which is what a site
 * built to load instantly on a phone on a rural connection actually wants.
 */
export type FontChoice =
  | "display-serif"
  | "ui-sans"
  | "grotesk"
  | "mono"
  | "system";

export type SkinPalette = {
  /** Page background. */
  paper: string;
  /** Raised panel — cards, banded sections. */
  surface: string;
  /** Second raised step — inset wells, icon plates. */
  surface2: string;
  /** Body text. */
  ink: string;
  /** Slightly recessed body text. */
  inkSoft: string;
  /** Captions, labels, anything secondary. */
  muted: string;
  /** Hairlines and card borders. */
  line: string;
  /** Emphasised borders and form-field outlines. */
  lineStrong: string;
  /** The accent: primary buttons, links, section numbers, focus rings. */
  ember: string;
  /** A lighter accent for hover states and decoration. */
  emberSoft: string;
  /** The palest wash of the accent — tinted panels, selected chips. */
  emberWash: string;
  /** The second brand colour. Paired with `ember` in `gradient` below. */
  accent: string;
  accentSoft: string;
  /** The secondary colour — confirmations, "available" badges. */
  moss: string;
  mossSoft: string;
  /** Informational. */
  sky: string;
  /** Warnings, prices on the land map, highlights. */
  gold: string;
  /** Text drawn on top of `ember`. Must clear 4.5:1 against it. */
  onEmber: string;
  /** Shadow colour as space-separated RGB, e.g. "15 23 42". */
  shadowColor: string;
};

/**
 * The two-stop brand gradient, and the shadows cast by the things wearing it.
 *
 * A flat primary and a gradient primary are different design languages, not
 * different values of one, which is why this is its own optional block: a
 * skin that omits it gets flat `ember` everywhere and nothing to maintain.
 * `gradient` is a full CSS value, so a skin can use three stops or a
 * different angle without the type changing.
 */
export type SkinGradient = {
  gradient: string;
  gradientHover: string;
  /** Cast by primary buttons. Usually the accent at 40%. */
  buttonShadow: string;
  /** Cast by raised cards. */
  cardShadow: string;
};

/**
 * The primary button's colours. Optional: a skin that omits this gets the
 * default behaviour, which is ink that turns `ember` on hover.
 *
 * It is a separate knob because "which colour is the button" is not something
 * the palette can answer on its own. Hearthline makes it near-black so the
 * one ember accent on the page stays the eyebrow; a conversion-shaped skin
 * wants the button to be the loudest thing in the viewport.
 */
export type SkinButton = {
  bg: string;
  fg: string;
  hoverBg: string;
  hoverFg: string;
};

/** The `/land-deals` map. Optional: a skin that omits it keeps the defaults. */
export type SkinLandPalette = Partial<{
  water: string;
  unserved: string;
  outside: string;
  overBudget: string;
  stroke: string;
  price: string;
  tier1: string;
  tier2: string;
  tier3: string;
  tier4: string;
  tier5: string;
}>;

export type Skin = {
  id: SkinId;
  name: string;
  /** One line on what this skin is for. */
  description: string;
  light: SkinPalette;
  dark: SkinPalette;
  landLight?: SkinLandPalette;
  landDark?: SkinLandPalette;
  button?: SkinButton;
  buttonDark?: SkinButton;
  gradient?: SkinGradient;
  gradientDark?: SkinGradient;
  fonts: {
    /** Headlines. */
    display: FontChoice;
    /** Body and UI. */
    sans: FontChoice;
    /** Eyebrows, specs, prices. */
    mono: FontChoice;
  };
  radius: {
    /** Buttons and pills. `9999px` for a full pill. Read as `rounded-button`. */
    button: string;
    /** Cards, panels, form fields. Read as `rounded-card`. */
    card: string;
  };
};

export const skins: Record<SkinId, Skin> = {
  /**
   * The template's own look: limestone paper, ink, ember and deep moss, set
   * in a serif with a lot of air. Editorial rather than transactional — it
   * reads like a magazine feature about a house.
   */
  hearthline: {
    id: "hearthline",
    name: "Hearthline",
    description:
      "Warm and editorial. A serif display face on limestone paper, with ember and moss. Reads as considered rather than urgent.",
    light: {
      paper: "#f7f4ef",
      surface: "#fffdfa",
      surface2: "#f0ebe3",
      ink: "#17140f",
      inkSoft: "#3b342c",
      muted: "#6d6459",
      line: "#e0d8cc",
      lineStrong: "#cabfae",
      ember: "#b8461c",
      emberSoft: "#e07a45",
      emberWash: "#f8ece5",
      accent: "#b58436",
      accentSoft: "#d0a45c",
      moss: "#2f4a3c",
      mossSoft: "#5d8a71",
      sky: "#2b5f7e",
      gold: "#b58436",
      onEmber: "#fffaf6",
      shadowColor: "28 22 16",
    },
    dark: {
      paper: "#100e0c",
      surface: "#191613",
      surface2: "#221e19",
      ink: "#f4efe7",
      inkSoft: "#d9d1c5",
      muted: "#9c9285",
      line: "#2c2721",
      lineStrong: "#453d34",
      ember: "#e9853f",
      emberSoft: "#f2a66e",
      emberWash: "#2a1d13",
      accent: "#d8ac5f",
      accentSoft: "#e6c68d",
      moss: "#86b598",
      mossSoft: "#5d8a71",
      sky: "#7fb4d1",
      gold: "#d8ac5f",
      onEmber: "#17120d",
      shadowColor: "0 0 0",
    },
    fonts: { display: "display-serif", sans: "ui-sans", mono: "mono" },
    radius: { button: "9999px", card: "1.25rem" },
  },

  /**
   * The look a Mobile Home Manager deployment wears, taken from a live one
   * rather than guessed at: white ground, slate type, a blue primary that
   * runs to an orange accent across every primary button, and a system sans
   * throughout. Louder and flatter than Hearthline on purpose — it is built
   * to be scanned and acted on rather than read.
   *
   * The values are the `custom` skin as that engine resolves it. Its own
   * token names map onto this file's as follows, so the two stay comparable
   * when either moves:
   *
   *   background #FFFFFF -> paper          text       #0F172A -> ink
   *   backgroundAlt      -> surface        textMuted  #64748B -> muted
   *   surfaceHover       -> surface2       textLight  #94A3B8 -> (unused)
   *   border   #E2E8F0   -> line           primary    #0061ff -> ember
   *   success  #10B981   -> moss           accent     #ffb43f -> accent
   *
   * There is no dark theme on the original — it is a white site. The block
   * below is this template's own, because the toggle in the header has to
   * lead somewhere; it keeps the same blue and orange against slate.
   */
  nerto: {
    id: "nerto",
    name: "Direct",
    description:
      "White ground, slate type, a blue-to-orange gradient on every primary button, set in the system sans. Built to be scanned and acted on.",
    light: {
      paper: "#ffffff",
      surface: "#f8fafc",
      surface2: "#f1f5f9",
      ink: "#0f172a",
      inkSoft: "#334155",
      muted: "#64748b",
      line: "#e2e8f0",
      lineStrong: "#cbd5e1",
      ember: "#0061ff",
      emberSoft: "#2563eb",
      emberWash: "#eff6ff",
      accent: "#ffb43f",
      accentSoft: "#ffaa00",
      /* The green is the tick beside "Financing available" and every other
         reassurance on the page. #4ade80 is too light to carry text, so the
         readable shade is the token and the bright one is its soft pair. */
      moss: "#10b981",
      mossSoft: "#4ade80",
      sky: "#0ea5e9",
      gold: "#f59e0b",
      onEmber: "#ffffff",
      shadowColor: "15 23 42",
    },
    dark: {
      paper: "#0b1220",
      surface: "#111a2e",
      surface2: "#1a2540",
      ink: "#e2e8f0",
      inkSoft: "#cbd5e1",
      muted: "#94a3b8",
      line: "#1e293b",
      lineStrong: "#334155",
      ember: "#3b82f6",
      emberSoft: "#60a5fa",
      emberWash: "#12203a",
      accent: "#ffb43f",
      accentSoft: "#ffc76d",
      moss: "#34d399",
      mossSoft: "#6ee7b7",
      sky: "#38bdf8",
      gold: "#fbbf24",
      onEmber: "#ffffff",
      shadowColor: "0 0 0",
    },
    landLight: {
      water: "#e6eef8",
      unserved: "#e2e8f0",
      outside: "#cbd5e1",
      overBudget: "#eef2f7",
      stroke: "#ffffff",
      price: "#0061ff",
      tier1: "#1e3a8a",
      tier2: "#0061ff",
      tier3: "#3b82f6",
      tier4: "#7dabf8",
      tier5: "#bfd7fd",
    },
    landDark: {
      water: "#070d18",
      unserved: "#1a2540",
      outside: "#131c30",
      overBudget: "#121a2c",
      stroke: "#0b1220",
      price: "#ffb43f",
      tier1: "#93c5fd",
      tier2: "#60a5fa",
      tier3: "#3b82f6",
      tier4: "#2563eb",
      tier5: "#1e40af",
    },
    /* Primary buttons wear the gradient below rather than a flat fill, so
       these two are only what a plain `bg-[var(--btn-bg)]` falls back to. */
    button: { bg: "#0061ff", fg: "#ffffff", hoverBg: "#2563eb", hoverFg: "#ffffff" },
    buttonDark: { bg: "#3b82f6", fg: "#ffffff", hoverBg: "#60a5fa", hoverFg: "#ffffff" },
    gradient: {
      gradient: "linear-gradient(135deg, #0061ff 0%, #ffb43f 100%)",
      gradientHover: "linear-gradient(135deg, #2563eb 0%, #ffaa00 100%)",
      buttonShadow: "0 10px 25px -5px rgba(0, 97, 255, 0.4)",
      cardShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    },
    gradientDark: {
      gradient: "linear-gradient(135deg, #3b82f6 0%, #ffb43f 100%)",
      gradientHover: "linear-gradient(135deg, #60a5fa 0%, #ffc76d 100%)",
      buttonShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.45)",
      cardShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.5)",
    },
    fonts: { display: "system", sans: "system", mono: "system" },
    radius: { button: "0.75rem", card: "1rem" },
  },
};

/**
 * The skin this deployment wears. One line to change the whole look.
 */
export const activeSkin: SkinId = "nerto";

export const skin = skins[activeSkin];

/* ------------------------------------------------------------------ *
 * Emitting the tokens
 * ------------------------------------------------------------------ */

const PALETTE_VARS: [keyof SkinPalette, string][] = [
  ["paper", "--paper"],
  ["surface", "--surface"],
  ["surface2", "--surface-2"],
  ["ink", "--ink"],
  ["inkSoft", "--ink-soft"],
  ["muted", "--muted"],
  ["line", "--line"],
  ["lineStrong", "--line-strong"],
  ["ember", "--ember"],
  ["emberSoft", "--ember-soft"],
  ["emberWash", "--ember-wash"],
  ["accent", "--accent"],
  ["accentSoft", "--accent-soft"],
  ["moss", "--moss"],
  ["mossSoft", "--moss-soft"],
  ["sky", "--sky"],
  ["gold", "--gold"],
  ["onEmber", "--on-ember"],
  ["shadowColor", "--shadow-color"],
];

const LAND_VARS: [keyof SkinLandPalette, string][] = [
  ["water", "--land-water"],
  ["unserved", "--land-unserved"],
  ["outside", "--land-outside"],
  ["overBudget", "--land-over-budget"],
  ["stroke", "--land-stroke"],
  ["price", "--land-price"],
  ["tier1", "--land-tier-1"],
  ["tier2", "--land-tier-2"],
  ["tier3", "--land-tier-3"],
  ["tier4", "--land-tier-4"],
  ["tier5", "--land-tier-5"],
];

const gradientVars = (g: SkinGradient | undefined) =>
  g
    ? [
        `--gradient:${g.gradient}`,
        `--gradient-hover:${g.gradientHover}`,
        `--btn-gradient:${g.gradient}`,
        `--btn-gradient-hover:${g.gradientHover}`,
        `--button-shadow:${g.buttonShadow}`,
        `--card-shadow:${g.cardShadow}`,
      ]
    : [];

const buttonVars = (button: SkinButton | undefined) =>
  button
    ? [
        `--btn-bg:${button.bg}`,
        `--btn-fg:${button.fg}`,
        `--btn-hover-bg:${button.hoverBg}`,
        `--btn-hover-fg:${button.hoverFg}`,
      ]
    : [];

const block = (
  palette: SkinPalette,
  land: SkinLandPalette | undefined,
  button: SkinButton | undefined,
  gradient: SkinGradient | undefined,
) =>
  [
    ...PALETTE_VARS.map(([key, cssVar]) => `${cssVar}:${palette[key]}`),
    ...LAND_VARS.flatMap(([key, cssVar]) =>
      land?.[key] ? [`${cssVar}:${land[key]}`] : [],
    ),
    ...buttonVars(button),
    ...gradientVars(gradient),
  ].join(";");

/**
 * The active skin's tokens as a stylesheet, for `app/layout.tsx` to inline.
 *
 * The selectors are doubled — `:root:root` rather than `:root` — so these
 * always beat the fallback values in `app/globals.css` regardless of which
 * order the two end up in. Without that, whether the skin applies would
 * depend on stylesheet ordering, which is not a thing to leave to chance.
 */
export function skinStyles(active: Skin = skin): string {
  return [
    `:root:root{${block(active.light, active.landLight, active.button, active.gradient)};` +
      `--corner-button:${active.radius.button};--corner-card:${active.radius.card}}`,
    `:root:root.dark{${block(active.dark, active.landDark, active.buttonDark ?? active.button, active.gradientDark ?? active.gradient)}}`,
  ].join("");
}

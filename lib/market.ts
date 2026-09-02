/**
 * Facts that are true of this dealership's market and nowhere else.
 *
 * The editorial pages argue a case about manufactured housing that holds in
 * any state — the HUD Code, the chattel-versus-mortgage gap, how titling
 * works. But the moment copy names a county, a wind zone or a state statute,
 * it stops being portable, and shipping one market's answer to another
 * dealership is worse than saying nothing: it is confidently wrong.
 *
 * It is also the cheapest way to stop two sites built from this template
 * reading identically. A page that knows the buyer's wind zone and their
 * state's real-property conversion is both unique and more useful than the
 * generic version of itself.
 *
 * Same contract as `lib/company.ts`: every field is optional, and the copy
 * that reads one falls back to a portable sentence when it is absent. Fill
 * in what you can verify for the market; leave the rest out.
 */
export type Market = {
  /** Counties the dealership actually sells into, for USDA and permitting copy. */
  /** What people here call the area — "Central Maine", "the Midcoast".
      Used in the headline. Absent, the headline says the state instead. */
  regionName?: string;
  countiesServed?: string[];
  /**
   * HUD wind zone for the market — I inland, II and III coastal and
   * hurricane-prone. Decides what the home must be engineered to.
   */
  windZone?: "I" | "II" | "III";
  /** HUD thermal zone, 1–3, which sets the insulation requirement. */
  thermalZone?: 1 | 2 | 3;
  /**
   * How this state converts a manufactured home to real property, in one
   * sentence — the affidavit or certificate, and where it is filed. This
   * varies enough between states that a generic answer is useless.
   */
  realPropertyConversion?: string;
  /** Anything locally specific about USDA eligibility worth telling a buyer. */
  usdaNote?: string;
  /** Frost depth in inches, which drives footing depth on owned land. */
  frostDepthInches?: number;
};

export const market: Market = {
  regionName: "Central Maine",
  /* The towns NERTO names on its own site are Chelsea, Augusta and Portland,
     which is Kennebec and Cumberland. Rent-to-own buildings go further —
     "throughout New England" — but that is a different product from a home
     on a lot, so it does not widen this list. Add a county here only when
     the business says it delivers homes there. */
  countiesServed: ["Kennebec", "Cumberland"],
  /* Inland Maine is HUD Wind Zone I; only the coast reaches Zone II. */
  windZone: "I",
  /* Maine is the coldest HUD insulation zone, which is why an envelope
     specified for a southern market is the wrong home to buy here. */
  thermalZone: 3,
  realPropertyConversion:
    "Maine issues a manufactured home its own certificate of title. Once the home is permanently affixed to land the owner also owns, that title is cancelled and the home is conveyed with the real estate — which is the step that makes a mortgage, rather than a chattel loan, possible.",
  usdaNote:
    "Most of Kennebec County outside the Augusta and Gardiner city limits sits inside USDA-eligible tracts, and so does a great deal of the ground between here and the coast. It is worth ten minutes with the eligibility map before you assume you do not qualify — and note it applies to land you own, not a leased pad.",
  /* Central Maine builds to a 48-inch frost line; the northern counties go
     deeper. Confirm with the code officer for the town you are setting in. */
  frostDepthInches: 48,
};

/** "Kennebec and Cumberland" — for prose that lists the service area. */
export function countyList(): string | undefined {
  const c = market.countiesServed;
  if (!c || c.length === 0) return undefined;
  if (c.length === 1) return c[0];
  return `${c.slice(0, -1).join(", ")} and ${c[c.length - 1]}`;
}

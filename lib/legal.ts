/**
 * The privacy policy and the terms.
 *
 * These two are the only pages on the site with no switch in
 * `lib/page-config.ts`: a site that collects a name and a phone number needs
 * to say what it does with them, and that is not a section a deployment gets
 * to turn off.
 *
 * What is here is a starting draft written against what this template
 * actually does — it takes enquiries through a form, forwards them to a
 * webhook, and stores saved homes in the visitor's own browser. It is not
 * legal advice and it has not been reviewed by anyone qualified to give any.
 * Before a real site goes live, have a lawyer in your state read both, and
 * amend the clauses about data sharing, retention and dispute resolution to
 * match what the business genuinely does.
 *
 * `{name}`, `{email}`, `{phone}` and `{state}` are substituted from
 * `lib/site.ts` at render time; a clause whose placeholder has no value is
 * dropped rather than printed with a hole in it.
 */

export type LegalSection = {
  heading: string;
  /** One string per paragraph. A nested array renders as a bulleted list. */
  body: (string | string[])[];
};

export const privacyUpdated = "2026-01-01";
export const termsUpdated = "2026-01-01";

export const privacy: LegalSection[] = [
  {
    heading: "What this covers",
    body: [
      "{name} (“we”, “us”) runs this website. This policy explains what we collect when you use it, why, and what we do with it afterwards. It applies to this site and to the enquiries it takes — not to anything you send a lender, an insurer or a community directly.",
    ],
  },
  {
    heading: "What we collect",
    body: [
      "Only what you type into a form, plus the ordinary technical record of a web request:",
      [
        "Your name, phone number and email address, when you send an enquiry or ask to be pre-approved.",
        "Whatever else you tell us in a message — the county you are looking at, a parcel number, a budget.",
        "Standard server log data: IP address, browser, the pages requested and when.",
      ],
      "We do not ask for a Social Security number, a date of birth or bank details anywhere on this site. If a page appears to, it is not ours — stop and call us on {phone}.",
    ],
  },
  {
    heading: "What stays in your browser",
    body: [
      "Homes you save, and your light or dark theme preference, are stored in your own browser and never sent to us. Clearing your site data deletes them and there is no copy on our side to delete.",
    ],
  },
  {
    heading: "What we do with it",
    body: [
      "We use what you send to answer you — by phone, text or email — and to work out which homes and which lending paths actually fit your situation. Enquiries may be forwarded to the customer-management system we use to keep track of conversations.",
      "We do not sell your information. We do not pass it to a lender, an insurer or a community without you asking us to.",
    ],
  },
  {
    heading: "How long we keep it",
    body: [
      "Enquiries are kept while a conversation is live and for as long afterwards as our records obligations require. Ask us to delete yours and we will, other than anything a completed sale requires us to retain.",
    ],
  },
  {
    heading: "Your choices",
    body: [
      "Write to {email} to see what we hold, correct it, or have it deleted. Ask us to stop contacting you and we stop — one message, no retention offer.",
      "Depending on where you live you may have further rights over your personal information under state law. We honour those requests whether or not the statute strictly applies to us.",
    ],
  },
  {
    heading: "Children",
    body: [
      "This site is not for people under 18 and we do not knowingly collect anything from them.",
    ],
  },
  {
    heading: "Changes",
    body: [
      "If this policy changes, the date at the top of this page changes with it. Material changes to what we do with enquiries will be flagged on the page rather than made quietly.",
    ],
  },
  {
    heading: "Contact",
    body: [
      "Questions about any of this go to {email}, or {phone} during opening hours.",
    ],
  },
];

export const terms: LegalSection[] = [
  {
    heading: "Agreement",
    body: [
      "Using this website means accepting what is on this page. If you do not, do not use the site — call {phone} instead and we will talk you through anything you wanted from it.",
    ],
  },
  {
    heading: "What the listings are",
    body: [
      "Every price, specification, floor plan and photograph on this site is descriptive, not an offer to sell. Specifications come from the manufacturer and change without our being told. Availability changes daily.",
      "Nothing is binding on either of us until there is a signed purchase agreement. Where this site and that agreement disagree, the agreement wins.",
    ],
  },
  {
    heading: "Prices",
    body: [
      "What a quoted price covers is set out on the quote itself and nowhere else. Ask before you assume: transport distance, the set, skirting, utility connections and any allowance for options are each either in a given quote or they are not, and we would rather say so up front than let a number do the talking.",
      "Land, site work, permits, taxes and title fees are quoted separately, because they genuinely vary by parcel. A quoted figure is good for the period stated on the quote.",
    ],
  },
  {
    heading: "Payment estimates",
    body: [
      "Any monthly figure shown here — on a calculator, a map or a listing — is an illustration produced from the assumptions printed beside it. It is not an offer of credit, a rate quote or a pre-approval. Real terms come from a lender, after underwriting, and will differ.",
    ],
  },
  {
    heading: "Financing and titling",
    body: [
      "We are not a lender. What we can tell you is which lending and titling paths your situation opens, and we will tell you that plainly, including when the answer is unwelcome. The loan itself is between you and the lender.",
    ],
  },
  {
    heading: "Enquiries you send",
    body: [
      "Send us accurate information and do not send anyone else's. By sending an enquiry you are asking us to contact you about it, by phone, text or email; you can ask us to stop at any time.",
    ],
  },
  {
    heading: "The site itself",
    body: [
      "The writing, photographs, artwork and code here belong to {name} or to the manufacturers whose homes are shown, and are not yours to republish. Manufacturer names and plan names are the marks of their owners.",
      "We keep the site accurate and available as best we can, but it is provided as it is. We are not liable for a decision made solely on something read here rather than confirmed with a person.",
    ],
  },
  {
    heading: "Governing law",
    body: [
      "These terms are governed by the law of {state}, and any dispute belongs in the courts that sit there.",
    ],
  },
  {
    heading: "Contact",
    body: [
      "Questions about these terms go to {email}, or {phone} during opening hours.",
    ],
  },
];

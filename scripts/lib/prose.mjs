/**
 * Pull the human-readable prose out of a page file.
 *
 * Shared by `check-boilerplate.mjs` and the baseline generator so both see
 * exactly the same strings — if they disagreed, every check would be noise.
 *
 * A page mixes three kinds of string: copy a visitor reads, Tailwind class
 * lists, and short structural labels. Only the first is interesting, so a
 * string qualifies as prose when it is long enough to be a sentence and does
 * not look like markup plumbing.
 */

/** Class lists, URLs, keys, markup and other non-copy strings. */
const NOT_PROSE = [
  /[<>{}=]/, // markup or code that leaked out of a literal
  /^[\w-]+\/[\w/-]+$/, // photo keys, paths
  /^https?:/,
  /\b(?:px|py|mt|mb|gap|grid|flex|rounded|border|bg|text)-\[?[\w./-]/, // tailwind
  /^[A-Z_]+$/,
];

/** Prose is a sentence's worth of words, with no markup in it. */
const isProse = (s) =>
  s.length >= 40 && /\s\w+\s\w+\s/.test(s) && !NOT_PROSE.some((re) => re.test(s));

/**
 * Normalise before hashing so cosmetic edits don't read as a rewrite:
 * collapse whitespace, unify the quotes and dashes Prettier moves around,
 * and lowercase.
 */
export const normalise = (s) =>
  s
    .replace(/\s+/g, " ")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .trim()
    .toLowerCase();

export function extractProse(src) {
  const found = new Set();

  // Double- and single-quoted string literals, and template literals with no
  // interpolation (an interpolated one is usually assembled, not written).
  for (const re of [/"([^"\\\n]+)"/g, /'([^'\\\n]+)'/g, /`([^`\\${}]+)`/g]) {
    for (const [, body] of src.matchAll(re)) {
      if (isProse(body)) found.add(body);
    }
  }

  // JSX text nodes — copy written straight into the markup.
  for (const [, body] of src.matchAll(/>\s*([^<>{}]+?)\s*</g)) {
    if (isProse(body)) found.add(body);
  }

  return [...found].map(normalise);
}

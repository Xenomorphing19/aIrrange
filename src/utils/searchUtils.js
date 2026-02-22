import { stemmer } from 'stemmer';

// A tiny, pragmatic stop-word list for keyword/tag normalization.
// (We can expand/tune this later.)
const STOP_WORDS = new Set([
  'the',
  'a',
  'an',
  'and',
  'or',
  'is',
  'are',
  'was',
  'were',
  'to',
  'of',
  'in',
  'on',
  'for',
  'with',
  'as',
  'at',
  'by',
  'from'
]);

/**
 * Normalize a string into a list of root/stem tokens.
 *
 * - lowercases
 * - strips non-alphanumeric characters (keeps spaces)
 * - splits into words
 * - Porter-stems each token
 * - removes stop-words and empties
 *
 * @param {string} text
 * @returns {string[]}
 */
export function normalizeAndStem(text) {
  if (!text || typeof text !== 'string') return [];
  const raw = String(text ?? '');

  const cleaned = raw
    .toLowerCase()
    // Keep only letters, numbers, and whitespace.
    .replace(/[^a-z0-9\s]+/g, ' ');

  return cleaned
    .split(/\s+/)
    .map((w) => w.trim())
    .filter(Boolean)
    .filter((w) => !STOP_WORDS.has(w))
    .map((w) => stemmer(w))
    .filter(Boolean);
}

/**
 * Generate trigrams (3-character n-grams) for a token.
 *
 * @param {string} token
 * @returns {string[]}
 */
export function generateTrigrams(token) {
  if (!token || typeof token !== 'string') return [];
  const t = String(token ?? '');
  if (t.length < 3) return t ? [t] : [];
  /** @type {string[]} */
  const grams = [];
  for (let i = 0; i <= t.length - 3; i++) {
    grams.push(t.slice(i, i + 3));
  }
  return grams;
}

/**
 * Trigram similarity using **query overlap**.
 *
 * Score = |intersection| / |querySet|
 *
 * This avoids penalizing matches against very large documents: if the user
 * types a short query and all its trigrams exist in the target, score should
 * be 1.0.
 *
 * @param {string[]} queryTrigramsArray
 * @param {string[]} targetTrigramsArray
 * @returns {number}
 */
export function calculateTrigramSimilarity(queryTrigramsArray, targetTrigramsArray) {
  const a = new Set(Array.isArray(queryTrigramsArray) ? queryTrigramsArray.filter(Boolean) : []);
  const b = new Set(Array.isArray(targetTrigramsArray) ? targetTrigramsArray.filter(Boolean) : []);

  if (a.size === 0 && b.size === 0) return 0;

  let intersectionSize = 0;
  for (const g of a) {
    if (b.has(g)) intersectionSize++;
  }

  return intersectionSize / Math.max(1, a.size);
}

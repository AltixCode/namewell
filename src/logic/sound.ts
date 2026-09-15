/**
 * How a name sounds, computed from the name itself.
 *
 * This exists because the honest alternative to invented popularity data is analysis that is
 * *derived* rather than looked up: a syllable count is right because it is calculated, not
 * because a dataset said so. It needs no source, cannot go stale, and works for a name that
 * is not in the list at all — including a surname a parent types in.
 *
 * Pure and dependency-free. English orthography, which is stated plainly on screen rather
 * than implied to be universal.
 */

const VOWELS = "aeiouy";

/**
 * Vowel pairs that are normally two syllables rather than one.
 *
 * English spelling gives no rule that is right everywhere — "Leo" is two syllables and
 * "George" is one, and both contain "eo". These pairs are the ones that split far more often
 * than not; the handful of names where the heuristic still lands wrong carry an explicit
 * count in `names.ts`, which is a fact about a specific name rather than a rule about English.
 */
const HIATUS = ['ia', 'io', 'ie', 'ea', 'eo', 'oe', 'oa', 'ua', 'ue', 'ae', 'iu', 'ya'];

/**
 * Syllables, by the usual heuristic: count vowel groups, split the pairs that are normally
 * two, and drop a silent final "e" or "es".
 *
 * A heuristic, not a dictionary. The screen says "about" rather than presenting the number as
 * authoritative, because for an arbitrary surname it genuinely is an estimate.
 */
export function syllablesOf(name: string): number {
  let word = name.trim().toLowerCase().replace(/[^a-z]/g, '');
  if (word.length === 0) return 0;

  // A final "e" or "es" after a consonant is silent: Rose, Grace, James, Charles.
  const isConsonant = (ch: string) => ch !== '' && !VOWELS.includes(ch);
  if (word.endsWith('es') && isConsonant(word.charAt(word.length - 3))) word = word.slice(0, -2);
  else if (word.endsWith('e') && !word.endsWith('le') && isConsonant(word.charAt(word.length - 2))) {
    word = word.slice(0, -1);
  }
  if (word.length === 0) return 1;

  let count = 0;
  let i = 0;
  while (i < word.length) {
    if (!VOWELS.includes(word[i]!)) {
      i += 1;
      continue;
    }
    // A run of vowels is one syllable unless it contains a pair that normally splits.
    let j = i;
    while (j < word.length && VOWELS.includes(word[j]!)) j += 1;
    const run = word.slice(i, j);
    let parts = 1;
    for (let k = 0; k + 1 < run.length; k += 1) {
      if (HIATUS.includes(run.slice(k, k + 2))) parts += 1;
    }
    count += parts;
    i = j;
  }

  return Math.max(1, count);
}

/** The first letter, uppercased. What alliteration is judged on. */
export function initialOf(name: string): string {
  const letter = name
    .trim()
    .replace(/[^A-Za-z]/g, "")
    .charAt(0);
  return letter ? letter.toUpperCase() : "";
}

/** Whether two names start with the same letter. */
export function alliterates(a: string, b: string): boolean {
  const first = initialOf(a);
  return first !== "" && first === initialOf(b);
}

/**
 * Whether two names end with the same two letters.
 *
 * Deliberately called a *spelling* rhyme, not a rhyme: "Sofia" and "Maria" match here and do
 * genuinely chime, but English spelling is not pronunciation and the app does not claim it is.
 */
export function endsAlike(a: string, b: string): boolean {
  const tail = (s: string) =>
    s
      .trim()
      .toLowerCase()
      .replace(/[^a-z]/g, "")
      .slice(-2);
  const first = tail(a);
  return first.length === 2 && first === tail(b);
}

export interface SiblingFit {
  /** 0–100. A rough guide, presented as one. */
  score: number;
  alliterates: boolean;
  endsAlike: boolean;
  sameSyllables: boolean;
}

/**
 * How well two names sit together.
 *
 * The score is a weighted count of three things anyone can check by saying the names aloud,
 * which is why the screen shows the three flags alongside the number: a bare score invites
 * the reader to believe there is more behind it than there is.
 *
 * Alliteration is weighted *negatively* at the top end on purpose — "Molly and Milly" is a
 * well-known thing to regret — so a perfect score goes to names that share a rhythm without
 * sharing an initial.
 */
export function siblingFit(a: string, b: string): SiblingFit {
  const sameInitial = alliterates(a, b);
  const sameEnding = endsAlike(a, b);
  const sameLength = syllablesOf(a) === syllablesOf(b);

  let score = 50;
  if (sameLength) score += 25;
  if (sameEnding) score += 15;
  // Sharing both an initial and an ending is where sibling names blur into each other —
  // "Milly and Molly". The penalty is deliberately large enough to drop such a pair below a
  // neutral one, because a score that merely dents it would still read as a recommendation.
  if (sameInitial && sameEnding) score -= 45;
  else if (sameInitial) score -= 10;

  return {
    score: Math.max(0, Math.min(100, score)),
    alliterates: sameInitial,
    endsAlike: sameEnding,
    sameSyllables: sameLength,
  };
}

/**
 * A short shareable code for a shortlist, so two people can compare without an account.
 *
 * Deliberately not a server-side id: the whole shortlist is encoded in the code itself, which
 * is why comparing works offline and why nothing about it reaches us.
 */
export function encodeShortlist(names: string[]): string {
  const cleaned = names.map((n) => n.trim()).filter(Boolean);
  if (cleaned.length === 0) return "";
  return cleaned.join(".").toUpperCase();
}

export function decodeShortlist(code: string): string[] {
  return code
    .split(".")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase());
}

/** Names present in both lists, in the order of the first. */
export function agreedNames(mine: string[], theirs: string[]): string[] {
  const other = new Set(theirs.map((n) => n.toLowerCase()));
  return mine.filter((n) => other.has(n.toLowerCase()));
}

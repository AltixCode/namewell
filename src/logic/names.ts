/**
 * The name list.
 *
 * **On what is here and what is deliberately not.** Meaning and origin are shipped because
 * they are well-attested for these names — every entry is a common given name whose etymology
 * is settled and repeated consistently across reference works. Anything uncertain was left
 * out rather than guessed.
 *
 * **Popularity rankings are deliberately absent.** They are national-statistics data (the US
 * SSA and the UK ONS publish them, both usable), they change every year, and they cannot be
 * reproduced accurately from memory. Inventing rank numbers would be presenting fabricated
 * data as fact, which is worse than not having the feature — so the paywall's first claim was
 * changed to match what the app actually does, rather than the data being faked to match the
 * claim. Bundling the real SSA dataset would let the original claim ship honestly; see
 * `PORTFOLIO-STATE.md`.
 *
 * What replaced it is `sound.ts`: syllable count, initial sound and alliteration are
 * *computed* from the name itself, so they are always right and need no dataset at all.
 */

export type Gender = "girl" | "boy" | "either";

export interface NameEntry {
  name: string;
  gender: Gender;
  /** Where the name comes from. */
  origin: string;
  /** What it is generally taken to mean. */
  meaning: string;
  /**
   * An explicit syllable count, for the few names where the heuristic in `sound.ts` is wrong.
   *
   * "George" is one syllable and "Leo" is two, and both contain "eo" — no spelling rule wins
   * both. This is a fact about a particular name rather than a rule about English, which is
   * why it lives here and not in the heuristic.
   */
  syllables?: number;
}

export const NAMES: NameEntry[] = [
  {
    name: "Alexander",
    gender: "boy",
    origin: "Greek",
    meaning: "Defender of the people",
  },
  {
    name: "Alice",
    gender: "girl",
    origin: "Germanic, via Old French",
    meaning: "Noble, of noble kind",
  },
  {
    name: "Amelia",
    gender: "girl",
    origin: "Germanic",
    meaning: "Work, industriousness",
  },
  {
    name: "Amir",
    gender: "boy",
    origin: "Arabic",
    meaning: "Commander, prince",
  },
  { name: "Anna", gender: "girl", origin: "Hebrew", meaning: "Grace, favour" },
  {
    name: "Arthur",
    gender: "boy",
    origin: "Celtic, uncertain",
    meaning: "Traditionally linked to bear",
  },
  {
    name: "Aya",
    gender: "girl",
    origin: "Arabic; also Japanese",
    meaning: "Sign, verse (Arabic)",
  },
  {
    name: "Benjamin",
    gender: "boy",
    origin: "Hebrew",
    meaning: "Son of the right hand",
  },
  {
    name: "Beatrice",
    gender: "girl",
    origin: "Latin",
    meaning: "She who brings happiness",
  },
  {
    name: "Carmen",
    gender: "girl",
    origin: "Spanish, from Hebrew Carmel",
    meaning: "Garden, orchard",
  },
  {
    name: "Charlotte",
    gender: "girl",
    origin: "French, from Germanic",
    meaning: "Free man — feminine of Charles",
  },
  { name: "Clara", gender: "girl", origin: "Latin", meaning: "Bright, clear" },
  {
    name: "Daniel",
    gender: "boy",
    origin: "Hebrew",
    meaning: "God is my judge",
  },
  { name: "David", gender: "boy", origin: "Hebrew", meaning: "Beloved" },
  {
    name: "Diego",
    gender: "boy",
    origin: "Spanish",
    meaning: "Related to the name James",
  },
  {
    name: "Eleanor",
    gender: "girl",
    origin: "Old French, via Occitan",
    meaning: "Long debated; no settled meaning",
  },
  {
    name: "Elias",
    gender: "boy",
    origin: "Greek form of Hebrew Eliyahu",
    meaning: "The Lord is my God",
  },
  {
    name: "Emma",
    gender: "girl",
    origin: "Germanic",
    meaning: "Whole, universal",
  },
  {
    name: "Eva",
    gender: "girl",
    origin: "Hebrew",
    meaning: "Life, living one",
  },
  {
    name: "Felix",
    gender: "boy",
    origin: "Latin",
    meaning: "Fortunate, happy",
  },
  {
    name: "Freya",
    gender: "girl",
    origin: "Old Norse",
    meaning: "Lady — the Norse goddess",
  },
  {
    name: "Gabriel",
    gender: "boy",
    origin: "Hebrew",
    meaning: "God is my strength",
  },
  {
    name: "George",
    gender: "boy",
    origin: "Greek",
    meaning: "Farmer, earth-worker",
    syllables: 1,
  },
  {
    name: "Grace",
    gender: "girl",
    origin: "Latin, via English virtue names",
    meaning: "Grace, favour",
  },
  {
    name: "Hannah",
    gender: "girl",
    origin: "Hebrew",
    meaning: "Grace, favour",
  },
  {
    name: "Hassan",
    gender: "boy",
    origin: "Arabic",
    meaning: "Handsome, good",
  },
  {
    name: "Henry",
    gender: "boy",
    origin: "Germanic",
    meaning: "Ruler of the home",
  },
  { name: "Hugo", gender: "boy", origin: "Germanic", meaning: "Mind, spirit" },
  { name: "Ida", gender: "girl", origin: "Germanic", meaning: "Work, labour" },
  { name: "Isaac", gender: "boy", origin: "Hebrew", meaning: "He laughs" },
  {
    name: "Isabel",
    gender: "girl",
    origin: "Spanish form of Elizabeth",
    meaning: "My God is an oath",
  },
  {
    name: "Ivan",
    gender: "boy",
    origin: "Slavic form of John",
    meaning: "God is gracious",
  },
  {
    name: "Jacob",
    gender: "boy",
    origin: "Hebrew",
    meaning: "Supplanter, one who follows",
  },
  {
    name: "James",
    gender: "boy",
    origin: "English form of Jacob",
    meaning: "Supplanter, one who follows",
  },
  { name: "Jonah", gender: "boy", origin: "Hebrew", meaning: "Dove" },
  {
    name: "Julia",
    gender: "girl",
    origin: "Latin",
    meaning: "From the Julian family name",
  },
  {
    name: "Katherine",
    gender: "girl",
    origin: "Greek",
    meaning: 'Long associated with "pure"',
  },
  { name: "Leo", gender: "boy", origin: "Latin", meaning: "Lion" },
  { name: "Leila", gender: "girl", origin: "Arabic", meaning: "Night" },
  {
    name: "Lily",
    gender: "girl",
    origin: "English, from the flower",
    meaning: "The lily flower",
  },
  {
    name: "Lucas",
    gender: "boy",
    origin: "Latin",
    meaning: "From Lucania; linked to light",
  },
  { name: "Lucia", gender: "girl", origin: "Latin", meaning: "Light" },
  {
    name: "Maria",
    gender: "girl",
    origin: "Latin form of Hebrew Miriam",
    meaning: "Meaning long debated",
  },
  { name: "Marcus", gender: "boy", origin: "Latin", meaning: "Of Mars" },
  {
    name: "Martha",
    gender: "girl",
    origin: "Aramaic",
    meaning: "Lady, mistress of the house",
  },
  { name: "Matthew", gender: "boy", origin: "Hebrew", meaning: "Gift of God" },
  {
    name: "Maya",
    gender: "girl",
    origin: "Several traditions independently",
    meaning: "Illusion (Sanskrit); water (Hebrew)",
  },
  {
    name: "Mia",
    gender: "girl",
    origin: "Scandinavian and Italian short form",
    meaning: "Short form of Maria",
  },
  {
    name: "Miriam",
    gender: "girl",
    origin: "Hebrew",
    meaning: "Meaning long debated",
  },
  { name: "Nadia", gender: "girl", origin: "Slavic", meaning: "Hope" },
  { name: "Nathan", gender: "boy", origin: "Hebrew", meaning: "He gave" },
  {
    name: "Nina",
    gender: "girl",
    origin: "Several traditions independently",
    meaning: "Short form used across Slavic and Spanish",
  },
  { name: "Noah", gender: "boy", origin: "Hebrew", meaning: "Rest, comfort" },
  {
    name: "Nora",
    gender: "girl",
    origin: "Irish and Latin roots",
    meaning: "Short form of Honora — honour",
  },
  {
    name: "Olive",
    gender: "girl",
    origin: "Latin, from the tree",
    meaning: "The olive tree",
  },
  {
    name: "Oliver",
    gender: "boy",
    origin: "Norman French",
    meaning: "Traditionally linked to the olive tree",
  },
  {
    name: "Omar",
    gender: "boy",
    origin: "Arabic",
    meaning: "Flourishing, long-lived",
  },
  {
    name: "Oscar",
    gender: "boy",
    origin: "Irish; also Old English",
    meaning: "Deer friend (Irish)",
  },
  { name: "Paul", gender: "boy", origin: "Latin", meaning: "Small, humble" },
  {
    name: "Priya",
    gender: "girl",
    origin: "Sanskrit",
    meaning: "Beloved, dear",
  },
  {
    name: "Rafael",
    gender: "boy",
    origin: "Hebrew",
    meaning: "God has healed",
  },
  {
    name: "Rose",
    gender: "girl",
    origin: "Latin, from the flower",
    meaning: "The rose flower",
  },
  {
    name: "Ruth",
    gender: "girl",
    origin: "Hebrew",
    meaning: "Companion, friend",
  },
  {
    name: "Samuel",
    gender: "boy",
    origin: "Hebrew",
    meaning: "Name of God; God has heard",
  },
  {
    name: "Sara",
    gender: "girl",
    origin: "Hebrew",
    meaning: "Princess, noblewoman",
  },
  {
    name: "Sebastian",
    gender: "boy",
    origin: "Greek, via Latin",
    meaning: "From Sebaste; venerable",
  },
  { name: "Simon", gender: "boy", origin: "Hebrew", meaning: "He has heard" },
  { name: "Sofia", gender: "girl", origin: "Greek", meaning: "Wisdom" },
  { name: "Stella", gender: "girl", origin: "Latin", meaning: "Star" },
  { name: "Theodore", gender: "boy", origin: "Greek", meaning: "Gift of God" },
  { name: "Thomas", gender: "boy", origin: "Aramaic", meaning: "Twin" },
  {
    name: "Vera",
    gender: "girl",
    origin: "Russian; also Latin",
    meaning: "Faith (Russian); true (Latin)",
  },
  { name: "Victor", gender: "boy", origin: "Latin", meaning: "Conqueror" },
  { name: "Viktoria", gender: "girl", origin: "Latin", meaning: "Victory" },
  {
    name: "William",
    gender: "boy",
    origin: "Germanic",
    meaning: "Resolute protector",
  },
  {
    name: "Yusuf",
    gender: "boy",
    origin: "Arabic form of Joseph",
    meaning: "God will increase",
  },
  {
    name: "Zara",
    gender: "girl",
    origin: "Arabic; also a form of Sarah",
    meaning: "Blooming, radiant",
  },
  { name: "Zoe", gender: "girl", origin: "Greek", meaning: "Life" },
  {
    name: "Alex",
    gender: "either",
    origin: "Greek",
    meaning: "Short form of Alexander or Alexandra",
  },
  {
    name: "Robin",
    gender: "either",
    origin: "Germanic, via Old French",
    meaning: "Bright fame; also the bird",
  },
  {
    name: "Sam",
    gender: "either",
    origin: "Hebrew",
    meaning: "Short form of Samuel or Samantha",
  },
  { name: "Noor", gender: "either", origin: "Arabic", meaning: "Light" },
  {
    name: "Jordan",
    gender: "either",
    origin: "Hebrew, from the river",
    meaning: "To flow down, descend",
  },
];

export const byName = (name: string): NameEntry | undefined =>
  NAMES.find((n) => n.name.toLowerCase() === name.trim().toLowerCase());

/** The syllable count for an entry: its explicit value if it has one, else the heuristic. */
export function syllablesForEntry(
  entry: NameEntry,
  heuristic: (name: string) => number,
): number {
  return entry.syllables ?? heuristic(entry.name);
}

/** Every distinct origin in the list, for the filter chips. */
export const ORIGINS = [...new Set(NAMES.map((n) => n.origin))].sort();

export interface Filter {
  gender?: Gender | "all";
  /** Matches the start of the origin string, so "Hebrew" catches "Hebrew, via Greek". */
  origin?: string;
  /** Substring of the name, case-insensitive. */
  query?: string;
  syllables?: number;
}

/** Applied in a fixed order so the result is predictable. Absent fields are not filters. */
export function filterNames(
  filter: Filter,
  syllablesOf: (name: string) => number,
): NameEntry[] {
  return NAMES.filter((entry) => {
    if (
      filter.gender &&
      filter.gender !== "all" &&
      entry.gender !== filter.gender
    ) {
      // 'either' names are shown under a specific gender too: they are usable for both.
      if (entry.gender !== "either") return false;
    }
    if (
      filter.origin &&
      !entry.origin.toLowerCase().startsWith(filter.origin.toLowerCase())
    ) {
      return false;
    }
    if (
      filter.query &&
      !entry.name.toLowerCase().includes(filter.query.trim().toLowerCase())
    ) {
      return false;
    }
    if (filter.syllables && syllablesForEntry(entry, syllablesOf) !== filter.syllables)
      return false;
    return true;
  });
}

import { NAMES, ORIGINS, byName, filterNames, syllablesForEntry } from '../names';
import { syllablesOf } from '../sound';

describe('the name list', () => {
  it('has no duplicate names', () => {
    const lower = NAMES.map((n) => n.name.toLowerCase());
    expect(new Set(lower).size).toBe(lower.length);
  });

  it('gives every entry an origin and a meaning', () => {
    // These are the paid claim. A blank one is a lie, and a guessed one is worse.
    for (const entry of NAMES) {
      expect(entry.origin.trim().length).toBeGreaterThan(2);
      expect(entry.meaning.trim().length).toBeGreaterThan(2);
    }
  });

  it('uses only the three gender values', () => {
    for (const entry of NAMES) {
      expect(['girl', 'boy', 'either']).toContain(entry.gender);
    }
  });

  it('carries names of every gender, including unisex ones', () => {
    for (const gender of ['girl', 'boy', 'either'] as const) {
      expect(NAMES.some((n) => n.gender === gender)).toBe(true);
    }
  });

  it('says so plainly where a meaning is genuinely disputed', () => {
    // Several common names have no settled etymology. Asserting one would be inventing it.
    const hedged = NAMES.filter((n) => /debated|uncertain|traditionally|linked/i.test(n.meaning));
    expect(hedged.length).toBeGreaterThan(0);
  });

  it('finds a name case-insensitively and returns undefined for one it does not have', () => {
    expect(byName('emma')?.name).toBe('Emma');
    expect(byName('  ALICE ')?.name).toBe('Alice');
    expect(byName('Xyzzy')).toBeUndefined();
  });

  it('lists every origin once, sorted', () => {
    expect(ORIGINS).toEqual([...ORIGINS].sort());
    expect(new Set(ORIGINS).size).toBe(ORIGINS.length);
  });
});

describe('filterNames', () => {
  it('returns everything with no filter', () => {
    expect(filterNames({}, syllablesOf)).toHaveLength(NAMES.length);
  });

  it('filters by gender but keeps unisex names in both lists', () => {
    // A name usable for either child should not vanish when a parent picks a gender.
    const girls = filterNames({ gender: 'girl' }, syllablesOf);
    expect(girls.every((n) => n.gender === 'girl' || n.gender === 'either')).toBe(true);
    expect(girls.some((n) => n.gender === 'either')).toBe(true);
  });

  it('filters by origin on a prefix, so a compound origin still matches', () => {
    const hebrew = filterNames({ origin: 'Hebrew' }, syllablesOf);
    expect(hebrew.length).toBeGreaterThan(0);
    expect(hebrew.every((n) => n.origin.startsWith('Hebrew'))).toBe(true);
  });

  it('filters by a substring of the name, case-insensitively', () => {
    const matches = filterNames({ query: 'ann' }, syllablesOf);
    expect(matches.some((n) => n.name === 'Hannah')).toBe(true);
  });

  it('filters by syllable count', () => {
    const two = filterNames({ syllables: 2 }, syllablesOf);
    expect(two.length).toBeGreaterThan(0);
    expect(two.every((n) => syllablesOf(n.name) === 2)).toBe(true);
  });

  it('combines filters', () => {
    const result = filterNames({ gender: 'boy', origin: 'Latin' }, syllablesOf);
    expect(result.every((n) => n.origin.startsWith('Latin'))).toBe(true);
  });

  it('is empty rather than throwing when nothing matches', () => {
    expect(filterNames({ query: 'qqqqq' }, syllablesOf)).toEqual([]);
  });
});

describe('explicit syllable counts', () => {
  it('overrides the heuristic where it is wrong', () => {
    // George is one syllable; the "eo" rule that gets Leo right gets George wrong, so the
    // fact about the name is stated rather than the rule being bent to fit.
    const george = byName('George')!;
    expect(george.syllables).toBe(1);
    expect(syllablesForEntry(george, syllablesOf)).toBe(1);
    expect(syllablesOf('George')).not.toBe(1);
  });

  it('falls back to the heuristic for the rest', () => {
    const emma = byName('Emma')!;
    expect(emma.syllables).toBeUndefined();
    expect(syllablesForEntry(emma, syllablesOf)).toBe(syllablesOf('Emma'));
  });

  it('filters on the corrected count, not the raw one', () => {
    const one = filterNames({ syllables: 1 }, syllablesOf);
    expect(one.some((n) => n.name === 'George')).toBe(true);
  });
});

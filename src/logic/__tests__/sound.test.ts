import {
  agreedNames,
  alliterates,
  decodeShortlist,
  encodeShortlist,
  endsAlike,
  initialOf,
  siblingFit,
  syllablesOf,
} from '../sound';

describe('syllablesOf', () => {
  it.each([
    ['Leo', 2],
    ['Emma', 2],
    ['Alexander', 4],
    ['Zoe', 2],
    ['Grace', 1],
    ['Rose', 1],
    ['James', 1],
    ['Amelia', 4],
  ])('counts %s as %i', (name, expected) => {
    expect(syllablesOf(name)).toBe(expected);
  });

  it('never returns zero for a real name', () => {
    for (const name of ['Bo', 'Y', 'Ng']) expect(syllablesOf(name)).toBeGreaterThanOrEqual(1);
  });

  it('is zero only for nothing at all', () => {
    expect(syllablesOf('')).toBe(0);
    expect(syllablesOf('   ')).toBe(0);
  });

  it('ignores punctuation and spacing', () => {
    expect(syllablesOf("  O'Brien ")).toBe(syllablesOf('OBrien'));
  });
});

describe('initialOf and alliterates', () => {
  it('takes the first letter, uppercased', () => {
    expect(initialOf('emma')).toBe('E');
    expect(initialOf('  óscar')).toBe('S'); // Non-ASCII is stripped; the first LETTER wins.
  });

  it('is empty for a string with no letters', () => {
    expect(initialOf('123')).toBe('');
    expect(alliterates('123', '456')).toBe(false);
  });

  it('spots a shared initial', () => {
    expect(alliterates('Mia', 'Marcus')).toBe(true);
    expect(alliterates('Mia', 'Leo')).toBe(false);
  });
});

describe('endsAlike', () => {
  it('matches the last two letters', () => {
    expect(endsAlike('Sofia', 'Maria')).toBe(true);
    expect(endsAlike('Leo', 'Mia')).toBe(false);
  });

  it('needs at least two letters to compare', () => {
    expect(endsAlike('A', 'A')).toBe(false);
  });
});

describe('siblingFit', () => {
  it('rewards a shared rhythm', () => {
    // Emma and Leo are both two syllables, so the contrast has to be with a name that is not.
    const mismatched = siblingFit('Emma', 'Alexander');
    const matched = siblingFit('Emma', 'Nina');
    expect(matched.sameSyllables).toBe(true);
    expect(mismatched.sameSyllables).toBe(false);
    expect(matched.score).toBeGreaterThan(mismatched.score);
  });

  it('penalises names that share both an initial and an ending', () => {
    // "Molly and Milly" is the thing people warn each other about.
    const blurred = siblingFit('Milly', 'Molly');
    expect(blurred.alliterates).toBe(true);
    expect(blurred.endsAlike).toBe(true);
    expect(blurred.score).toBeLessThan(50);
  });

  it('stays inside 0 and 100', () => {
    for (const [a, b] of [['Emma', 'Emma'], ['Zoe', 'Alexander'], ['Leo', 'Theo']]) {
      const fit = siblingFit(a!, b!);
      expect(fit.score).toBeGreaterThanOrEqual(0);
      expect(fit.score).toBeLessThanOrEqual(100);
    }
  });

  it('reports the three flags it is built from, so the score is checkable', () => {
    const fit = siblingFit('Mia', 'Maya');
    expect(typeof fit.alliterates).toBe('boolean');
    expect(typeof fit.endsAlike).toBe('boolean');
    expect(typeof fit.sameSyllables).toBe('boolean');
  });
});

describe('shortlist codes', () => {
  it('round-trips a list', () => {
    const names = ['Emma', 'Leo', 'Nina'];
    expect(decodeShortlist(encodeShortlist(names))).toEqual(names);
  });

  it('is empty for an empty list', () => {
    expect(encodeShortlist([])).toBe('');
    expect(encodeShortlist(['  ', ''])).toBe('');
  });

  it('survives a code typed in the wrong case or with stray spaces', () => {
    expect(decodeShortlist(' emma . LEO ')).toEqual(['Emma', 'Leo']);
  });

  it('carries the whole list, so comparing needs no server', () => {
    // The code IS the data. That is why comparison works offline and nothing reaches us.
    expect(encodeShortlist(['Emma', 'Leo'])).toContain('EMMA');
  });
});

describe('agreedNames', () => {
  it('finds what two lists share, in the first list’s order', () => {
    expect(agreedNames(['Emma', 'Leo', 'Nina'], ['Nina', 'Emma'])).toEqual(['Emma', 'Nina']);
  });

  it('ignores case', () => {
    expect(agreedNames(['Emma'], ['emma'])).toEqual(['Emma']);
  });

  it('is empty when nothing is shared', () => {
    expect(agreedNames(['Emma'], ['Leo'])).toEqual([]);
  });
});

import AsyncStorage from '@react-native-async-storage/async-storage';

import { FREE_SHORTLIST, SHORTLIST_CACHE_KEY, useShortlistStore } from '../useShortlistStore';

const reset = () => useShortlistStore.setState({ shortlist: [], partner: [] });

beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();
  reset();
});

describe('the shortlist', () => {
  it('adds a name', () => {
    expect(useShortlistStore.getState().add('Emma', false)).toBe('added');
    expect(useShortlistStore.getState().shortlist).toEqual(['Emma']);
  });

  it('treats the same name in a different case as already there', () => {
    useShortlistStore.getState().add('Emma', false);
    expect(useShortlistStore.getState().add('  emma ', false)).toBe('already-there');
    expect(useShortlistStore.getState().shortlist).toHaveLength(1);
  });

  it('ignores an empty name', () => {
    useShortlistStore.getState().add('   ', false);
    expect(useShortlistStore.getState().shortlist).toHaveLength(0);
  });

  it('stops a free list at the cap', () => {
    for (let i = 0; i < FREE_SHORTLIST; i += 1) {
      expect(useShortlistStore.getState().add(`Name${i}`, false)).toBe('added');
    }
    expect(useShortlistStore.getState().add('OneMore', false)).toBe('limit-reached');
  });

  it('does not stop a paying list', () => {
    for (let i = 0; i < FREE_SHORTLIST + 5; i += 1) {
      expect(useShortlistStore.getState().add(`Name${i}`, true)).toBe('added');
    }
  });

  it('removes a name regardless of case', () => {
    useShortlistStore.getState().add('Emma', false);
    useShortlistStore.getState().remove('EMMA');
    expect(useShortlistStore.getState().shortlist).toHaveLength(0);
  });

  it('reports membership', () => {
    useShortlistStore.getState().add('Leo', false);
    expect(useShortlistStore.getState().has('leo')).toBe(true);
    expect(useShortlistStore.getState().has('Nina')).toBe(false);
  });

  it('clears', () => {
    useShortlistStore.getState().add('Leo', false);
    useShortlistStore.getState().clear();
    expect(useShortlistStore.getState().shortlist).toHaveLength(0);
  });
});

describe('the partner code', () => {
  it('carries the whole list, so comparing needs no account', () => {
    // The code IS the data. Nothing about the names reaches a server.
    useShortlistStore.getState().add('Emma', false);
    useShortlistStore.getState().add('Leo', false);
    expect(useShortlistStore.getState().myCode()).toBe('EMMA.LEO');
  });

  it('reads a partner code back', () => {
    expect(useShortlistStore.getState().setPartnerCode('EMMA.NINA')).toBe('set');
    expect(useShortlistStore.getState().partner).toEqual(['Emma', 'Nina']);
  });

  it('clears rather than half-setting on an unreadable code', () => {
    useShortlistStore.setState({ partner: ['Emma'] });
    expect(useShortlistStore.getState().setPartnerCode('   ')).toBe('empty');
    expect(useShortlistStore.getState().partner).toEqual([]);
  });

  it('finds what both lists hold', () => {
    useShortlistStore.getState().add('Emma', false);
    useShortlistStore.getState().add('Leo', false);
    useShortlistStore.getState().add('Nina', false);
    useShortlistStore.getState().setPartnerCode('NINA.EMMA');
    expect(useShortlistStore.getState().agreed()).toEqual(['Emma', 'Nina']);
  });

  it('agrees on nothing before a partner code is set', () => {
    useShortlistStore.getState().add('Emma', false);
    expect(useShortlistStore.getState().agreed()).toEqual([]);
  });

  it('forgets the partner on request', () => {
    useShortlistStore.getState().setPartnerCode('EMMA');
    useShortlistStore.getState().clearPartner();
    expect(useShortlistStore.getState().partner).toEqual([]);
  });
});

describe('persistence', () => {
  it('round-trips both lists', async () => {
    useShortlistStore.getState().add('Emma', false);
    useShortlistStore.getState().setPartnerCode('LEO');
    await useShortlistStore.getState().persist();

    reset();
    await useShortlistStore.getState().hydrate();
    expect(useShortlistStore.getState().shortlist).toEqual(['Emma']);
    expect(useShortlistStore.getState().partner).toEqual(['Leo']);
  });

  it('starts empty on stored rubbish', async () => {
    await AsyncStorage.setItem(SHORTLIST_CACHE_KEY, '{"shortlist":"Emma","partner":42}');
    await useShortlistStore.getState().hydrate();
    expect(useShortlistStore.getState().shortlist).toEqual([]);
    expect(useShortlistStore.getState().partner).toEqual([]);
  });

  it('drops blank entries from a stored list', async () => {
    await AsyncStorage.setItem(
      SHORTLIST_CACHE_KEY,
      JSON.stringify({ shortlist: ['Emma', '', '   ', 7] }),
    );
    await useShortlistStore.getState().hydrate();
    expect(useShortlistStore.getState().shortlist).toEqual(['Emma']);
  });
});

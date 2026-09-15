/**
 * Shortlists, the partner code, and what two lists agree on.
 *
 * Two of the paywall's four claims live here — unlimited shortlists with partner comparison,
 * and the sibling matcher's use of a saved list — and both take `isPremium` explicitly.
 *
 * Nothing here talks to a network. The partner code *contains* the shortlist rather than
 * pointing at one on a server, which is why comparing works on a plane and why no list of
 * names a couple is considering ever leaves their phones.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import { agreedNames, decodeShortlist, encodeShortlist } from "@/logic/sound";

export const SHORTLIST_CACHE_KEY = "namewell.shortlist.v1";

/** Names a free shortlist holds. The purchase removes the limit. */
export const FREE_SHORTLIST = 10;

interface ShortlistState {
  /** Names kept, in the order they were added. */
  shortlist: string[];
  /** The partner's list, once a code has been pasted in. */
  partner: string[];

  add: (
    name: string,
    isPremium: boolean,
  ) => "added" | "already-there" | "limit-reached";
  remove: (name: string) => void;
  has: (name: string) => boolean;
  clear: () => void;
  myCode: () => string;
  setPartnerCode: (code: string) => "set" | "empty";
  clearPartner: () => void;
  agreed: () => string[];
  persist: () => Promise<void>;
  hydrate: () => Promise<void>;
}

const cleanNames = (value: unknown): string[] =>
  Array.isArray(value)
    ? value
        .filter(
          (v): v is string => typeof v === "string" && v.trim().length > 0,
        )
        .map((v) => v.trim())
    : [];

export const useShortlistStore = create<ShortlistState>((set, get) => ({
  shortlist: [],
  partner: [],

  add(name, isPremium) {
    const clean = name.trim();
    if (!clean) return "already-there";
    // Case-insensitive, so "emma" and "Emma" are the same entry rather than two.
    if (get().has(clean)) return "already-there";
    if (!isPremium && get().shortlist.length >= FREE_SHORTLIST)
      return "limit-reached";
    set((s) => ({ shortlist: [...s.shortlist, clean] }));
    void get().persist();
    return "added";
  },

  remove(name) {
    const lower = name.trim().toLowerCase();
    set((s) => ({
      shortlist: s.shortlist.filter((n) => n.toLowerCase() !== lower),
    }));
    void get().persist();
  },

  has(name) {
    const lower = name.trim().toLowerCase();
    return get().shortlist.some((n) => n.toLowerCase() === lower);
  },

  clear() {
    set({ shortlist: [] });
    void get().persist();
  },

  myCode() {
    return encodeShortlist(get().shortlist);
  },

  setPartnerCode(code) {
    const names = decodeShortlist(code);
    // An empty or unreadable code clears rather than half-setting, so the agreed list never
    // reflects a partial paste.
    if (names.length === 0) {
      set({ partner: [] });
      return "empty";
    }
    set({ partner: names });
    void get().persist();
    return "set";
  },

  clearPartner() {
    set({ partner: [] });
    void get().persist();
  },

  agreed() {
    const { shortlist, partner } = get();
    return agreedNames(shortlist, partner);
  },

  async persist() {
    const { shortlist, partner } = get();
    try {
      await AsyncStorage.setItem(
        SHORTLIST_CACHE_KEY,
        JSON.stringify({ shortlist, partner }),
      );
    } catch {
      // A lost shortlist is survivable; a failed launch is not.
    }
  },

  async hydrate() {
    try {
      const raw = await AsyncStorage.getItem(SHORTLIST_CACHE_KEY);
      if (!raw) return;
      const parsed: unknown = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return;
      const record = parsed as Record<string, unknown>;
      set({
        shortlist: cleanNames(record.shortlist),
        partner: cleanNames(record.partner),
      });
    } catch {
      // Unreadable storage starts empty rather than preventing launch.
    }
  },
}));

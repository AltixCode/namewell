/**
 * The name pool actually shown to the player: the content-drip service's
 * current list once a sync has succeeded, the bundled `NAMES` until then.
 *
 * Refresh is "on launch, then leave it alone" — a full-sync pool has no
 * per-day cadence to chase, so there's nothing to poll for during a session.
 */
import { create } from "zustand";

import { NAMES, type NameEntry } from "@/logic/names";
import { cachedNamePool, fetchNamePool } from "@/content/sync";

interface NamePoolState {
  names: NameEntry[];
  /** True once a sync (successful or not) has completed at least once. */
  synced: boolean;
  refresh: () => Promise<void>;
}

export const useNamePoolStore = create<NamePoolState>((set) => ({
  names: NAMES,
  synced: false,

  async refresh() {
    const cached = await cachedNamePool();
    if (cached) set({ names: cached });

    const fresh = await fetchNamePool();
    set({ names: fresh, synced: true });
  },
}));

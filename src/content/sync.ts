/**
 * The one place that talks to content-drip for namewell's name pool.
 *
 * namewell's pool is FULL_SYNC, not daily-drip: there is no "today", just the
 * service's current full list, fetched and cached wholesale like a bundled
 * list would be. The bundled `NAMES` (`src/logic/names.ts`) is never deleted
 * and never stops working — it is the fallback whenever the service is
 * unreachable, slow, or answers with something malformed.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

import { NAMES, type NameEntry } from "@/logic/names";

/** Where the content service lives. Overridable for a staging build. */
export const CONTENT_BASE_URL =
  process.env.EXPO_PUBLIC_CONTENT_BASE_URL ?? "https://content.altixcode.com";

/** Short: this can run while someone is already browsing. */
const TIMEOUT_MS = 8_000;

const CACHE_KEY = "namewell.content.v1.names";

function isValidEntry(value: unknown): value is NameEntry {
  if (!value || typeof value !== "object") return false;
  const n = value as Record<string, unknown>;
  return (
    typeof n.name === "string" &&
    (n.gender === "girl" || n.gender === "boy" || n.gender === "either") &&
    typeof n.origin === "string" &&
    typeof n.meaning === "string" &&
    (n.syllables === undefined || typeof n.syllables === "number")
  );
}

function isValidPool(value: unknown): value is NameEntry[] {
  return Array.isArray(value) && value.length > 0 && value.every(isValidEntry);
}

async function readCache(): Promise<NameEntry[] | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isValidPool(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

async function writeCache(pool: NameEntry[]): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(pool));
  } catch {
    // A lost cache entry just costs one extra fetch next launch.
  }
}

/**
 * The cached pool from the last successful sync, if any — read on launch so
 * the UI can show the last-known-good remote list immediately while a fresh
 * sync runs in the background, rather than flashing the bundled list first.
 */
export async function cachedNamePool(): Promise<NameEntry[] | null> {
  return readCache();
}

/**
 * Fetches the service's current full name pool. Returns the bundled `NAMES`
 * on any failure — network, timeout, or a malformed response. Never throws.
 */
export async function fetchNamePool(): Promise<NameEntry[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const url = `${CONTENT_BASE_URL}/api/v1/namewell/names/all`;
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { accept: "application/json" },
    });
    if (!response.ok) throw new Error(`${response.status} from content-drip`);
    const body = (await response.json()) as { items?: unknown };
    if (isValidPool(body.items)) {
      void writeCache(body.items);
      return body.items;
    }
  } catch {
    // Network failure, timeout, or a malformed response: fall through.
  } finally {
    clearTimeout(timer);
  }
  return NAMES;
}

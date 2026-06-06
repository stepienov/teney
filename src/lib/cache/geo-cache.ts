import { CACHE_POLICY } from "@/lib/query/cache-policy";
import {
  clearTimedCache,
  readTimedCacheEntry,
  writeTimedCache,
} from "@/lib/cache/timed-cache";
import type { UserCoords } from "@/hooks/use-geolocation";

const { storageKey, maxAgeMs } = CACHE_POLICY.geo;

export function readGeoCache(): UserCoords | undefined {
  const entry = readTimedCacheEntry<UserCoords>(storageKey);
  return entry?.value;
}

export function isGeoCacheFresh(savedAt: number): boolean {
  return Date.now() - savedAt <= maxAgeMs;
}

export function readGeoCacheEntry():
  | { coords: UserCoords; savedAt: number; fresh: boolean }
  | undefined {
  const entry = readTimedCacheEntry<UserCoords>(storageKey);
  if (entry == null) {
    return undefined;
  }

  return {
    coords: entry.value,
    savedAt: entry.savedAt,
    fresh: isGeoCacheFresh(entry.savedAt),
  };
}

export function writeGeoCache(coords: UserCoords): void {
  writeTimedCache(storageKey, coords);
}

export function clearGeoCache(): void {
  clearTimedCache(storageKey);
}

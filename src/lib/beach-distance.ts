import { distanceKm as calculateDistanceKm } from "@/lib/geo/distance";
import type { UserCoords } from "@/hooks/use-geolocation";
import type { BeachPageWithDistances } from "@/lib/api/poi-search";
import type { PoiDto } from "@/lib/types/poi";

/** Odczyt mapy odległości z odpowiedzi API (Map lub po deserializacji). */
export function getDistancesKmFromPage(
  page: unknown,
): Map<number, number> | undefined {
  if (page == null || typeof page !== "object" || !("distancesKm" in page)) {
    return undefined;
  }

  const raw = (page as BeachPageWithDistances).distancesKm;
  if (raw instanceof Map) {
    return raw;
  }

  if (raw != null && typeof raw === "object") {
    const entries = Object.entries(raw as Record<string, number>).filter(
      ([, value]) => typeof value === "number" && Number.isFinite(value),
    );
    if (entries.length === 0) {
      return undefined;
    }
    return new Map(entries.map(([key, value]) => [Number(key), value]));
  }

  return undefined;
}

export function resolveBeachDistanceKm(
  beach: PoiDto,
  distancesKm: Map<number, number> | undefined,
  userCoords: UserCoords | undefined,
): number | undefined {
  const fromApi = distancesKm?.get(beach.id);
  if (fromApi != null) {
    return fromApi;
  }

  if (userCoords) {
    const km = calculateDistanceKm(userCoords, beach.coordinates);
    return km ?? undefined;
  }

  return undefined;
}

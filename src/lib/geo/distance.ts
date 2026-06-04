import type { Coordinates } from "@/lib/types/poi";

const EARTH_RADIUS_KM = 6371;

/** Great-circle distance in kilometres (WGS84). */
export function distanceKm(
  from: { lat: number; lon: number },
  to: Coordinates | null | undefined,
): number | null {
  if (to == null) return null;
  const lat1 = (from.lat * Math.PI) / 180;
  const lat2 = (to.latitude * Math.PI) / 180;
  const dLat = lat2 - lat1;
  const dLon = ((to.longitude - from.lon) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

export function formatDistanceKm(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

/** Najdłuższa typowa etykieta kafelka (ikona + tekst) — do dopasowania szerokości. */
export const DISTANCE_BADGE_WIDTH_LABEL = "999 km";

/** Stała szerokość (ikona + md: text-xs + px-2) dla kafelków odległości. */
export const distanceBadgeWidthClass = "w-[4.25rem] min-w-[4.25rem] max-w-[4.25rem]";

/** Bounding box ~radiusKm around a point (WGS84). */
export function bboxAround(
  lat: number,
  lon: number,
  radiusKm: number,
): {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
} {
  const latDelta = radiusKm / 111;
  const lonDelta =
    radiusKm / (111 * Math.cos((lat * Math.PI) / 180) || 0.01);
  return {
    minLat: Math.max(-90, lat - latDelta),
    maxLat: Math.min(90, lat + latDelta),
    minLon: Math.max(-180, lon - lonDelta),
    maxLon: Math.min(180, lon + lonDelta),
  };
}

import type { Coordinates } from "@/lib/types/poi";

export function buildMapsUrl(
  coordinates: Coordinates | null | undefined,
): string | null {
  if (coordinates == null) {
    return null;
  }

  const { latitude, longitude } = coordinates;

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
}

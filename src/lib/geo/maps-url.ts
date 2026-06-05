import type { Coordinates } from "@/lib/types/poi";

export function buildMapsUrl(
  coordinates: Coordinates | null | undefined,
  googlePlaceId?: string | null,
  placeLabel?: string | null,
): string | null {
  const placeId = googlePlaceId?.trim();
  if (placeId) {
    const query = placeLabel?.trim() || "x";
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}&query_place_id=${encodeURIComponent(placeId)}`;
  }

  if (coordinates == null) {
    return null;
  }

  const { latitude, longitude } = coordinates;

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
}

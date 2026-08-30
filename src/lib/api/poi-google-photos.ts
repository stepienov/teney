import { ApiError, apiJson } from "@/lib/api-client";
import type { PoiGooglePhotosResponse } from "@/lib/types/poi";

export function emptyGooglePhotos(poiId: number): PoiGooglePhotosResponse {
  return {
    poiId,
    googlePlaceId: null,
    attribution: "Google Maps",
    website: null,
    phone: null,
    openingHours: null,
    priceLevel: null,
    formattedAddress: null,
    photos: [],
  };
}

/** Live Place Photos + contact. URLs expire — never persist. */
export async function fetchPoiGooglePhotos(
  id: number,
): Promise<PoiGooglePhotosResponse> {
  try {
    return await apiJson<PoiGooglePhotosResponse>(
      `/api/pois/${id}/google-photos`,
      { cache: "no-store" },
    );
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 204)) {
      return emptyGooglePhotos(id);
    }
    return emptyGooglePhotos(id);
  }
}

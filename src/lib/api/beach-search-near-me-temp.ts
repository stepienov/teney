/**
 * TEMPORARY — remove when backend supports distance sort from user coordinates.
 *
 * TODO(BE): Add e.g. `sort: "distance"` with `filters["user.lat"]` / `filters["user.lon"]`
 * (or dedicated request fields) on POST /api/pois/search so pagination and sort stay server-side.
 * Until then, we fetch one bbox-limited page from the API (filters applied by BE) and only
 * re-order + paginate by haversine distance on the client.
 */
import {
  BEACH_PAGE_SIZE,
  NEAR_ME_FETCH_SIZE,
  NEAR_ME_RADIUS_KM,
  buildBeachSearchRequest,
  searchPois,
  type BeachPageWithDistances,
} from "@/lib/api/poi-search";
import { bboxAround, distanceKm } from "@/lib/geo/distance";
import type { PoiDto } from "@/lib/types/poi";

export type BeachNearMeSearchOptions = {
  locale: string;
  page: number;
  beachPointTypeId: number;
  userCoords: { lat: number; lon: number };
  name?: string;
  regionId?: number;
  municipalityId?: number;
  hasLifeguard?: boolean;
  hasShower?: boolean;
  isSandy?: boolean;
};

export async function searchBeachesNearMeTemp(
  options: BeachNearMeSearchOptions,
): Promise<BeachPageWithDistances> {
  const bbox = bboxAround(
    options.userCoords.lat,
    options.userCoords.lon,
    NEAR_ME_RADIUS_KM,
  );

  const response = await searchPois(
    buildBeachSearchRequest({
      locale: options.locale,
      page: 0,
      size: NEAR_ME_FETCH_SIZE,
      sort: "name",
      sortDirection: "ASC",
      beachPointTypeId: options.beachPointTypeId,
      name: options.name,
      regionId: options.regionId,
      municipalityId: options.municipalityId,
      hasLifeguard: options.hasLifeguard,
      hasShower: options.hasShower,
      isSandy: options.isSandy,
      bbox,
    }),
  );

  const ranked = response.content
    .map((poi) => ({
      poi,
      km: distanceKm(options.userCoords, poi.coordinates),
    }))
    .filter((row): row is { poi: PoiDto; km: number } => row.km != null)
    .sort((a, b) => a.km - b.km);

  const totalElements = ranked.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / BEACH_PAGE_SIZE));
  const pageIndex = Math.min(Math.max(0, options.page), totalPages - 1);
  const slice = ranked.slice(
    pageIndex * BEACH_PAGE_SIZE,
    pageIndex * BEACH_PAGE_SIZE + BEACH_PAGE_SIZE,
  );

  const distancesKm = new Map<number, number>();
  for (const row of slice) {
    distancesKm.set(row.poi.id, row.km);
  }

  return {
    content: slice.map((row) => row.poi),
    totalElements,
    totalPages,
    size: BEACH_PAGE_SIZE,
    number: pageIndex,
    first: pageIndex === 0,
    last: pageIndex >= totalPages - 1,
    numberOfElements: slice.length,
    empty: slice.length === 0,
    distancesKm,
  };
}

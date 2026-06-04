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
  DEFAULT_NEAR_ME_RADIUS_KM,
  NEAR_ME_FETCH_SIZE,
  buildBeachSearchRequest,
  searchPois,
  type BeachPageWithDistances,
} from "@/lib/api/poi-search";
import { bboxAround, distanceKm } from "@/lib/geo/distance";
import { poiMatchesGeoFilter } from "@/lib/beach-geo-filter";
import { poiMatchesSurfaceFilter } from "@/lib/beach-surface-filter";
import type { PoiDto } from "@/lib/types/poi";

export type BeachNearMeSearchOptions = {
  locale: string;
  page: number;
  pageSize?: number;
  sortDirection: "ASC" | "DESC";
  radiusKm?: number;
  beachPointTypeId: number;
  userCoords: { lat: number; lon: number };
  allowedBeachIds?: Set<number>;
  name?: string;
  regionId?: number;
  municipalityId?: number;
  hasLifeguard?: boolean;
  hasShower?: boolean;
  beachSurface?: string;
  beachSurfaces?: string[];
  regionNames?: string[];
  municipalityNames?: string[];
};

export async function searchBeachesNearMeTemp(
  options: BeachNearMeSearchOptions,
): Promise<BeachPageWithDistances> {
  const radiusKm = options.radiusKm ?? DEFAULT_NEAR_ME_RADIUS_KM;
  const bbox =
    radiusKm > 0
      ? bboxAround(options.userCoords.lat, options.userCoords.lon, radiusKm)
      : undefined;

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
      beachSurface: options.beachSurface,
      bbox,
    }),
  );

  const ranked = response.content
    .map((poi) => ({
      poi,
      km: distanceKm(options.userCoords, poi.coordinates),
    }))
    .filter((row): row is { poi: PoiDto; km: number } => row.km != null)
    .filter(
      (row) =>
        options.allowedBeachIds == null || options.allowedBeachIds.has(row.poi.id),
    )
    .filter((row) =>
      poiMatchesGeoFilter(
        row.poi,
        options.regionNames ?? [],
        options.municipalityNames ?? [],
      ),
    )
    .filter((row) =>
      poiMatchesSurfaceFilter(row.poi, options.beachSurfaces ?? []),
    )
    .filter((row) => radiusKm <= 0 || row.km <= radiusKm)
    .sort((a, b) =>
      options.sortDirection === "DESC" ? b.km - a.km : a.km - b.km,
    );

  const pageSize = options.pageSize ?? BEACH_PAGE_SIZE;
  const totalElements = ranked.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / pageSize));
  const pageIndex = Math.min(Math.max(0, options.page), totalPages - 1);
  const slice = ranked.slice(
    pageIndex * pageSize,
    pageIndex * pageSize + pageSize,
  );

  const distancesKm = new Map<number, number>();
  for (const row of slice) {
    distancesKm.set(row.poi.id, row.km);
  }

  return {
    content: slice.map((row) => row.poi),
    totalElements,
    totalPages,
    size: pageSize,
    number: pageIndex,
    first: pageIndex === 0,
    last: pageIndex >= totalPages - 1,
    numberOfElements: slice.length,
    empty: slice.length === 0,
    distancesKm,
  };
}

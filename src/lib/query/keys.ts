import type { UserCoords } from "@/hooks/use-geolocation";

/** POI list categories — extend when adding new explorers. */
export const POI_CATEGORY = {
  beaches: "beaches",
  miradores: "miradores",
  naturalPools: "naturalPools",
  naturalAttractions: "naturalAttractions",
  historicalSites: "historicalSites",
  museums: "museums",
  wineries: "wineries",
  familyAttractions: "familyAttractions",
  restaurants: "restaurants",
  kidsAttractions: "kidsAttractions",
  waterSports: "waterSports",
  shopping: "shopping",
  markets: "markets",
  recreationAreas: "recreationAreas",
  botanicalGardens: "botanicalGardens",
  towns: "towns",
} as const;

export type PoiCategory = (typeof POI_CATEGORY)[keyof typeof POI_CATEGORY];

export const referenceQueryKeys = {
  municipalities: ["reference", "municipalities"] as const,
};

export function poiSearchQueryKey(
  category: PoiCategory,
  params: unknown,
  nearMe: boolean,
  userCoords: UserCoords | undefined,
) {
  return [
    "poi",
    category,
    "search",
    params,
    nearMe ? geoCoordsKey(userCoords) : null,
  ] as const;
}

export function poiInfiniteSearchQueryKey(
  category: PoiCategory,
  params: unknown,
  pageSize: number,
  nearMe: boolean,
  userCoords: UserCoords | undefined,
) {
  return [
    "poi",
    category,
    "search-infinite",
    params,
    pageSize,
    nearMe ? geoCoordsKey(userCoords) : null,
  ] as const;
}

export function poiFiltersQueryKey(category: PoiCategory) {
  return ["poi", category, "filters"] as const;
}

export function poiGooglePhotosQueryKey(id: number) {
  return ["poi", id, "google-photos"] as const;
}

export function poiMapSearchQueryKey(
  category: PoiCategory,
  params: unknown,
  nearMe: boolean,
  userCoords: UserCoords | undefined,
) {
  return [
    "poi",
    category,
    "map-all",
    params,
    nearMe ? geoCoordsKey(userCoords) : null,
  ] as const;
}

/** Round coords so tiny GPS jitter does not invalidate cache keys. */
function geoCoordsKey(userCoords: UserCoords | undefined) {
  if (userCoords == null) {
    return "pending";
  }

  const round = (value: number) => Math.round(value * 1000) / 1000;
  return {
    lat: round(userCoords.lat),
    lon: round(userCoords.lon),
  };
}

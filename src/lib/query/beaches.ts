import { infiniteQueryOptions, keepPreviousData, queryOptions } from "@tanstack/react-query";

import { searchBeaches } from "@/lib/api/beach-search";
import { fetchMunicipalities } from "@/lib/api/reference";
import {
  DEFAULT_BEACH_PAGE_SIZE,
  MOBILE_BEACH_PAGE_SIZE,
} from "@/lib/beach-pagination";
import { CACHE_POLICY } from "@/lib/query/cache-policy";
import {
  POI_CATEGORY,
  poiFiltersQueryKey,
  poiInfiniteSearchQueryKey,
  poiMapSearchQueryKey,
  poiSearchQueryKey,
  referenceQueryKeys,
} from "@/lib/query/keys";
import type { UserCoords } from "@/hooks/use-geolocation";
import type { PoiDto } from "@/lib/types/poi";

export type BeachSearchParams = {
  locale: string;
  page: number;
  pageSize: number;
  sort: string;
  sortDirection: "ASC" | "DESC";
  nearMe?: boolean;
  radiusKm?: number;
  name?: string;
  regionIds?: string[];
  hasLifeguard?: boolean;
  hasShower?: boolean;
  beachSurfaces?: string[];
  hasSunbeds?: boolean;
  hasShopNearby?: boolean;
  hasRestaurantNearby?: boolean;
  dogFriendly?: boolean;
  hasWebcam?: boolean;
  dryToday?: boolean;
  lightWind?: boolean;
  clearSky?: boolean;
};

export type BeachSearchBaseParams = Omit<BeachSearchParams, "page" | "pageSize">;

/** API max page size — used when loading all beaches for the map. */
const MAP_SEARCH_PAGE_SIZE = 100;

/** @deprecated Use poiFiltersQueryKey(POI_CATEGORY.beaches). */
export const beachFiltersQueryKey = poiFiltersQueryKey(POI_CATEGORY.beaches);

function toSearchBeachesArgs(
  params: BeachSearchParams,
  userCoords: UserCoords | undefined,
) {
  return {
    locale: params.locale,
    page: params.page,
    size: params.pageSize,
    sort: params.sort,
    sortDirection: params.sortDirection,
    nearMe: params.nearMe,
    radiusKm: params.radiusKm,
    userCoords: params.nearMe ? userCoords : undefined,
    name: params.name,
    regionIds: params.regionIds,
    hasLifeguard: params.hasLifeguard,
    hasShower: params.hasShower,
    beachSurfaces: params.beachSurfaces,
    hasSunbeds: params.hasSunbeds,
    hasShopNearby: params.hasShopNearby,
    hasRestaurantNearby: params.hasRestaurantNearby,
    dogFriendly: params.dogFriendly,
    hasWebcam: params.hasWebcam,
    dryToday: params.dryToday,
    lightWind: params.lightWind,
    clearSky: params.clearSky,
  };
}

async function fetchAllBeachesForMap(
  params: BeachSearchBaseParams,
  userCoords: UserCoords | undefined,
): Promise<PoiDto[]> {
  const beaches: PoiDto[] = [];
  let pageNum = 0;

  while (true) {
    const page = await searchBeaches(
      toSearchBeachesArgs(
        { ...params, page: pageNum, pageSize: MAP_SEARCH_PAGE_SIZE },
        userCoords,
      ),
    );

    beaches.push(...page.content);

    if (page.last || page.empty) {
      break;
    }

    pageNum += 1;
  }

  return beaches;
}

export function beachFiltersQueryOptions() {
  return queryOptions({
    queryKey: poiFiltersQueryKey(POI_CATEGORY.beaches),
    queryFn: async () => {
      const municipalities = await fetchMunicipalities();
      return { municipalities };
    },
    staleTime: CACHE_POLICY.reference.staleTime,
    gcTime: CACHE_POLICY.reference.gcTime,
  });
}

export function beachSearchQueryOptions(
  params: BeachSearchParams,
  userCoords: UserCoords | undefined,
) {
  const nearMe = params.nearMe === true;

  return queryOptions({
    queryKey: poiSearchQueryKey(
      POI_CATEGORY.beaches,
      params,
      nearMe,
      userCoords,
    ),
    queryFn: () => searchBeaches(toSearchBeachesArgs(params, userCoords)),
    enabled: !nearMe || userCoords != null,
    staleTime: CACHE_POLICY.poiSearch.staleTime,
    gcTime: CACHE_POLICY.poiSearch.gcTime,
    placeholderData: keepPreviousData,
  });
}

export function beachSearchInfiniteQueryOptions(
  params: BeachSearchBaseParams,
  userCoords: UserCoords | undefined,
) {
  const pageSize = MOBILE_BEACH_PAGE_SIZE;
  const nearMe = params.nearMe === true;

  return infiniteQueryOptions({
    queryKey: poiInfiniteSearchQueryKey(
      POI_CATEGORY.beaches,
      params,
      pageSize,
      nearMe,
      userCoords,
    ),
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      searchBeaches(
        toSearchBeachesArgs(
          { ...params, page: pageParam, pageSize },
          userCoords,
        ),
      ),
    getNextPageParam: (lastPage) =>
      lastPage.last ? undefined : lastPage.number + 1,
    enabled: !nearMe || userCoords != null,
    staleTime: CACHE_POLICY.poiSearch.staleTime,
    gcTime: CACHE_POLICY.poiSearch.gcTime,
    placeholderData: keepPreviousData,
  });
}

export function beachMapSearchQueryOptions(
  params: BeachSearchBaseParams,
  userCoords: UserCoords | undefined,
) {
  const nearMe = params.nearMe === true;

  return queryOptions({
    queryKey: poiMapSearchQueryKey(
      POI_CATEGORY.beaches,
      params,
      nearMe,
      userCoords,
    ),
    queryFn: () => fetchAllBeachesForMap(params, userCoords),
    enabled: !nearMe || userCoords != null,
    staleTime: CACHE_POLICY.poiSearch.staleTime,
    gcTime: CACHE_POLICY.poiSearch.gcTime,
  });
}

export { DEFAULT_BEACH_PAGE_SIZE, MOBILE_BEACH_PAGE_SIZE };
export { referenceQueryKeys };

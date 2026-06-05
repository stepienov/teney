import { infiniteQueryOptions, keepPreviousData, queryOptions } from "@tanstack/react-query";

import { searchBeaches } from "@/lib/api/beach-search";
import { fetchMunicipalities } from "@/lib/api/reference";
import {
  DEFAULT_BEACH_PAGE_SIZE,
  MOBILE_BEACH_PAGE_SIZE,
} from "@/lib/beach-pagination";
import type { UserCoords } from "@/hooks/use-geolocation";

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

export const beachFiltersQueryKey = ["beach-filters"] as const;

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

export function beachFiltersQueryOptions() {
  return queryOptions({
    queryKey: beachFiltersQueryKey,
    queryFn: async () => {
      const municipalities = await fetchMunicipalities();
      return { municipalities };
    },
    staleTime: 5 * 60_000,
  });
}

export function beachSearchQueryOptions(
  params: BeachSearchParams,
  userCoords: UserCoords | undefined,
) {
  return queryOptions({
    queryKey: ["beaches", params, userCoords] as const,
    queryFn: () => searchBeaches(toSearchBeachesArgs(params, userCoords)),
    enabled: !params.nearMe || userCoords != null,
    placeholderData: keepPreviousData,
  });
}

export function beachSearchInfiniteQueryOptions(
  params: BeachSearchBaseParams,
  userCoords: UserCoords | undefined,
) {
  const pageSize = MOBILE_BEACH_PAGE_SIZE;

  return infiniteQueryOptions({
    queryKey: ["beaches-infinite", params, userCoords, pageSize] as const,
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
    enabled: !params.nearMe || userCoords != null,
    placeholderData: keepPreviousData,
  });
}

export { DEFAULT_BEACH_PAGE_SIZE, MOBILE_BEACH_PAGE_SIZE };

import { infiniteQueryOptions, keepPreviousData, queryOptions } from "@tanstack/react-query";

import { searchBeaches } from "@/lib/api/beach-search";
import { fetchBeachNameSuggestions } from "@/lib/api/poi-search";
import {
  fetchMunicipalities,
  resolveBeachPointTypeId,
} from "@/lib/api/reference";
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
  municipalityIds?: string[];
  regionNames?: string[];
  municipalityNames?: string[];
  hasLifeguard?: boolean;
  hasShower?: boolean;
  beachSurfaces?: string[];
  beachSurface?: string;
  hasSunbeds?: boolean;
  hasShopNearby?: boolean;
  hasRestaurantNearby?: boolean;
  dogFriendly?: boolean;
  hasWebcam?: boolean;
};

export type BeachSearchBaseParams = Omit<BeachSearchParams, "page" | "pageSize">;

export const beachFiltersQueryKey = ["beach-filters"] as const;

function toSearchBeachesArgs(
  params: BeachSearchParams,
  beachPointTypeId: number,
  userCoords: UserCoords | undefined,
) {
  return {
    locale: params.locale,
    page: params.page,
    size: params.pageSize,
    sort: params.sort,
    sortDirection: params.sortDirection,
    beachPointTypeId,
    nearMe: params.nearMe,
    radiusKm: params.radiusKm,
    userCoords: params.nearMe ? userCoords : undefined,
    name: params.name,
    regionIds: params.regionIds,
    municipalityIds: params.municipalityIds,
    regionNames: params.regionNames,
    municipalityNames: params.municipalityNames,
    hasLifeguard: params.hasLifeguard,
    hasShower: params.hasShower,
    beachSurface:
      params.beachSurfaces?.length === 1 ? params.beachSurfaces[0] : undefined,
    beachSurfaces: params.beachSurfaces,
    hasSunbeds: params.hasSunbeds,
    hasShopNearby: params.hasShopNearby,
    hasRestaurantNearby: params.hasRestaurantNearby,
    dogFriendly: params.dogFriendly,
    hasWebcam: params.hasWebcam,
  };
}

export function beachFiltersQueryOptions() {
  return queryOptions({
    queryKey: beachFiltersQueryKey,
    queryFn: async () => {
      const [municipalities, beachPointTypeId, beachNames] = await Promise.all([
        fetchMunicipalities(),
        resolveBeachPointTypeId(),
        fetchBeachNameSuggestions(),
      ]);
      return { municipalities, beachPointTypeId, beachNames };
    },
    staleTime: 5 * 60_000,
  });
}

export function beachSearchQueryOptions(
  params: BeachSearchParams,
  beachPointTypeId: number | undefined,
  userCoords: UserCoords | undefined,
) {
  return queryOptions({
    queryKey: ["beaches", params, beachPointTypeId, userCoords] as const,
    queryFn: async () => {
      if (beachPointTypeId == null) {
        throw new Error("Beach point type not loaded");
      }
      return searchBeaches(
        toSearchBeachesArgs(params, beachPointTypeId, userCoords),
      );
    },
    enabled:
      beachPointTypeId != null &&
      (!params.nearMe || userCoords != null),
    placeholderData: keepPreviousData,
  });
}

export function beachSearchInfiniteQueryOptions(
  params: BeachSearchBaseParams,
  beachPointTypeId: number | undefined,
  userCoords: UserCoords | undefined,
) {
  const pageSize = MOBILE_BEACH_PAGE_SIZE;

  return infiniteQueryOptions({
    queryKey: [
      "beaches-infinite",
      params,
      beachPointTypeId,
      userCoords,
      pageSize,
    ] as const,
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      if (beachPointTypeId == null) {
        throw new Error("Beach point type not loaded");
      }
      return searchBeaches(
        toSearchBeachesArgs(
          { ...params, page: pageParam, pageSize },
          beachPointTypeId,
          userCoords,
        ),
      );
    },
    getNextPageParam: (lastPage) =>
      lastPage.last ? undefined : lastPage.number + 1,
    enabled:
      beachPointTypeId != null &&
      (!params.nearMe || userCoords != null),
    placeholderData: keepPreviousData,
  });
}

export { DEFAULT_BEACH_PAGE_SIZE, MOBILE_BEACH_PAGE_SIZE };

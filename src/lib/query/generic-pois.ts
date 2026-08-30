import { infiniteQueryOptions, keepPreviousData, queryOptions } from "@tanstack/react-query";

import { searchGenericPois } from "@/lib/api/generic-poi-search";
import { fetchMunicipalities } from "@/lib/api/reference";
import { MOBILE_BEACH_PAGE_SIZE } from "@/lib/beach-pagination";
import type {
  PoiExplorerSearchBaseParams,
  PoiExplorerSearchParams,
} from "@/lib/poi-categories/types";
import { CACHE_POLICY } from "@/lib/query/cache-policy";
import {
  poiFiltersQueryKey,
  poiInfiniteSearchQueryKey,
  poiMapSearchQueryKey,
  poiSearchQueryKey,
  type PoiCategory,
} from "@/lib/query/keys";
import type { UserCoords } from "@/hooks/use-geolocation";
import type { PoiDto } from "@/lib/types/poi";

const MAP_SEARCH_PAGE_SIZE = 100;

type SearchParams = PoiExplorerSearchBaseParams & {
  page: number;
  pageSize: number;
};

function toSearchArgs(
  pointTypeDescription: string,
  params: SearchParams,
  userCoords: UserCoords | undefined,
) {
  return {
    locale: params.locale,
    page: params.page,
    size: params.pageSize,
    sort: params.sort,
    sortDirection: params.sortDirection,
    pointTypeDescription,
    nearMe: params.nearMe,
    radiusKm: params.radiusKm,
    userCoords: params.nearMe ? userCoords : undefined,
    name: params.name,
    regionIds: params.regionIds,
  };
}

async function fetchAllForMap(
  pointTypeDescription: string,
  params: PoiExplorerSearchBaseParams,
  userCoords: UserCoords | undefined,
): Promise<PoiDto[]> {
  const items: PoiDto[] = [];
  let pageNum = 0;
  while (true) {
    const page = await searchGenericPois(
      toSearchArgs(
        pointTypeDescription,
        { ...params, page: pageNum, pageSize: MAP_SEARCH_PAGE_SIZE },
        userCoords,
      ),
    );
    items.push(...page.content);
    if (page.last || page.empty || page.content.length === 0 || pageNum >= 40) {
      break;
    }
    pageNum += 1;
  }
  return items;
}

export function createGenericPoiQueryFns(
  category: PoiCategory,
  pointTypeDescription: string,
) {
  return {
    filtersQueryOptions() {
      return queryOptions({
        queryKey: poiFiltersQueryKey(category),
        queryFn: async () => {
          const municipalities = await fetchMunicipalities();
          return { municipalities };
        },
        staleTime: CACHE_POLICY.reference.staleTime,
        gcTime: CACHE_POLICY.reference.gcTime,
      });
    },
    searchQueryOptions(
      params: PoiExplorerSearchParams,
      userCoords: UserCoords | undefined,
    ) {
      const nearMe = params.nearMe === true;
      return queryOptions({
        queryKey: poiSearchQueryKey(category, params, nearMe, userCoords),
        queryFn: () =>
          searchGenericPois(toSearchArgs(pointTypeDescription, params, userCoords)),
        enabled: !nearMe || userCoords != null,
        staleTime: CACHE_POLICY.poiSearch.staleTime,
        gcTime: CACHE_POLICY.poiSearch.gcTime,
        placeholderData: keepPreviousData,
      });
    },
    searchInfiniteQueryOptions(
      params: PoiExplorerSearchBaseParams,
      userCoords: UserCoords | undefined,
    ) {
      const pageSize = MOBILE_BEACH_PAGE_SIZE;
      const nearMe = params.nearMe === true;
      return infiniteQueryOptions({
        queryKey: poiInfiniteSearchQueryKey(
          category,
          params,
          pageSize,
          nearMe,
          userCoords,
        ),
        initialPageParam: 0,
        queryFn: ({ pageParam }) =>
          searchGenericPois(
            toSearchArgs(
              pointTypeDescription,
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
    },
    mapSearchQueryOptions(
      params: PoiExplorerSearchBaseParams,
      userCoords: UserCoords | undefined,
    ) {
      const nearMe = params.nearMe === true;
      return queryOptions({
        queryKey: poiMapSearchQueryKey(category, params, nearMe, userCoords),
        queryFn: () => fetchAllForMap(pointTypeDescription, params, userCoords),
        enabled: !nearMe || userCoords != null,
        staleTime: CACHE_POLICY.poiSearch.staleTime,
        gcTime: CACHE_POLICY.poiSearch.gcTime,
      });
    },
  };
}

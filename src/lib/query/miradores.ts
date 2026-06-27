import { infiniteQueryOptions, keepPreviousData, queryOptions } from "@tanstack/react-query";

import { searchMiradores } from "@/lib/api/mirador-search";
import { fetchMunicipalities } from "@/lib/api/reference";
import {
  MOBILE_BEACH_PAGE_SIZE,
} from "@/lib/beach-pagination";
import type { PoiExplorerSearchBaseParams, PoiExplorerSearchParams } from "@/lib/poi-categories/types";
import { CACHE_POLICY } from "@/lib/query/cache-policy";
import {
  POI_CATEGORY,
  poiFiltersQueryKey,
  poiInfiniteSearchQueryKey,
  poiMapSearchQueryKey,
  poiSearchQueryKey,
} from "@/lib/query/keys";
import type { UserCoords } from "@/hooks/use-geolocation";
import type { PoiDto } from "@/lib/types/poi";

const MAP_SEARCH_PAGE_SIZE = 100;

type MiradorSearchRequestParams = PoiExplorerSearchBaseParams & {
  page: number;
  pageSize: number;
};

function toSearchMiradoresArgs(
  params: MiradorSearchRequestParams,
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
  };
}

async function fetchAllMiradoresForMap(
  params: PoiExplorerSearchBaseParams,
  userCoords: UserCoords | undefined,
): Promise<PoiDto[]> {
  const miradores: PoiDto[] = [];
  let pageNum = 0;

  while (true) {
    const page = await searchMiradores(
      toSearchMiradoresArgs(
        { ...params, page: pageNum, pageSize: MAP_SEARCH_PAGE_SIZE },
        userCoords,
      ),
    );

    miradores.push(...page.content);

    if (page.last || page.empty) {
      break;
    }

    pageNum += 1;
  }

  return miradores;
}

export function miradorFiltersQueryOptions() {
  return queryOptions({
    queryKey: poiFiltersQueryKey(POI_CATEGORY.miradores),
    queryFn: async () => {
      const municipalities = await fetchMunicipalities();
      return { municipalities };
    },
    staleTime: CACHE_POLICY.reference.staleTime,
    gcTime: CACHE_POLICY.reference.gcTime,
  });
}

export function miradorSearchQueryOptions(
  params: PoiExplorerSearchParams,
  userCoords: UserCoords | undefined,
) {
  const nearMe = params.nearMe === true;

  return queryOptions({
    queryKey: poiSearchQueryKey(
      POI_CATEGORY.miradores,
      params,
      nearMe,
      userCoords,
    ),
    queryFn: () => searchMiradores(toSearchMiradoresArgs(params, userCoords)),
    enabled: !nearMe || userCoords != null,
    staleTime: CACHE_POLICY.poiSearch.staleTime,
    gcTime: CACHE_POLICY.poiSearch.gcTime,
    placeholderData: keepPreviousData,
  });
}

export function miradorSearchInfiniteQueryOptions(
  params: PoiExplorerSearchBaseParams,
  userCoords: UserCoords | undefined,
) {
  const pageSize = MOBILE_BEACH_PAGE_SIZE;
  const nearMe = params.nearMe === true;

  return infiniteQueryOptions({
    queryKey: poiInfiniteSearchQueryKey(
      POI_CATEGORY.miradores,
      params,
      pageSize,
      nearMe,
      userCoords,
    ),
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      searchMiradores(
        toSearchMiradoresArgs(
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

export function miradorMapSearchQueryOptions(
  params: PoiExplorerSearchBaseParams,
  userCoords: UserCoords | undefined,
) {
  const nearMe = params.nearMe === true;

  return queryOptions({
    queryKey: poiMapSearchQueryKey(
      POI_CATEGORY.miradores,
      params,
      nearMe,
      userCoords,
    ),
    queryFn: () => fetchAllMiradoresForMap(params, userCoords),
    enabled: !nearMe || userCoords != null,
    staleTime: CACHE_POLICY.poiSearch.staleTime,
    gcTime: CACHE_POLICY.poiSearch.gcTime,
  });
}

export type MiradorSearchParams = PoiExplorerSearchParams;

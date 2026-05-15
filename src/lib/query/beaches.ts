import { queryOptions } from "@tanstack/react-query";

import {
  buildBeachSearchRequest,
  searchPois,
} from "@/lib/api/poi-search";
import {
  fetchMunicipalities,
  resolveBeachPointTypeId,
} from "@/lib/api/reference";

export type BeachSearchParams = {
  locale: string;
  page: number;
  sort: string;
  sortDirection: "ASC" | "DESC";
  name?: string;
  regionId?: number;
  municipalityId?: number;
  hasLifeguard?: boolean;
  hasShower?: boolean;
  isSandy?: boolean;
};

export const beachFiltersQueryKey = ["beach-filters"] as const;

export function beachFiltersQueryOptions() {
  return queryOptions({
    queryKey: beachFiltersQueryKey,
    queryFn: async () => {
      const [municipalities, beachPointTypeId] = await Promise.all([
        fetchMunicipalities(),
        resolveBeachPointTypeId(),
      ]);
      return { municipalities, beachPointTypeId };
    },
    staleTime: 5 * 60_000,
  });
}

export function beachSearchQueryOptions(
  params: BeachSearchParams,
  beachPointTypeId: number | undefined,
) {
  return queryOptions({
    queryKey: ["beaches", params, beachPointTypeId] as const,
    queryFn: async () => {
      if (beachPointTypeId == null) {
        throw new Error("Beach point type not loaded");
      }
      return searchPois(
        buildBeachSearchRequest({ ...params, beachPointTypeId }),
      );
    },
    enabled: beachPointTypeId != null,
  });
}

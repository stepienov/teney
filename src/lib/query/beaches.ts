import { queryOptions } from "@tanstack/react-query";

import { searchBeaches } from "@/lib/api/beach-search";
import {
  fetchMunicipalities,
  resolveBeachPointTypeId,
} from "@/lib/api/reference";
import type { UserCoords } from "@/hooks/use-geolocation";

export type BeachSearchParams = {
  locale: string;
  page: number;
  sort: string;
  sortDirection: "ASC" | "DESC";
  nearMe?: boolean;
  radiusKm?: number;
  name?: string;
  regionId?: number;
  municipalityId?: number;
  hasLifeguard?: boolean;
  hasShower?: boolean;
  beachSurface?: string;
  hasSunbeds?: boolean;
  hasShopNearby?: boolean;
  hasRestaurantNearby?: boolean;
  dogFriendly?: boolean;
  hasWebcam?: boolean;
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
  userCoords: UserCoords | undefined,
) {
  return queryOptions({
    queryKey: ["beaches", params, beachPointTypeId, userCoords] as const,
    queryFn: async () => {
      if (beachPointTypeId == null) {
        throw new Error("Beach point type not loaded");
      }
      return searchBeaches({
        locale: params.locale,
        page: params.page,
        sort: params.sort,
        sortDirection: params.sortDirection,
        beachPointTypeId,
        nearMe: params.nearMe,
        radiusKm: params.radiusKm,
        userCoords: params.nearMe ? userCoords : undefined,
        name: params.name,
        regionId: params.regionId,
        municipalityId: params.municipalityId,
        hasLifeguard: params.hasLifeguard,
        hasShower: params.hasShower,
        beachSurface: params.beachSurface,
        hasSunbeds: params.hasSunbeds,
        hasShopNearby: params.hasShopNearby,
        hasRestaurantNearby: params.hasRestaurantNearby,
        dogFriendly: params.dogFriendly,
        hasWebcam: params.hasWebcam,
      });
    },
    enabled:
      beachPointTypeId != null &&
      (!params.nearMe || userCoords != null),
  });
}

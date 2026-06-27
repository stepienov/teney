import { Waves } from "lucide-react";

import { DEFAULT_BEACH_SORT } from "@/components/beaches/beach-filter-state";
import type { BeachFilterState } from "@/components/beaches/beach-filter-state";
import { beachPath } from "@/lib/beach-slug";
import type { PoiCategoryExplorerConfig } from "@/lib/poi-categories/types";
import { POI_CATEGORY } from "@/lib/query/keys";
import {
  beachFiltersQueryOptions,
  beachMapSearchQueryOptions,
  beachSearchInfiniteQueryOptions,
  beachSearchQueryOptions,
  type BeachSearchBaseParams,
} from "@/lib/query/beaches";

function toBeachSearchBaseParams(
  filters: BeachFilterState,
  locale: string,
  nearMe: boolean,
  radiusKm: number,
): BeachSearchBaseParams {
  return {
    locale,
    sort: filters.sort,
    sortDirection: filters.sortDirection,
    nearMe,
    radiusKm,
    name: filters.name.trim() || undefined,
    regionIds: filters.regionIds.length > 0 ? filters.regionIds : undefined,
    hasLifeguard: filters.hasLifeguard || undefined,
    hasShower: filters.hasShower || undefined,
    beachSurfaces:
      filters.beachSurfaces.length > 0 ? filters.beachSurfaces : undefined,
    hasSunbeds: filters.hasSunbeds || undefined,
    hasShopNearby: filters.hasShopNearby || undefined,
    hasRestaurantNearby: filters.hasRestaurantNearby || undefined,
    dogFriendly: filters.dogFriendly || undefined,
    hasWebcam: filters.hasWebcam || undefined,
    dryToday: filters.dryToday || undefined,
    lightWind: filters.lightWind || undefined,
    clearSky: filters.clearSky || undefined,
  };
}

export const beachesExplorerConfig: PoiCategoryExplorerConfig = {
  category: POI_CATEGORY.beaches,
  basePath: "/beaches",
  messagesNamespace: "beaches",
  viewStorageKey: "teney-beach-view",
  defaultSort: DEFAULT_BEACH_SORT,
  features: {
    weather: true,
    beachAttributes: true,
  },
  poiPath: beachPath,
  placeholderIcon: Waves,
  filtersQueryOptions: beachFiltersQueryOptions,
  searchQueryOptions: beachSearchQueryOptions,
  searchInfiniteQueryOptions: beachSearchInfiniteQueryOptions,
  mapSearchQueryOptions: beachMapSearchQueryOptions,
  toSearchBaseParams: toBeachSearchBaseParams,
};

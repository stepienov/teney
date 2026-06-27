import type { LucideIcon } from "lucide-react";
import type {
  UseInfiniteQueryOptions,
  UseQueryOptions,
} from "@tanstack/react-query";

import type { BeachFilterState } from "@/components/beaches/beach-filter-state";
import type { BeachPageSize } from "@/lib/beach-pagination";
import type { PoiCategory } from "@/lib/query/keys";
import type { PoiDto } from "@/lib/types/poi";

export type PoiCategoryFeatures = {
  weather: boolean;
  beachAttributes: boolean;
};

export type PoiExplorerSearchBaseParams = {
  locale: string;
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

export type PoiExplorerSearchParams = PoiExplorerSearchBaseParams & {
  page: number;
  pageSize: BeachPageSize;
};

export type PoiSearchPage = {
  content: PoiDto[];
  totalPages: number;
  number: number;
  last: boolean;
  empty: boolean;
  distancesKm?: Map<number, number>;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export type PoiQueryOptions = UseQueryOptions<any, Error, any, any>;
export type PoiInfiniteQueryOptions = UseInfiniteQueryOptions<
  any,
  Error,
  any,
  any,
  any
>;
/* eslint-enable @typescript-eslint/no-explicit-any */

export type PoiCategoryExplorerConfig = {
  category: PoiCategory;
  basePath: string;
  messagesNamespace: "beaches" | "miradores";
  viewStorageKey: string;
  defaultSort: string;
  features: PoiCategoryFeatures;
  poiPath: (poi: Pick<PoiDto, "id" | "name">) => string;
  placeholderIcon: LucideIcon;
  filtersQueryOptions: () => PoiQueryOptions;
  searchQueryOptions: (
    params: PoiExplorerSearchParams,
    userCoords: { lat: number; lon: number; accuracyMeters: number } | undefined,
  ) => PoiQueryOptions;
  searchInfiniteQueryOptions: (
    params: PoiExplorerSearchBaseParams,
    userCoords: { lat: number; lon: number; accuracyMeters: number } | undefined,
  ) => PoiInfiniteQueryOptions;
  mapSearchQueryOptions: (
    params: PoiExplorerSearchBaseParams,
    userCoords: { lat: number; lon: number; accuracyMeters: number } | undefined,
  ) => PoiQueryOptions;
  toSearchBaseParams: (
    filters: BeachFilterState,
    locale: string,
    nearMe: boolean,
    radiusKm: number,
  ) => PoiExplorerSearchBaseParams;
};

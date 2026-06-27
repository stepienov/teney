import { Mountain } from "lucide-react";

import type { BeachFilterState } from "@/components/beaches/beach-filter-state";
import { miradorPath } from "@/lib/mirador-slug";
import type { PoiCategoryExplorerConfig } from "@/lib/poi-categories/types";
import { POI_CATEGORY } from "@/lib/query/keys";
import {
  miradorFiltersQueryOptions,
  miradorMapSearchQueryOptions,
  miradorSearchInfiniteQueryOptions,
  miradorSearchQueryOptions,
} from "@/lib/query/miradores";

const DEFAULT_MIRADOR_SORT = "name";

function toMiradorSearchBaseParams(
  filters: BeachFilterState,
  locale: string,
  nearMe: boolean,
  radiusKm: number,
) {
  return {
    locale,
    sort: filters.sort,
    sortDirection: filters.sortDirection,
    nearMe,
    radiusKm,
    name: filters.name.trim() || undefined,
    regionIds: filters.regionIds.length > 0 ? filters.regionIds : undefined,
  };
}

export const miradoresExplorerConfig: PoiCategoryExplorerConfig = {
  category: POI_CATEGORY.miradores,
  basePath: "/miradores",
  messagesNamespace: "miradores",
  viewStorageKey: "teney-mirador-view",
  defaultSort: DEFAULT_MIRADOR_SORT,
  features: {
    weather: false,
    beachAttributes: false,
  },
  poiPath: miradorPath,
  placeholderIcon: Mountain,
  filtersQueryOptions: miradorFiltersQueryOptions,
  searchQueryOptions: miradorSearchQueryOptions,
  searchInfiniteQueryOptions: miradorSearchInfiniteQueryOptions,
  mapSearchQueryOptions: miradorMapSearchQueryOptions,
  toSearchBaseParams: toMiradorSearchBaseParams,
};

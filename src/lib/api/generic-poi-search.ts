import { ApiError, apiJson } from "@/lib/api-client";
import { searchPois } from "@/lib/api/poi-search";
import type { UserCoords } from "@/hooks/use-geolocation";
import { parsePoiIdFromSlugParam } from "@/lib/poi-slug";
import type { PoiDto, PoiSearchRequest, SpringPage } from "@/lib/types/poi";

export type GenericPoiSearchOptions = {
  locale: string;
  page: number;
  size: number;
  sort: string;
  sortDirection: "ASC" | "DESC";
  pointTypeDescription: string;
  nearMe?: boolean;
  radiusKm?: number;
  userCoords?: UserCoords;
  name?: string;
  regionIds?: string[];
};

export type GenericPoiPageWithDistances = SpringPage<PoiDto> & {
  distancesKm: Map<number, number>;
};

export function buildGenericPoiSearchRequest(
  options: GenericPoiSearchOptions,
): PoiSearchRequest {
  const filters: PoiSearchRequest["filters"] = {
    "pointType.description": options.pointTypeDescription,
  };

  if (options.name?.trim()) {
    filters.name = options.name.trim();
  }
  if (options.regionIds && options.regionIds.length > 0) {
    filters["region.id"] = options.regionIds.map((id) => Number(id));
  }

  const nearMe = options.nearMe && options.userCoords != null;
  if (nearMe) {
    filters["near.lat"] = options.userCoords!.lat;
    filters["near.lon"] = options.userCoords!.lon;
    const radiusKm = options.radiusKm ?? 0;
    if (radiusKm > 0) {
      filters["near.radiusKm"] = radiusKm;
    }
  }

  let sort = options.sort;
  let sortDirection = options.sortDirection;
  if (nearMe) {
    sort = "distance";
    sortDirection = "ASC";
  } else if (sort === "location") {
    sort = "name";
  }

  return {
    filters,
    page: options.page,
    size: options.size,
    sort,
    sortDirection,
    locale: options.locale,
  };
}

export async function searchGenericPois(
  options: GenericPoiSearchOptions,
): Promise<GenericPoiPageWithDistances> {
  const page = await searchPois(buildGenericPoiSearchRequest(options));
  return {
    ...page,
    distancesKm: new Map(),
  };
}

/** GET /api/pois/{id}?locale= — same JSON as a POST /api/pois/search row. */
export async function fetchPoiById(
  id: number,
  locale: string,
): Promise<PoiDto | null> {
  const params = new URLSearchParams({ locale });
  try {
    const poi = await apiJson<PoiDto>(`/api/pois/${id}?${params.toString()}`);
    if (poi.beachDetails == null) {
      return {
        ...poi,
        weather: null,
        weatherStatus: "NOT_APPLICABLE",
      };
    }
    return poi;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function fetchPoiBySlug(
  slug: string,
  locale: string,
): Promise<PoiDto | null> {
  const id = parsePoiIdFromSlugParam(slug);
  if (id == null) {
    return null;
  }
  return fetchPoiById(id, locale);
}

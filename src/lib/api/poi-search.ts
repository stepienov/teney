import { apiPost } from "@/lib/api-client";
import type { PoiDto, PoiSearchRequest, SpringPage } from "@/lib/types/poi";

export const BEACH_PAGE_SIZE = 10;
export const NEAR_ME_RADIUS_KM = 50;
/** Max page size allowed by POST /api/pois/search (used only in near-me temp flow). */
export const NEAR_ME_FETCH_SIZE = 100;

/** POST /api/pois/search */
export async function searchPois(
  request: PoiSearchRequest,
): Promise<SpringPage<PoiDto>> {
  return apiPost<SpringPage<PoiDto>>("/api/pois/search", request);
}

export type BeachSearchBuildOptions = {
  locale: string;
  page: number;
  sort: string;
  sortDirection: "ASC" | "DESC";
  beachPointTypeId: number;
  name?: string;
  regionId?: number;
  municipalityId?: number;
  hasLifeguard?: boolean;
  hasShower?: boolean;
  isSandy?: boolean;
  bbox?: {
    minLat: number;
    maxLat: number;
    minLon: number;
    maxLon: number;
  };
  size?: number;
};

/** Builds the JSON body for POST /api/pois/search. */
export function buildBeachSearchRequest(
  options: BeachSearchBuildOptions,
): PoiSearchRequest {
  const filters: Record<string, string | number | boolean> = {
    "pointType.id": options.beachPointTypeId,
  };

  if (options.name?.trim()) {
    filters.name = options.name.trim();
  }
  if (options.regionId != null) {
    filters["region.id"] = options.regionId;
  }
  if (options.municipalityId != null) {
    filters["municipality.id"] = options.municipalityId;
  }
  if (options.hasLifeguard) {
    filters["details.hasLifeguard"] = true;
  }
  if (options.hasShower) {
    filters["details.hasShower"] = true;
  }
  if (options.isSandy) {
    filters["details.isSandy"] = true;
  }
  if (options.bbox) {
    filters["bbox.minLat"] = options.bbox.minLat;
    filters["bbox.maxLat"] = options.bbox.maxLat;
    filters["bbox.minLon"] = options.bbox.minLon;
    filters["bbox.maxLon"] = options.bbox.maxLon;
  }

  return {
    filters,
    page: options.page,
    size: options.size ?? BEACH_PAGE_SIZE,
    sort: options.sort,
    sortDirection: options.sortDirection,
    locale: options.locale,
  };
}

export type BeachPageWithDistances = SpringPage<PoiDto> & {
  distancesKm: Map<number, number>;
};

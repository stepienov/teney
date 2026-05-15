import { apiPost } from "@/lib/api-client";
import type { PoiDto, PoiSearchRequest, SpringPage } from "@/lib/types/poi";

export const BEACH_PAGE_SIZE = 10;

export async function searchPois(
  request: PoiSearchRequest,
): Promise<SpringPage<PoiDto>> {
  return apiPost<SpringPage<PoiDto>>("/api/pois/search", request);
}

export function buildBeachSearchRequest(options: {
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
}): PoiSearchRequest {
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

  return {
    filters,
    page: options.page,
    size: BEACH_PAGE_SIZE,
    sort: options.sort,
    sortDirection: options.sortDirection,
    locale: options.locale,
  };
}

import { apiJson, apiPost } from "@/lib/api-client";
import type {
  BeachAttributes,
  PoiDto,
  PoiSearchRequest,
  SpringPage,
} from "@/lib/types/poi";

export const BEACH_PAGE_SIZE = 10;
export const DEFAULT_NEAR_ME_RADIUS_KM = 0;
/** Max page size allowed by POST /api/pois/search (used only in near-me temp flow). */
export const NEAR_ME_FETCH_SIZE = 100;

/** POST /api/pois/search */
export async function searchPois(
  request: PoiSearchRequest,
): Promise<SpringPage<PoiDto>> {
  const path = request.includeBeachWeather
    ? "/api/pois/search?includeBeachWeather=true"
    : "/api/pois/search";
  const body = { ...request };
  delete body.includeBeachWeather;

  return apiPost<SpringPage<PoiDto>>(path, body);
}

export type BeachAttributeIndexItem = {
  id: number;
  attributes: BeachAttributes | null;
};

type BeachNameSuggestionItem = {
  name: string | null;
};

export async function fetchBeachAttributeIndex(): Promise<
  BeachAttributeIndexItem[]
> {
  const beaches = await apiJson<BeachAttributeIndexItem[]>("/api/beaches");

  return beaches.map((beach) => ({
    id: beach.id,
    attributes: beach.attributes ?? null,
  }));
}

export async function fetchBeachNameSuggestions(): Promise<string[]> {
  const beaches = await apiJson<BeachNameSuggestionItem[]>("/api/beaches");

  return Array.from(
    new Set(
      beaches
        .map((beach) => beach.name?.trim())
        .filter((name): name is string => Boolean(name)),
    ),
  ).sort((a, b) => a.localeCompare(b));
}

export type BeachSearchBuildOptions = {
  locale: string;
  page: number;
  sort: string;
  sortDirection: "ASC" | "DESC";
  beachPointTypeId?: number;
  id?: number;
  name?: string;
  regionId?: number;
  municipalityId?: number;
  regionNames?: string[];
  municipalityNames?: string[];
  hasLifeguard?: boolean;
  hasShower?: boolean;
  beachSurface?: string;
  hasSunbeds?: boolean;
  hasShopNearby?: boolean;
  hasRestaurantNearby?: boolean;
  dogFriendly?: boolean;
  hasWebcam?: boolean;
  includeBeachWeather?: boolean;
  weatherDate?: string;
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
  const filters: Record<string, string | number | boolean> = {};

  if (options.id != null) {
    filters.id = options.id;
  }
  if (options.beachPointTypeId != null) {
    filters["pointType.id"] = options.beachPointTypeId;
  }
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
  if (options.beachSurface) {
    filters["details.beachSurface"] = options.beachSurface;
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
    includeBeachWeather: options.includeBeachWeather,
    weatherDate: options.weatherDate,
  };
}

export type BeachPageWithDistances = SpringPage<PoiDto> & {
  distancesKm: Map<number, number>;
};

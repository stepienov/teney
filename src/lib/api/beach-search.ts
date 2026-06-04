import { searchBeachesNearMeTemp } from "@/lib/api/beach-search-near-me-temp";
import { apiJson } from "@/lib/api-client";
import {
  apiGeoFilterIds,
  needsClientGeoFilter,
  poiMatchesGeoFilter,
} from "@/lib/beach-geo-filter";
import {
  apiSurfaceFilter,
  needsClientSurfaceFilter,
  poiMatchesSurfaceFilter,
} from "@/lib/beach-surface-filter";
import {
  BEACH_PAGE_SIZE,
  buildBeachSearchRequest,
  fetchBeachAttributeIndex,
  searchPois,
  type BeachPageWithDistances,
  type BeachSearchBuildOptions,
} from "@/lib/api/poi-search";
import type { PoiDto, SpringPage } from "@/lib/types/poi";
import type { UserCoords } from "@/hooks/use-geolocation";

type BeachViewDetail = Pick<
  PoiDto,
  "id" | "attributes" | "beachDetails" | "visitorLimit" | "openingHours" | "address"
>;

export type BeachSearchOptions = BeachSearchBuildOptions & {
  nearMe?: boolean;
  radiusKm?: number;
  userCoords?: UserCoords;
  regionIds?: string[];
  municipalityIds?: string[];
  beachSurfaces?: string[];
};

function isTruthyAttribute(value: unknown): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return value.trim().toUpperCase() === "TRUE";
  }

  return false;
}

function hasAttributeFilters(options: BeachSearchOptions): boolean {
  return Boolean(
    options.hasSunbeds ||
      options.hasShopNearby ||
      options.hasRestaurantNearby ||
      options.dogFriendly ||
      options.hasWebcam,
  );
}

async function matchingBeachIdsForAttributes(
  options: BeachSearchOptions,
): Promise<Set<number> | null> {
  if (!hasAttributeFilters(options)) {
    return null;
  }

  const index = await fetchBeachAttributeIndex();

  return new Set(
    index
      .filter((beach) => {
        const attrs = beach.attributes;

        if (attrs == null) {
          return false;
        }

        if (options.hasSunbeds && !isTruthyAttribute(attrs.sunbeds_boolean)) {
          return false;
        }
        if (options.hasShopNearby && !isTruthyAttribute(attrs.shop_nearby_boolean)) {
          return false;
        }
        if (
          options.hasRestaurantNearby &&
          !isTruthyAttribute(attrs.restaurant_nearby_boolean)
        ) {
          return false;
        }
        if (options.dogFriendly && !isTruthyAttribute(attrs.dog_friendly_boolean)) {
          return false;
        }
        if (options.hasWebcam && !attrs.webcam_link) {
          return false;
        }

        return true;
      })
      .map((beach) => beach.id),
  );
}

function paginateContent(
  content: PoiDto[],
  page: number,
): SpringPage<PoiDto> {
  const totalElements = content.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / BEACH_PAGE_SIZE));
  const pageIndex = Math.min(Math.max(0, page), totalPages - 1);
  const slice = content.slice(
    pageIndex * BEACH_PAGE_SIZE,
    pageIndex * BEACH_PAGE_SIZE + BEACH_PAGE_SIZE,
  );

  return {
    content: slice,
    totalElements,
    totalPages,
    size: BEACH_PAGE_SIZE,
    number: pageIndex,
    first: pageIndex === 0,
    last: pageIndex >= totalPages - 1,
    numberOfElements: slice.length,
    empty: slice.length === 0,
  };
}

function filterByGeoNames(
  content: PoiDto[],
  regionNames: string[] | undefined,
  municipalityNames: string[] | undefined,
): PoiDto[] {
  const regions = regionNames ?? [];
  const municipalities = municipalityNames ?? [];

  if (regions.length === 0 && municipalities.length === 0) {
    return content;
  }

  return content.filter((poi) => poiMatchesGeoFilter(poi, regions, municipalities));
}

function filterBySurfaces(content: PoiDto[], surfaces: string[] | undefined): PoiDto[] {
  const selected = surfaces ?? [];
  if (selected.length === 0) {
    return content;
  }
  return content.filter((poi) => poiMatchesSurfaceFilter(poi, selected));
}

/**
 * Beach list search — always goes through POST /api/pois/search.
 */
export async function searchBeaches(
  options: BeachSearchOptions,
): Promise<SpringPage<PoiDto> | BeachPageWithDistances> {
  const { nearMe, userCoords, regionNames, municipalityNames, ...apiOptions } =
    options;
  const beachPointTypeId = apiOptions.beachPointTypeId;
  const attributeIds = await matchingBeachIdsForAttributes(options);
  const regionIds = options.regionIds ?? [];
  const municipalityIds = options.municipalityIds ?? [];
  const beachSurfaces = options.beachSurfaces ?? [];
  const clientGeo = needsClientGeoFilter(regionIds, municipalityIds);
  const clientSurface = needsClientSurfaceFilter(beachSurfaces);
  const apiGeo = apiGeoFilterIds(regionIds, municipalityIds);
  const apiSurface = apiSurfaceFilter(beachSurfaces);

  if (beachPointTypeId == null) {
    throw new Error("Beach point type is required for beach search");
  }

  if (nearMe && userCoords != null) {
    return searchBeachesNearMeTemp({
      locale: apiOptions.locale,
      page: apiOptions.page,
      sortDirection: apiOptions.sortDirection,
      radiusKm: options.radiusKm,
      beachPointTypeId,
      userCoords,
      allowedBeachIds: attributeIds ?? undefined,
      name: apiOptions.name,
      regionId: clientGeo ? undefined : apiGeo.regionId,
      municipalityId: clientGeo ? undefined : apiGeo.municipalityId,
      regionNames: clientGeo ? regionNames : undefined,
      municipalityNames: clientGeo ? municipalityNames : undefined,
      hasLifeguard: apiOptions.hasLifeguard,
      hasShower: apiOptions.hasShower,
      beachSurface: clientSurface ? undefined : apiSurface,
      beachSurfaces: clientSurface ? beachSurfaces : undefined,
    });
  }

  const useClientPipeline = attributeIds != null || clientGeo || clientSurface;

  if (useClientPipeline) {
    const response = await searchPois(
      buildBeachSearchRequest({
        ...apiOptions,
        ...apiGeo,
        beachSurface: clientSurface ? undefined : apiSurface,
        page: 0,
        size: 100,
      }),
    );

    let filtered = response.content;
    if (attributeIds != null) {
      filtered = filtered.filter((poi) => attributeIds.has(poi.id));
    }
    if (clientGeo) {
      filtered = filterByGeoNames(filtered, regionNames, municipalityNames);
    }
    if (clientSurface) {
      filtered = filterBySurfaces(filtered, beachSurfaces);
    }

    return paginateContent(filtered, apiOptions.page);
  }

  return searchPois(
    buildBeachSearchRequest({
      ...apiOptions,
      ...apiGeo,
      beachSurface: apiSurface,
    }),
  );
}

export async function fetchBeachById(options: {
  id: number;
  locale: string;
  weatherDate?: string;
}): Promise<PoiDto | null> {
  async function fetchBeachViewDetail(): Promise<BeachViewDetail | null> {
    const beaches = await apiJson<BeachViewDetail[]>(
      `/api/beaches?ids=${options.id}`,
    );

    return beaches[0] ?? null;
  }

  async function enrichBeach(beach: PoiDto | null): Promise<PoiDto | null> {
    if (beach == null) {
      return null;
    }

    try {
      const detail = await fetchBeachViewDetail();

      if (detail == null) {
        return beach;
      }

      return {
        ...beach,
        attributes: detail.attributes ?? beach.attributes,
        beachDetails: detail.beachDetails ?? beach.beachDetails,
        visitorLimit: detail.visitorLimit ?? beach.visitorLimit,
        openingHours: detail.openingHours ?? beach.openingHours,
        address: detail.address ?? beach.address,
      };
    } catch (error) {
      console.error("Failed to enrich beach details with /api/beaches.", error);
      return beach;
    }
  }

  async function fetchMatchingBeach(includeBeachWeather: boolean) {
    const response = await searchPois(
      {
        filters: {
          id: options.id,
        },
        locale: options.locale,
        size: 1,
        includeBeachWeather,
        weatherDate: options.weatherDate,
      },
    );

    return response.content[0] ?? null;
  }

  try {
    return enrichBeach(await fetchMatchingBeach(true));
  } catch (error) {
    console.error(
      "Failed to load extended beach weather; falling back to basic beach details.",
      error,
    );
  }

  return enrichBeach(await fetchMatchingBeach(false));
}

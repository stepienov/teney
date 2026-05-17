import { searchBeachesNearMeTemp } from "@/lib/api/beach-search-near-me-temp";
import { apiJson } from "@/lib/api-client";
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

function paginateFilteredPage(
  content: PoiDto[],
  ids: Set<number>,
  page: number,
): SpringPage<PoiDto> {
  const filtered = content.filter((poi) => ids.has(poi.id));
  const totalElements = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / BEACH_PAGE_SIZE));
  const pageIndex = Math.min(Math.max(0, page), totalPages - 1);
  const slice = filtered.slice(
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

/**
 * Beach list search — always goes through POST /api/pois/search.
 * Filters, sort, page and size are sent to the API (see buildBeachSearchRequest).
 */
export async function searchBeaches(
  options: BeachSearchOptions,
): Promise<SpringPage<PoiDto> | BeachPageWithDistances> {
  const { nearMe, userCoords, ...apiOptions } = options;
  const beachPointTypeId = apiOptions.beachPointTypeId;
  const attributeIds = await matchingBeachIdsForAttributes(options);

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
      regionId: apiOptions.regionId,
      municipalityId: apiOptions.municipalityId,
      hasLifeguard: apiOptions.hasLifeguard,
      hasShower: apiOptions.hasShower,
      beachSurface: apiOptions.beachSurface,
    });
  }

  if (attributeIds != null) {
    const response = await searchPois(
      buildBeachSearchRequest({
        ...apiOptions,
        page: 0,
        size: 100,
      }),
    );

    return paginateFilteredPage(response.content, attributeIds, apiOptions.page);
  }

  return searchPois(buildBeachSearchRequest(apiOptions));
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

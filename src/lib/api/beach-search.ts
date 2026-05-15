import { searchBeachesNearMeTemp } from "@/lib/api/beach-search-near-me-temp";
import {
  buildBeachSearchRequest,
  searchPois,
  type BeachPageWithDistances,
  type BeachSearchBuildOptions,
} from "@/lib/api/poi-search";
import type { PoiDto, SpringPage } from "@/lib/types/poi";
import type { UserCoords } from "@/hooks/use-geolocation";

export type BeachSearchOptions = BeachSearchBuildOptions & {
  nearMe?: boolean;
  userCoords?: UserCoords;
};

/**
 * Beach list search — always goes through POST /api/pois/search.
 * Filters, sort, page and size are sent to the API (see buildBeachSearchRequest).
 */
export async function searchBeaches(
  options: BeachSearchOptions,
): Promise<SpringPage<PoiDto> | BeachPageWithDistances> {
  const { nearMe, userCoords, ...apiOptions } = options;

  if (nearMe && userCoords != null) {
    return searchBeachesNearMeTemp({
      locale: apiOptions.locale,
      page: apiOptions.page,
      beachPointTypeId: apiOptions.beachPointTypeId,
      userCoords,
      name: apiOptions.name,
      regionId: apiOptions.regionId,
      municipalityId: apiOptions.municipalityId,
      hasLifeguard: apiOptions.hasLifeguard,
      hasShower: apiOptions.hasShower,
      isSandy: apiOptions.isSandy,
    });
  }

  return searchPois(buildBeachSearchRequest(apiOptions));
}

import { ApiError, apiJson, apiPost } from "@/lib/api-client";
import type { UserCoords } from "@/hooks/use-geolocation";
import { parseMiradorIdFromSlugParam } from "@/lib/mirador-slug";
import type {
  MiradorListItemDto,
  MiradorSearchFilterValue,
  MiradorSearchRequest,
} from "@/lib/types/mirador-list";
import type { PoiDto, SpringPage } from "@/lib/types/poi";

export type MiradorPageWithDistances = SpringPage<PoiDto> & {
  distancesKm: Map<number, number>;
};

export type MiradorSearchOptions = {
  locale: string;
  page: number;
  size: number;
  sort: string;
  sortDirection: "ASC" | "DESC";
  nearMe?: boolean;
  radiusKm?: number;
  userCoords?: UserCoords;
  name?: string;
  regionIds?: string[];
};

export function miradorListItemToPoiDto(item: MiradorListItemDto): PoiDto {
  return {
    id: item.id,
    name: item.name,
    description: null,
    tips: null,
    coordinates: item.coordinates,
    footprintGeoJson: null,
    municipality: item.municipalityName,
    region: item.regionName,
    isFree: null,
    ticketPrice: null,
    ticketPriceResident: null,
    currencyCode: null,
    photoUrl: item.photoUrl,
    googlePlaceId: item.googlePlaceId,
    quality: item.quality,
    popularity: item.popularity,
    openingHours: null,
    visitorLimit: null,
    address: null,
    weather: null,
    displayWeather: null,
    beachDetails: null,
    beachWeather: null,
    attributes: item.attributes,
  };
}

export function buildMiradoresSearchRequest(
  options: MiradorSearchOptions,
): MiradorSearchRequest {
  const filters: Record<string, MiradorSearchFilterValue> = {};

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

function mapMiradorSearchPage(
  page: SpringPage<MiradorListItemDto>,
): MiradorPageWithDistances {
  const distancesKm = new Map<number, number>();
  const content = page.content.map((item) => {
    if (item.distanceKm != null && Number.isFinite(item.distanceKm)) {
      distancesKm.set(item.id, item.distanceKm);
    }
    return miradorListItemToPoiDto(item);
  });

  return {
    ...page,
    content,
    distancesKm,
  };
}

/** GET /api/miradores/{id} — single mirador detail. */
export async function fetchMiradorById(options: {
  id: number;
  locale: string;
}): Promise<PoiDto | null> {
  const params = new URLSearchParams({
    locale: options.locale,
  });

  try {
    const item = await apiJson<MiradorListItemDto>(
      `/api/miradores/${options.id}?${params.toString()}`,
    );
    return miradorListItemToPoiDto(item);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

/** Resolve a mirador from `/miradores/{slug}` (`{id}-{name}` or legacy numeric id). */
export async function fetchMiradorBySlug(
  slug: string,
  locale: string,
): Promise<PoiDto | null> {
  const id = parseMiradorIdFromSlugParam(slug);
  if (id == null) {
    return null;
  }

  return fetchMiradorById({ id, locale });
}

/** POST /api/miradores/search — mirador list. */
export async function searchMiradores(
  options: MiradorSearchOptions,
): Promise<MiradorPageWithDistances> {
  if (options.nearMe && options.userCoords == null) {
    throw new Error("User coordinates are required for near-me mirador search");
  }

  const page = await apiPost<SpringPage<MiradorListItemDto>>(
    "/api/miradores/search",
    buildMiradoresSearchRequest(options),
  );

  return mapMiradorSearchPage(page);
}

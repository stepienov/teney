import { ApiError, apiJson, apiPost } from "@/lib/api-client";
import type { UserCoords } from "@/hooks/use-geolocation";
import {
  beachMatchesNameOnlySlug,
  parseBeachIdFromSlugParam,
  unslugifyBeachName,
} from "@/lib/beach-slug";
import type {
  BeachDisplayWeather,
  BeachListItemDto,
  BeachSearchFilterValue,
  BeachSearchRequest,
} from "@/lib/types/beach-list";
import type { PoiDto, SpringPage, Weather } from "@/lib/types/poi";

export type BeachPageWithDistances = SpringPage<PoiDto> & {
  distancesKm: Map<number, number>;
};

export type BeachSearchOptions = {
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
  weatherDate?: string;
};

/** Today in Atlantic/Canary (matches BE beach_display_weather day). */
export function defaultBeachWeatherDate(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Atlantic/Canary",
  }).format(new Date());
}

function mapDisplayWeather(weather: BeachDisplayWeather): Weather {
  return {
    temperature: weather.tempMax ?? weather.feelsLike ?? null,
    conditions: weather.conditions ?? null,
    windSpeed: weather.windSpeed ?? null,
    windDirection: null,
    cloudCover: weather.cloudCover ?? null,
    precipitation: weather.precipProb ?? null,
    uvIndex: weather.uvIndex ?? null,
  };
}

export function beachListItemToPoiDto(item: BeachListItemDto): PoiDto {
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
    openingHours: null,
    visitorLimit: null,
    address: null,
    weather: item.weather ? mapDisplayWeather(item.weather) : null,
    displayWeather: item.weather,
    beachDetails: item.beachDetails,
    beachWeather: null,
    attributes: item.attributes,
  };
}

export function buildBeachesSearchRequest(
  options: BeachSearchOptions,
): BeachSearchRequest {
  const filters: Record<string, BeachSearchFilterValue> = {};

  if (options.name?.trim()) {
    filters.name = options.name.trim();
  }
  if (options.hasLifeguard) {
    filters["details.hasLifeguard"] = true;
  }
  if (options.hasShower) {
    filters["details.hasShower"] = true;
  }
  if (options.beachSurfaces && options.beachSurfaces.length > 0) {
    filters["details.beachSurface"] = options.beachSurfaces;
  }
  if (options.regionIds && options.regionIds.length > 0) {
    filters["region.id"] = options.regionIds.map((id) => Number(id));
  }
  if (options.hasSunbeds) {
    filters["attributes.hasSunbeds"] = true;
  }
  if (options.hasShopNearby) {
    filters["attributes.hasShopNearby"] = true;
  }
  if (options.hasRestaurantNearby) {
    filters["attributes.hasRestaurantNearby"] = true;
  }
  if (options.dogFriendly) {
    filters["attributes.dogFriendly"] = true;
  }
  if (options.hasWebcam) {
    filters["attributes.hasWebcam"] = true;
  }
  if (options.dryToday) {
    filters["weather.dryToday"] = true;
  }
  if (options.lightWind) {
    filters["weather.lightWind"] = true;
  }
  if (options.clearSky) {
    filters["weather.clearSky"] = true;
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
  } else if (sort === "weather.tempMax") {
    sortDirection = "DESC";
  } else if (
    sort === "weather.windSpeed" ||
    sort === "windSpeed" ||
    sort === "wind"
  ) {
    sort = "weather.windSpeed";
    sortDirection = "ASC";
  }

  return {
    filters,
    page: options.page,
    size: options.size,
    sort,
    sortDirection,
    locale: options.locale,
    weatherDate: options.weatherDate ?? defaultBeachWeatherDate(),
  };
}

function mapBeachSearchPage(
  page: SpringPage<BeachListItemDto>,
): BeachPageWithDistances {
  const distancesKm = new Map<number, number>();
  const content = page.content.map((item) => {
    if (item.distanceKm != null && Number.isFinite(item.distanceKm)) {
      distancesKm.set(item.id, item.distanceKm);
    }
    return beachListItemToPoiDto(item);
  });

  return {
    ...page,
    content,
    distancesKm,
  };
}

/** GET /api/beaches/{id} — single beach detail. */
export async function fetchBeachById(options: {
  id: number;
  locale: string;
  weatherDate?: string;
}): Promise<PoiDto | null> {
  const params = new URLSearchParams({
    locale: options.locale,
    weatherDate: options.weatherDate ?? defaultBeachWeatherDate(),
  });

  try {
    const item = await apiJson<BeachListItemDto>(
      `/api/beaches/${options.id}?${params.toString()}`,
    );
    return beachListItemToPoiDto(item);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

/** Resolve a beach from `/beaches/{slug}` (name slug or legacy numeric id). */
export async function fetchBeachBySlug(
  slug: string,
  locale: string,
  weatherDate?: string,
): Promise<PoiDto | null> {
  const id = parseBeachIdFromSlugParam(slug);
  if (id != null) {
    return fetchBeachById({ id, locale, weatherDate });
  }

  const page = await searchBeaches({
    locale,
    page: 0,
    size: 100,
    sort: "name",
    sortDirection: "ASC",
    name: unslugifyBeachName(slug),
    weatherDate,
  });

  const matches = page.content.filter((beach) =>
    beachMatchesNameOnlySlug(beach, slug),
  );
  return matches[0] ?? null;
}

/** POST /api/beaches/search — beach list (grid, table, map). */
export async function searchBeaches(
  options: BeachSearchOptions,
): Promise<BeachPageWithDistances> {
  if (options.nearMe && options.userCoords == null) {
    throw new Error("User coordinates are required for near-me beach search");
  }

  const page = await apiPost<SpringPage<BeachListItemDto>>(
    "/api/beaches/search",
    buildBeachesSearchRequest(options),
  );

  return mapBeachSearchPage(page);
}

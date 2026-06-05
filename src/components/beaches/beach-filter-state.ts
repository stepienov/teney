export const BEACH_SURFACE_OPTIONS = [
  "LIGHT_SAND",
  "VOLCANIC_SAND",
  "STONES",
] as const;

export type BeachSurfaceOption = (typeof BEACH_SURFACE_OPTIONS)[number];

export const DEFAULT_BEACH_SORT = "weather.tempMax";

export type BeachFilterState = {
  name: string;
  regionIds: string[];
  sort: string;
  sortDirection: "ASC" | "DESC";
  dryToday: boolean;
  lightWind: boolean;
  clearSky: boolean;
  hasLifeguard: boolean;
  hasShower: boolean;
  beachSurfaces: string[];
  hasSunbeds: boolean;
  hasShopNearby: boolean;
  hasRestaurantNearby: boolean;
  dogFriendly: boolean;
  hasWebcam: boolean;
};

export const EMPTY_BEACH_FILTERS: BeachFilterState = {
  name: "",
  regionIds: [],
  sort: DEFAULT_BEACH_SORT,
  sortDirection: "ASC",
  dryToday: false,
  lightWind: false,
  clearSky: false,
  hasLifeguard: false,
  hasShower: false,
  beachSurfaces: [],
  hasSunbeds: false,
  hasShopNearby: false,
  hasRestaurantNearby: false,
  dogFriendly: false,
  hasWebcam: false,
};

export function toggleFilterId(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((item) => item !== id) : [...list, id];
}

export function countAttributeFilters(value: BeachFilterState): number {
  let count = 0;
  if (value.hasLifeguard) count += 1;
  if (value.hasShower) count += 1;
  if (value.hasSunbeds) count += 1;
  if (value.hasShopNearby) count += 1;
  if (value.hasRestaurantNearby) count += 1;
  if (value.dogFriendly) count += 1;
  if (value.hasWebcam) count += 1;
  count += value.beachSurfaces.length;
  return count;
}

export function hasAttributeFilters(value: BeachFilterState): boolean {
  return countAttributeFilters(value) > 0;
}

export function clearAttributeFilters(value: BeachFilterState): BeachFilterState {
  return {
    ...value,
    hasLifeguard: false,
    hasShower: false,
    beachSurfaces: [],
    hasSunbeds: false,
    hasShopNearby: false,
    hasRestaurantNearby: false,
    dogFriendly: false,
    hasWebcam: false,
  };
}

export function clearRegionFilters(value: BeachFilterState): BeachFilterState {
  return { ...value, regionIds: [] };
}

export function hasWeatherFilters(value: BeachFilterState): boolean {
  return value.dryToday || value.lightWind || value.clearSky;
}

export function clearWeatherFilters(value: BeachFilterState): BeachFilterState {
  return { ...value, dryToday: false, lightWind: false, clearSky: false };
}

export function clearBeachFilters(value: BeachFilterState): BeachFilterState {
  return clearRegionFilters(clearAttributeFilters(clearWeatherFilters(value)));
}

export function hasGeoFilters(value: BeachFilterState): boolean {
  return value.regionIds.length > 0;
}

export function hasBeachFilters(value: BeachFilterState): boolean {
  return (
    hasAttributeFilters(value) || hasGeoFilters(value) || hasWeatherFilters(value)
  );
}

export function hasActiveFilters(value: BeachFilterState): boolean {
  return (
    Boolean(value.name.trim()) ||
    countAttributeFilters(value) > 0 ||
    hasGeoFilters(value)
  );
}

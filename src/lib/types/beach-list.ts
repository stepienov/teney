import type { BeachAttributes, BeachDetails, Coordinates } from "@/lib/types/poi";

export type BeachDisplayWeather = {
  weatherDate: string;
  tempMin: number | null;
  tempMax: number | null;
  feelsLike: number | null;
  precipProb: number | null;
  windSpeed: number | null;
  uvIndex: number | null;
  cloudCover: number | null;
  conditions: string | null;
  description: string | null;
  fetchedAt: string | null;
};

export type BeachListItemDto = {
  id: number;
  name: string;
  photoUrl: string | null;
  googlePlaceId: string | null;
  coordinates: Coordinates | null;
  municipalityId: number | null;
  municipalityName: string | null;
  regionId: number | null;
  regionName: string | null;
  beachDetails: BeachDetails | null;
  attributes: BeachAttributes | null;
  distanceKm: number | null;
  weather: BeachDisplayWeather | null;
  quality?: "MODEST" | "DECENT" | "GREAT" | null;
  popularity?: "QUIET" | "KNOWN" | "PACKED" | null;
};

export type BeachSearchFilterValue =
  | string
  | number
  | boolean
  | string[]
  | number[];

export type BeachSearchRequest = {
  filters?: Record<string, BeachSearchFilterValue>;
  page?: number;
  size?: number;
  sort?: string;
  sortDirection?: "ASC" | "DESC";
  locale?: string;
  includeUnknownBeachDetails?: boolean;
  weatherDate?: string;
};

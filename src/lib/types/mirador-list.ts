import type { BeachAttributes, Coordinates } from "@/lib/types/poi";

export type MiradorListItemDto = {
  id: number;
  name: string;
  photoUrl: string | null;
  googlePlaceId: string | null;
  coordinates: Coordinates | null;
  municipalityId: number | null;
  municipalityName: string | null;
  regionId: number | null;
  regionName: string | null;
  attributes: BeachAttributes | null;
  distanceKm: number | null;
};

export type MiradorSearchFilterValue =
  | string
  | number
  | boolean
  | string[]
  | number[];

export type MiradorSearchRequest = {
  filters?: Record<string, MiradorSearchFilterValue>;
  page?: number;
  size?: number;
  sort?: string;
  sortDirection?: "ASC" | "DESC";
  locale?: string;
};

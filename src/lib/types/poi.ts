export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type BeachDetails = {
  isSandy: boolean | null;
  hasShower: boolean | null;
  hasLifeguard: boolean | null;
  beachSurface: string | null;
  boatAccessOnly: boolean | null;
};

export type PoiDto = {
  id: number;
  name: string;
  description: string | null;
  tips: string | null;
  coordinates: Coordinates | null;
  municipality: string | null;
  region: string | null;
  isFree: boolean | null;
  ticketPrice: number | null;
  currencyCode: string | null;
  photoUrl: string | null;
  beachDetails: BeachDetails | null;
};

export type SpringPage<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
};

export type PoiSearchRequest = {
  filters?: Record<string, string | number | boolean>;
  page?: number;
  size?: number;
  sort?: string;
  sortDirection?: "ASC" | "DESC";
  locale?: string;
  includeUnknownBeachDetails?: boolean;
};

export type MunicipalityRef = {
  id: number;
  name: string;
  regionDirectionId: number;
  regionDirectionName: string;
};

export type PointTypeRef = {
  id: number;
  description: string;
};

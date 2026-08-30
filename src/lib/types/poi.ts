import type { BeachDisplayWeather } from "@/lib/types/beach-list";

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type BeachDetails = {
  hasShower: boolean | null;
  hasLifeguard: boolean | null;
  beachSurface: string | null;
  boatAccessOnly: boolean | null;
};

export type PointType = {
  id: number;
  description: string;
};

export type PoiPhoto = {
  id: number;
  url: string;
  main: boolean;
};

export type PlaceQuality = "MODEST" | "DECENT" | "GREAT";

export type PlacePopularity = "QUIET" | "KNOWN" | "PACKED";

export type GooglePlacePhoto = {
  url: string;
  authorDisplayName: string | null;
  authorUri: string | null;
  authorPhotoUri: string | null;
  googleMapsUri: string | null;
  flagContentUri: string | null;
};

export type PoiGooglePhotosResponse = {
  poiId: number;
  googlePlaceId: string | null;
  attribution: "Google Maps";
  website: string | null;
  phone: string | null;
  openingHours: string | null;
  priceLevel: string | null;
  formattedAddress: string | null;
  photos: GooglePlacePhoto[];
};

export type ViewpointDetails = {
  hasOceanView: boolean | null;
  carAccessEasy: boolean | null;
  hikingRequired: boolean | null;
  hikingDistanceM: number | null;
  hasParking: boolean | null;
};

export type NaturalPoolDetails = {
  tideDependent: boolean | null;
  rockyAccess: boolean | null;
  carAccessEasy: boolean | null;
  hikingRequired: boolean | null;
  hikingDistanceM: number | null;
  hasParking: boolean | null;
};

export type NaturalAttractionDetails = {
  naturalFeatureType: string | null;
  isProtectedArea: boolean | null;
  protectedAreaName: string | null;
  bookingRequired: boolean | null;
  guidedTourAvailable: boolean | null;
};

export type HistoricalSiteDetails = Record<string, never>;

export type RestaurantDetails = {
  isGuachinche: boolean | null;
  bookingRequired: boolean | null;
};

export type ShopDetails = {
  bookingRequired: boolean | null;
};

export type WineryDetails = {
  tastingAvailable: boolean | null;
  bookingRequired: boolean | null;
};

export type BookingFamilyDetails = {
  bookingRequired: boolean | null;
};

export type Address = {
  id: number;
  street: string | null;
  houseNumber: string | null;
  apartmentNumber: string | null;
  portal: string | null;
  floorNumber: string | null;
  postalCode: string | null;
  city: string | null;
  municipality: string | null;
  extraInfo: string | null;
};

export type WeatherReadinessStatus =
  | "READY"
  | "PENDING"
  | "MISSING"
  | "NOT_APPLICABLE";

export type Weather = {
  temperature: number | null;
  conditions?: string | null;
  windSpeed: number | null;
  windDirection: number | null;
  cloudCover: number | null;
  precipitation?: number | null;
  uvIndex?: number | null;
};

export type WeatherDataPoint = {
  date: string;
  data: JsonValue;
};

export type BeachWeather = {
  todayDaily?: JsonValue | null;
  historicalSameDay: WeatherDataPoint[] | null;
  hourlyNext3?: JsonValue | null;
  todayHourlyUntil20?: JsonValue | null;
  forecastNext3Days: JsonValue | null;
};

export type BeachAttributes = {
  sunbeds_boolean?: boolean | string | null;
  shop_nearby_boolean?: boolean | string | null;
  restaurant_nearby_boolean?: boolean | string | null;
  dog_friendly_boolean?: boolean | string | null;
  webcam_link?: string | null;
  [key: string]: JsonValue | undefined;
};

export type PoiDto = {
  id: number;
  name: string;
  description: string | null;
  tips: string | null;
  coordinates: Coordinates | null;
  footprintGeoJson: JsonValue | null;
  municipality: string | null;
  region: string | null;
  isFree: boolean | null;
  ticketPrice: number | null;
  ticketPriceResident: number | null;
  currencyCode: string | null;
  photoUrl?: string | null;
  openingHours: string | null;
  visitorLimit: number | null;
  address: Address | null;
  weather: Weather | null;
  weatherStatus?: WeatherReadinessStatus;
  beachDetails: BeachDetails | null;
  beachWeather: BeachWeather | null;
  beachWeatherStatus?: WeatherReadinessStatus | null;
  attributes?: BeachAttributes | null;
  /** Daily display weather from beach list search (`beach_display_weather`). */
  displayWeather?: BeachDisplayWeather | null;
  googlePlaceId?: string | null;
  pointType?: PointType | null;
  quality?: PlaceQuality | null;
  popularity?: PlacePopularity | null;
  googleMapsUrl?: string | null;
  website?: string | null;
  phone?: string | null;
  googleTypes?: string | null;
  primaryType?: string | null;
  priceLevel?: string | null;
  formattedAddress?: string | null;
  entranceFeeInfo?: string | null;
  hikingRequired?: boolean | null;
  visitDurationMinutes?: number | null;
  publicTransportInfo?: string | null;
  hasParking?: boolean | null;
  parkingOptions?: string | null;
  bestTimeToVisitText?: string | null;
  photos?: PoiPhoto[];
  viewpointDetails?: ViewpointDetails | null;
  naturalPoolDetails?: NaturalPoolDetails | null;
  naturalAttractionDetails?: NaturalAttractionDetails | null;
  historicalSiteDetails?: HistoricalSiteDetails | null;
  restaurantDetails?: RestaurantDetails | null;
  shopDetails?: ShopDetails | null;
  museumDetails?: BookingFamilyDetails | null;
  wineryDetails?: WineryDetails | null;
  familyAttractionDetails?: BookingFamilyDetails | null;
  kidsAttractionDetails?: BookingFamilyDetails | null;
  waterSportsDetails?: BookingFamilyDetails | null;
  marketDetails?: BookingFamilyDetails | null;
  recreationAreaDetails?: BookingFamilyDetails | null;
  botanicalGardenDetails?: BookingFamilyDetails | null;
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
  filters?: Record<string, string | number | boolean | number[] | string[]>;
  page?: number;
  size?: number;
  sort?: string;
  sortDirection?: "ASC" | "DESC";
  locale?: string;
  includeUnknownBeachDetails?: boolean;
  includeBeachWeather?: boolean;
  weatherDate?: string;
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

export type PoiWeatherBatchRequest = {
  ids: number[];
  includeBeachWeather?: boolean;
  weatherDate?: string;
};

export type PoiWeatherEntry = {
  poiId: number;
  currentStatus: WeatherReadinessStatus;
  current: Weather | null;
  beachStatus?: WeatherReadinessStatus | null;
  beachWeather?: BeachWeather | null;
};

export type PoiWeatherBatchResponse = {
  entries: PoiWeatherEntry[];
  readyCount: number;
  pendingCount: number;
  complete: boolean;
};

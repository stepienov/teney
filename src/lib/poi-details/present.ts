import type {
  GooglePlacePhoto,
  PoiDto,
  PoiGooglePhotosResponse,
} from "@/lib/types/poi";

function asTrimmedString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export const POI_CATEGORY_DETAILS_KEYS = [
  "viewpointDetails",
  "naturalPoolDetails",
  "naturalAttractionDetails",
  "historicalSiteDetails",
  "restaurantDetails",
  "shopDetails",
  "museumDetails",
  "wineryDetails",
  "familyAttractionDetails",
  "kidsAttractionDetails",
  "waterSportsDetails",
  "marketDetails",
  "recreationAreaDetails",
  "botanicalGardenDetails",
] as const satisfies readonly (keyof PoiDto)[];

const DETAIL_ALLOWLIST: Record<
  (typeof POI_CATEGORY_DETAILS_KEYS)[number],
  readonly string[]
> = {
  viewpointDetails: [
    "hasOceanView",
    "carAccessEasy",
    "hikingRequired",
    "hikingDistanceM",
    "hasParking",
  ],
  naturalPoolDetails: [
    "tideDependent",
    "rockyAccess",
    "carAccessEasy",
    "hikingRequired",
    "hikingDistanceM",
    "hasParking",
  ],
  naturalAttractionDetails: [
    "naturalFeatureType",
    "isProtectedArea",
    "protectedAreaName",
    "bookingRequired",
    "guidedTourAvailable",
  ],
  historicalSiteDetails: [],
  restaurantDetails: ["bookingRequired"],
  shopDetails: ["bookingRequired"],
  museumDetails: ["bookingRequired"],
  wineryDetails: ["tastingAvailable", "bookingRequired"],
  familyAttractionDetails: ["bookingRequired"],
  kidsAttractionDetails: ["bookingRequired"],
  waterSportsDetails: ["bookingRequired"],
  marketDetails: ["bookingRequired"],
  recreationAreaDetails: ["bookingRequired"],
  botanicalGardenDetails: ["bookingRequired"],
};

const LONG_TEXT_KEYS = new Set(["protectedAreaName"]);

const PRICE_LEVEL_PREFIX = "PRICE_LEVEL_";

export type GalleryPhoto = {
  id: number;
  url: string;
  authorDisplayName?: string | null;
  authorUri?: string | null;
  googleMapsUri?: string | null;
  flagContentUri?: string | null;
};

export type CategoryDetailEntry = {
  key: string;
  value: boolean | number | string;
  kind: "boolean" | "number" | "text" | "longText";
};

export type ActiveCategoryDetails = {
  key: (typeof POI_CATEGORY_DETAILS_KEYS)[number];
  details: Record<string, unknown>;
};

export function isPresentValue(value: unknown): boolean {
  if (value == null) {
    return false;
  }
  if (typeof value === "string") {
    return value.trim().length > 0;
  }
  return true;
}

export function googlePhotosToGallery(
  photos: GooglePlacePhoto[],
): GalleryPhoto[] {
  return photos.slice(0, 8).flatMap((photo, index) => {
    const url = photo.url?.trim();
    if (!url) {
      return [];
    }
    return [
      {
        id: index,
        url,
        authorDisplayName: photo.authorDisplayName,
        authorUri: photo.authorUri,
        googleMapsUri: photo.googleMapsUri,
        flagContentUri: photo.flagContentUri,
      },
    ];
  });
}

export function activeCategoryDetails(
  poi: PoiDto,
): ActiveCategoryDetails | null {
  for (const key of POI_CATEGORY_DETAILS_KEYS) {
    const value = poi[key];
    if (value != null && typeof value === "object") {
      return { key, details: value as Record<string, unknown> };
    }
  }
  return null;
}

export function categoryDetailEntries(
  poi: PoiDto,
): CategoryDetailEntry[] {
  const active = activeCategoryDetails(poi);
  if (active == null) {
    return [];
  }
  const allow = DETAIL_ALLOWLIST[active.key];
  const entries: CategoryDetailEntry[] = [];
  for (const field of allow) {
    const raw = active.details[field];
    if (!isPresentValue(raw)) {
      continue;
    }
    if (typeof raw === "boolean") {
      entries.push({ key: field, value: raw, kind: "boolean" });
      continue;
    }
    if (typeof raw === "number") {
      entries.push({ key: field, value: raw, kind: "number" });
      continue;
    }
    if (typeof raw === "string") {
      const value = raw.trim();
      entries.push({
        key: field,
        value,
        kind: LONG_TEXT_KEYS.has(field) || value.length > 48 ? "longText" : "text",
      });
    }
  }
  return entries;
}

export type OpeningHourRow = {
  day: string;
  hours: string;
};

const ALL_DAY_PATTERN =
  /open\s*24\s*hours|24\s*hours|24\/7|24\s*h\b|całodobow|abierto\s*24|rund\s*um\s*die\s*uhr/i;

export function parseDisplayOpeningHours(
  value: string | null | undefined,
): OpeningHourRow[] | null {
  const raw = asTrimmedString(value);
  if (raw == null) {
    return null;
  }

  const lines = raw
    .split(/\s*\|\s*|\n/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (lines.length === 0) {
    return null;
  }

  if (lines.every((line) => ALL_DAY_PATTERN.test(line))) {
    return null;
  }

  const rows: OpeningHourRow[] = lines.map((line) => {
    const colon = line.indexOf(":");
    if (colon <= 0 || colon > 24) {
      return { day: "", hours: line };
    }
    return {
      day: line.slice(0, colon).trim(),
      hours: line.slice(colon + 1).trim() || line,
    };
  });

  if (rows.every((row) => ALL_DAY_PATTERN.test(row.hours))) {
    return null;
  }

  return rows;
}

export function formatOpeningHours(value: string): string {
  return value
    .split(/\s*\|\s*/)
    .map((part) => part.trim())
    .filter(Boolean)
    .join("\n");
}

export function telHref(phone: string): string {
  const compact = phone.replace(/[^\d+]/g, "");
  return `tel:${compact || phone.trim()}`;
}

export function normalizePriceLevel(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) {
    return null;
  }
  const token = trimmed.startsWith(PRICE_LEVEL_PREFIX)
    ? trimmed.slice(PRICE_LEVEL_PREFIX.length)
    : trimmed;
  if (token === "UNSPECIFIED") {
    return null;
  }
  return token;
}

export function liveContactFromGooglePhotos(live: PoiGooglePhotosResponse): {
  website: string | null;
  phone: string | null;
  openingHours: OpeningHourRow[] | null;
  priceLevel: string | null;
  formattedAddress: string | null;
} {
  return {
    website: asTrimmedString(live.website),
    phone: asTrimmedString(live.phone),
    openingHours: parseDisplayOpeningHours(asTrimmedString(live.openingHours)),
    priceLevel: normalizePriceLevel(asTrimmedString(live.priceLevel)),
    formattedAddress: asTrimmedString(live.formattedAddress),
  };
}

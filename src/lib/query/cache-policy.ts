/** Shared FE cache timings — tune per data category. */
export const CACHE_POLICY = {
  /** Municipalities, regions, point types. */
  reference: {
    staleTime: 30 * 60_000,
    gcTime: 60 * 60_000,
  },
  /** Paginated list/search (beaches and future POI categories). */
  poiSearch: {
    staleTime: 2 * 60_000,
    gcTime: 30 * 60_000,
  },
  /** Single POI detail pages. */
  poiDetail: {
    staleTime: 10 * 60_000,
    gcTime: 60 * 60_000,
  },
  /** Live Place Photos — URLs expire; do not persist. */
  googlePhotos: {
    staleTime: 0,
    gcTime: 60_000,
  },
  /** Session-persisted React Query snapshot. */
  queryPersist: {
    maxAgeMs: 30 * 60_000,
    storageKey: "teney-query-cache",
  },
  /** Browser geolocation (localStorage). */
  geo: {
    maxAgeMs: 5 * 60_000,
    storageKey: "teney-geo-cache",
  },
} as const;

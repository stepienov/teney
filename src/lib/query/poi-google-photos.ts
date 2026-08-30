import { queryOptions } from "@tanstack/react-query";

import { fetchPoiGooglePhotos } from "@/lib/api/poi-google-photos";
import { CACHE_POLICY } from "@/lib/query/cache-policy";
import { poiGooglePhotosQueryKey } from "@/lib/query/keys";

export function poiGooglePhotosQueryOptions(id: number) {
  return queryOptions({
    queryKey: poiGooglePhotosQueryKey(id),
    queryFn: () => fetchPoiGooglePhotos(id),
    staleTime: CACHE_POLICY.googlePhotos.staleTime,
    gcTime: CACHE_POLICY.googlePhotos.gcTime,
    refetchOnMount: "always",
  });
}

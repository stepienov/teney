import { cache } from "react";

import { fetchPoiGooglePhotos } from "@/lib/api/poi-google-photos";

/** Dedupes live Place Photo fetches across Suspense boundaries on one page. */
export const getPoiGooglePhotosCached = cache(fetchPoiGooglePhotos);

import { getPublicApiBaseUrl } from "@/lib/env";

const GOOGLE_CDN_HOST =
  /google(?:apis|usercontent)\.com|ggpht\.com|places\.googleapis/i;

function isGooglePlacesCdnUrl(url: string): boolean {
  return GOOGLE_CDN_HOST.test(url);
}

/** Absolute or API-relative `/media/pois/...` cover URLs. */
export function resolvePoiMediaUrl(url: string | null | undefined): string | null {
  if (url == null) {
    return null;
  }
  const trimmed = url.trim();
  if (!trimmed) {
    return null;
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  if (trimmed.startsWith("/")) {
    return `${getPublicApiBaseUrl()}${trimmed}`;
  }
  return trimmed;
}

/** List/map/teaser: owner media only — never Google Place Photo CDNs. */
export function resolveOwnerMediaUrl(
  url: string | null | undefined,
): string | null {
  const resolved = resolvePoiMediaUrl(url);
  if (resolved == null || isGooglePlacesCdnUrl(resolved)) {
    return null;
  }
  return resolved;
}

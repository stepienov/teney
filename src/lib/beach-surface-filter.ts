import type { PoiDto } from "@/lib/types/poi";

export function poiMatchesSurfaceFilter(
  poi: PoiDto,
  surfaces: string[],
): boolean {
  if (surfaces.length === 0) {
    return true;
  }

  const surface = poi.beachDetails?.beachSurface;
  return surface != null && surfaces.includes(surface);
}

export function needsClientSurfaceFilter(surfaces: string[]): boolean {
  return surfaces.length > 1;
}

export function apiSurfaceFilter(surfaces: string[]): string | undefined {
  return surfaces.length === 1 ? surfaces[0] : undefined;
}

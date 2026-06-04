import type { MunicipalityRef, PoiDto } from "@/lib/types/poi";
import { uniqueRegions } from "@/lib/api/reference";

export function resolveGeoFilterNames(
  municipalities: MunicipalityRef[],
  regionIds: string[],
  municipalityIds: string[],
): { regionNames: string[]; municipalityNames: string[] } {
  const regions = uniqueRegions(municipalities);
  const regionNames = regionIds
    .map((id) => regions.find((region) => String(region.id) === id)?.name)
    .filter((name): name is string => Boolean(name));
  const municipalityNames = municipalityIds
    .map((id) => municipalities.find((m) => String(m.id) === id)?.name)
    .filter((name): name is string => Boolean(name));

  return { regionNames, municipalityNames };
}

export function poiMatchesGeoFilter(
  poi: PoiDto,
  regionNames: string[],
  municipalityNames: string[],
): boolean {
  if (regionNames.length === 0 && municipalityNames.length === 0) {
    return true;
  }

  const regionMatch =
    regionNames.length > 0 && poi.region != null && regionNames.includes(poi.region);
  const municipalityMatch =
    municipalityNames.length > 0 &&
    poi.municipality != null &&
    municipalityNames.includes(poi.municipality);

  if (regionNames.length > 0 && municipalityNames.length > 0) {
    return regionMatch || municipalityMatch;
  }

  if (regionNames.length > 0) {
    return regionMatch;
  }

  return municipalityMatch;
}

export function apiGeoFilterIds(
  regionIds: string[],
  municipalityIds: string[],
): { regionId?: number; municipalityId?: number } {
  if (regionIds.length === 1 && municipalityIds.length === 0) {
    return { regionId: Number(regionIds[0]) };
  }

  if (municipalityIds.length === 1 && regionIds.length === 0) {
    return { municipalityId: Number(municipalityIds[0]) };
  }

  return {};
}

export function needsClientGeoFilter(
  regionIds: string[],
  municipalityIds: string[],
): boolean {
  if (regionIds.length === 0 && municipalityIds.length === 0) {
    return false;
  }

  return !(
    (regionIds.length === 1 && municipalityIds.length === 0) ||
    (municipalityIds.length === 1 && regionIds.length === 0)
  );
}

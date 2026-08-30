import type { PoiDto } from "@/lib/types/poi";

export function slugifyPoiName(name: string): string {
  const slug = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "place";
}

export function poiSlugParam(poi: Pick<PoiDto, "id" | "name">): string {
  return `${poi.id}-${slugifyPoiName(poi.name)}`;
}

export function poiPath(
  basePath: string,
  poi: Pick<PoiDto, "id" | "name">,
): string {
  return `${basePath}/${poiSlugParam(poi)}`;
}

export function parsePoiIdFromSlugParam(param: string): number | null {
  const idNameMatch = param.match(/^(\d+)-/);
  const rawId = idNameMatch?.[1] ?? (/^\d+$/.test(param) ? param : null);
  if (rawId == null) {
    return null;
  }

  const id = Number(rawId);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export function isCanonicalPoiSlugParam(
  poi: Pick<PoiDto, "id" | "name">,
  param: string,
): boolean {
  return param === poiSlugParam(poi);
}

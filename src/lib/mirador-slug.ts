import type { PoiDto } from "@/lib/types/poi";

export function slugifyMiradorName(name: string): string {
  const slug = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "mirador";
}

/** Canonical URL segment: `{id}-{name-slug}` e.g. `12-mirador-de-la-paz`. */
export function miradorSlugParam(mirador: Pick<PoiDto, "id" | "name">): string {
  return `${mirador.id}-${slugifyMiradorName(mirador.name)}`;
}

export function miradorPath(mirador: Pick<PoiDto, "id" | "name">): string {
  return `/miradores/${miradorSlugParam(mirador)}`;
}

/**
 * Extract mirador id from `/miradores/{slug}`.
 * Supports canonical `42-mirador-name` and legacy numeric-only `42`.
 */
export function parseMiradorIdFromSlugParam(param: string): number | null {
  const idNameMatch = param.match(/^(\d+)-/);
  const rawId = idNameMatch?.[1] ?? (/^\d+$/.test(param) ? param : null);
  if (rawId == null) {
    return null;
  }

  const id = Number(rawId);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export function isCanonicalMiradorSlugParam(
  mirador: Pick<PoiDto, "id" | "name">,
  param: string,
): boolean {
  return param === miradorSlugParam(mirador);
}

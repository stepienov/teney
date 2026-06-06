import type { PoiDto } from "@/lib/types/poi";

export function slugifyBeachName(name: string): string {
  const slug = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "beach";
}

/** Canonical URL segment: `{id}-{name-slug}` e.g. `2-playa-jardin`. */
export function beachSlugParam(beach: Pick<PoiDto, "id" | "name">): string {
  return `${beach.id}-${slugifyBeachName(beach.name)}`;
}

export function beachPath(beach: Pick<PoiDto, "id" | "name">): string {
  return `/beaches/${beachSlugParam(beach)}`;
}

/**
 * Extract beach id from `/beaches/{slug}`.
 * Supports canonical `42-playa-jardin` and legacy numeric-only `42`.
 */
export function parseBeachIdFromSlugParam(param: string): number | null {
  const idNameMatch = param.match(/^(\d+)-/);
  const rawId = idNameMatch?.[1] ?? (/^\d+$/.test(param) ? param : null);
  if (rawId == null) {
    return null;
  }

  const id = Number(rawId);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export function isCanonicalBeachSlugParam(
  beach: Pick<PoiDto, "id" | "name">,
  param: string,
): boolean {
  return param === beachSlugParam(beach);
}

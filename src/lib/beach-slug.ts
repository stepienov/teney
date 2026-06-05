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

export function beachSlugParam(beach: Pick<PoiDto, "name">): string {
  return slugifyBeachName(beach.name);
}

export function beachPath(beach: Pick<PoiDto, "name">): string {
  return `/beaches/${beachSlugParam(beach)}`;
}

/** Legacy `/beaches/4` — numeric id only. */
export function parseBeachIdFromSlugParam(param: string): number | null {
  if (!/^\d+$/.test(param)) {
    return null;
  }

  const id = Number(param);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export function isCanonicalBeachSlugParam(
  beach: Pick<PoiDto, "name">,
  param: string,
): boolean {
  return param === beachSlugParam(beach);
}

export function beachMatchesNameOnlySlug(
  beach: Pick<PoiDto, "name">,
  param: string,
): boolean {
  return slugifyBeachName(beach.name) === param;
}

export function unslugifyBeachName(slug: string): string {
  return slug.replace(/-/g, " ");
}

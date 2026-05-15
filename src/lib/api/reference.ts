import { apiJson } from "@/lib/api-client";
import type { MunicipalityRef, PointTypeRef } from "@/lib/types/poi";

export async function fetchMunicipalities(): Promise<MunicipalityRef[]> {
  return apiJson<MunicipalityRef[]>("/api/reference/municipalities");
}

export async function fetchPointTypes(): Promise<PointTypeRef[]> {
  return apiJson<PointTypeRef[]>("/api/reference/point-types");
}

export async function resolveBeachPointTypeId(): Promise<number> {
  const types = await fetchPointTypes();
  const beach = types.find(
    (t) => t.description.toUpperCase() === "BEACH",
  );
  if (!beach) {
    throw new Error("Beach point type (BEACH) not found in reference data");
  }
  return beach.id;
}

export function uniqueRegions(municipalities: MunicipalityRef[]) {
  const map = new Map<number, string>();
  for (const m of municipalities) {
    map.set(m.regionDirectionId, m.regionDirectionName);
  }
  return [...map.entries()]
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

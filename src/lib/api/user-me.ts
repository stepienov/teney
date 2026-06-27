import {
  authDelete,
  authJson,
  authPatch,
  authPut,
} from "@/lib/api/authenticated-fetch";
import type { BeachListItemDto } from "@/lib/types/beach-list";
import type { PatchMeRequest, UserProfile } from "@/lib/types/user-auth";

export async function fetchMe(): Promise<UserProfile> {
  return authJson<UserProfile>("/api/me");
}

export async function patchMe(body: PatchMeRequest): Promise<UserProfile> {
  return authPatch<UserProfile>("/api/me", body);
}

export async function fetchFavorites(locale: string): Promise<BeachListItemDto[]> {
  const params = new URLSearchParams({ locale });
  return authJson<BeachListItemDto[]>(`/api/me/favorites?${params.toString()}`);
}

export async function addFavorite(poiId: number): Promise<void> {
  await authPut(`/api/me/favorites/${poiId}`);
}

export async function removeFavorite(poiId: number): Promise<void> {
  await authDelete(`/api/me/favorites/${poiId}`);
}

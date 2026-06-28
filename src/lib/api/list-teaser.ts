import { apiJson } from "@/lib/api-client";
import type { ListTeaserResponse } from "@/lib/types/user-lists";

export async function fetchListTeaser(
  token: string,
): Promise<ListTeaserResponse> {
  return apiJson<ListTeaserResponse>(`/api/lists/shared/${encodeURIComponent(token)}`);
}

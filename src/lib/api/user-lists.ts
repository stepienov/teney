import {
  authDelete,
  authJson,
  authPatch,
  authPost,
  authPut,
  authPutJson,
} from "@/lib/api/authenticated-fetch";
import type {
  ListItemSort,
  ListShareCreateRequest,
  ListShareDto,
  ListShareUpdateRequest,
  PageResponse,
  RatingRequest,
  SharedUserListSummary,
  UserListCreateRequest,
  UserListItemDto,
  UserListResponse,
  UserListSummary,
  UserListUpdateRequest,
} from "@/lib/types/user-lists";

const DEFAULT_PAGE_SIZE = 20;

export async function fetchMyLists(
  page = 0,
  size = DEFAULT_PAGE_SIZE,
): Promise<PageResponse<UserListSummary>> {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });
  return authJson<PageResponse<UserListSummary>>(
    `/api/me/lists?${params.toString()}`,
  );
}

export async function createList(
  body: UserListCreateRequest,
): Promise<UserListResponse> {
  return authPost<UserListResponse>("/api/me/lists", body);
}

export async function fetchList(listId: number): Promise<UserListResponse> {
  return authJson<UserListResponse>(`/api/me/lists/${listId}`);
}

export async function updateList(
  listId: number,
  body: UserListUpdateRequest,
): Promise<UserListResponse> {
  return authPatch<UserListResponse>(`/api/me/lists/${listId}`, body);
}

export async function deleteList(listId: number): Promise<void> {
  await authDelete(`/api/me/lists/${listId}`);
}

export async function fetchSharedWithMe(
  page = 0,
  size = DEFAULT_PAGE_SIZE,
): Promise<PageResponse<SharedUserListSummary>> {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });
  return authJson<PageResponse<SharedUserListSummary>>(
    `/api/me/lists/shared-with-me?${params.toString()}`,
  );
}

export async function fetchListItems(
  listId: number,
  options: { locale: string; sort?: ListItemSort } = { locale: "en" },
): Promise<UserListItemDto[]> {
  const params = new URLSearchParams({ locale: options.locale });
  if (options.sort) {
    params.set("sort", options.sort);
  }
  return authJson<UserListItemDto[]>(
    `/api/me/lists/${listId}/items?${params.toString()}`,
  );
}

export async function addListItem(
  listId: number,
  poiId: number,
): Promise<void> {
  await authPut(`/api/me/lists/${listId}/items/${poiId}`);
}

export async function removeListItem(
  listId: number,
  poiId: number,
): Promise<void> {
  await authDelete(`/api/me/lists/${listId}/items/${poiId}`);
}

export async function setListItemRating(
  listId: number,
  poiId: number,
  body: RatingRequest,
): Promise<void> {
  await authPutJson<void>(
    `/api/me/lists/${listId}/items/${poiId}/rating`,
    body,
  );
}

export async function removeListItemRating(
  listId: number,
  poiId: number,
): Promise<void> {
  await authDelete(`/api/me/lists/${listId}/items/${poiId}/rating`);
}

export async function fetchShares(listId: number): Promise<ListShareDto[]> {
  return authJson<ListShareDto[]>(`/api/me/lists/${listId}/shares`);
}

export async function createShares(
  listId: number,
  body: ListShareCreateRequest,
): Promise<ListShareDto[]> {
  return authPost<ListShareDto[]>(`/api/me/lists/${listId}/shares`, body);
}

export async function updateShare(
  listId: number,
  shareId: number,
  body: ListShareUpdateRequest,
): Promise<ListShareDto> {
  return authPatch<ListShareDto>(
    `/api/me/lists/${listId}/shares/${shareId}`,
    body,
  );
}

export async function deleteShare(
  listId: number,
  shareId: number,
): Promise<void> {
  await authDelete(`/api/me/lists/${listId}/shares/${shareId}`);
}

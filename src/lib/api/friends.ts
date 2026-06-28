import {
  authDelete,
  authJson,
  authPatch,
  authPost,
  authPostVoid,
  authPut,
} from "@/lib/api/authenticated-fetch";
import type {
  FriendDto,
  FriendGroupCreateRequest,
  FriendGroupDto,
  FriendGroupMemberDto,
  FriendGroupRenameRequest,
  FriendInviteRequest,
  FriendRequestDirection,
  FriendRequestDto,
} from "@/lib/types/friends";

export async function fetchFriends(): Promise<FriendDto[]> {
  return authJson<FriendDto[]>("/api/me/friends");
}

export async function fetchFriendRequests(
  direction: FriendRequestDirection,
): Promise<FriendRequestDto[]> {
  const params = new URLSearchParams({ direction });
  return authJson<FriendRequestDto[]>(
    `/api/me/friends/requests?${params.toString()}`,
  );
}

export async function inviteFriend(body: FriendInviteRequest): Promise<void> {
  await authPostVoid("/api/me/friends/requests", body);
}

export async function acceptFriendRequest(requestId: number): Promise<void> {
  await authPostVoid(`/api/me/friends/requests/${requestId}/accept`);
}

export async function declineFriendRequest(requestId: number): Promise<void> {
  await authPostVoid(`/api/me/friends/requests/${requestId}/decline`);
}

export async function removeFriend(friendUserId: number): Promise<void> {
  await authDelete(`/api/me/friends/${friendUserId}`);
}

export async function fetchFriendGroups(): Promise<FriendGroupDto[]> {
  return authJson<FriendGroupDto[]>("/api/me/friend-groups");
}

export async function createFriendGroup(
  body: FriendGroupCreateRequest,
): Promise<FriendGroupDto> {
  return authPost<FriendGroupDto>("/api/me/friend-groups", body);
}

export async function renameFriendGroup(
  groupId: number,
  body: FriendGroupRenameRequest,
): Promise<FriendGroupDto> {
  return authPatch<FriendGroupDto>(
    `/api/me/friend-groups/${groupId}`,
    body,
  );
}

export async function deleteFriendGroup(groupId: number): Promise<void> {
  await authDelete(`/api/me/friend-groups/${groupId}`);
}

export async function fetchGroupMembers(
  groupId: number,
): Promise<FriendGroupMemberDto[]> {
  return authJson<FriendGroupMemberDto[]>(
    `/api/me/friend-groups/${groupId}/members`,
  );
}

export async function addGroupMember(
  groupId: number,
  friendUserId: number,
): Promise<void> {
  await authPut(`/api/me/friend-groups/${groupId}/members/${friendUserId}`);
}

export async function removeGroupMember(
  groupId: number,
  friendUserId: number,
): Promise<void> {
  await authDelete(
    `/api/me/friend-groups/${groupId}/members/${friendUserId}`,
  );
}

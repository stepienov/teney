export type FriendshipStatus =
  | "PENDING"
  | "PENDING_REGISTRATION"
  | "ACCEPTED"
  | "DECLINED";

export type FriendRequestDirection = "incoming" | "outgoing";

export type FriendDto = {
  userId: number;
  email: string;
  displayName: string | null;
  friendsSince: string;
};

export type FriendRequestDto = {
  requestId: number;
  direction: FriendRequestDirection;
  status: FriendshipStatus;
  counterpartUserId: number | null;
  counterpartEmail: string | null;
  counterpartDisplayName: string | null;
  createdAt: string;
};

export type FriendInviteRequest = {
  email: string;
};

export type FriendGroupDto = {
  id: number;
  name: string;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
};

export type FriendGroupMemberDto = {
  userId: number;
  email: string;
  displayName: string | null;
  addedAt: string;
};

export type FriendGroupCreateRequest = {
  name: string;
};

export type FriendGroupRenameRequest = {
  name: string;
};

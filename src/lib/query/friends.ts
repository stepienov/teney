import type { FriendRequestDirection } from "@/lib/types/friends";

export const friendQueryKeys = {
  all: ["friends"] as const,
  friends: () => ["friends", "list"] as const,
  requests: (direction: FriendRequestDirection) =>
    ["friends", "requests", direction] as const,
  groups: () => ["friends", "groups"] as const,
  groupMembers: (groupId: number) =>
    ["friends", "groups", groupId, "members"] as const,
};

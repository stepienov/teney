import type { InviteType } from "@/lib/types/invites";

export const inviteQueryKeys = {
  all: ["invites"] as const,
  unreadCount: () => ["invites", "unread-count"] as const,
  incoming: (type: InviteType | "all", page: number, size: number) =>
    ["invites", "incoming", type, page, size] as const,
};

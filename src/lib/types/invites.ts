import type { PageResponse } from "@/lib/types/user-lists";

export type InviteType = "LIST" | "GROUP" | "FRIEND";

export type InviteDeliveryChannel = "EMAIL" | "MESSENGER" | "LINK_COPY";

export type InviteUserSummary = {
  userId: number;
  displayName: string | null;
  avatarUrl: string | null;
  email: string;
};

export type InviteUnreadCountResponse = {
  total: number;
  lists: number;
  groups: number;
  friends: number;
};

export type InviteIncomingDto = {
  inboxEntryId: number;
  inviteType: InviteType;
  token: string;
  status: "PENDING";
  unread: boolean;
  inviter: InviteUserSummary;
  title: string;
  subtitle: string;
  deliveryChannel: InviteDeliveryChannel;
  deliveryHint: string | null;
  createdAt: string;
  seenAt: string | null;
};

export type InviteIncomingPage = PageResponse<InviteIncomingDto>;

export type InviteMarkSeenRequest =
  | { scope: "all" }
  | { inviteTypes: InviteType[] }
  | { inboxEntryIds: number[] };

export type InviteMarkSeenResponse = { markedCount: number };

export type InviteActionResponse = {
  inviteType: InviteType;
  status: "ACCEPTED" | "DECLINED";
  targetPath: string;
  inviter: InviteUserSummary;
  suggestAddFriend: boolean;
  alreadyAccepted: boolean;
  alreadyDeclined: boolean;
};

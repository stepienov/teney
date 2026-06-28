import {
  authJson,
  authPost,
} from "@/lib/api/authenticated-fetch";
import type {
  InviteActionResponse,
  InviteIncomingPage,
  InviteMarkSeenRequest,
  InviteMarkSeenResponse,
  InviteType,
  InviteUnreadCountResponse,
} from "@/lib/types/invites";

const DEFAULT_PAGE_SIZE = 50;

export async function fetchInviteUnreadCount(): Promise<InviteUnreadCountResponse> {
  return authJson<InviteUnreadCountResponse>("/api/me/invites/unread-count");
}

export async function fetchIncomingInvites(
  page = 0,
  size = DEFAULT_PAGE_SIZE,
  type?: InviteType,
): Promise<InviteIncomingPage> {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });
  if (type != null) {
    params.set("type", type);
  }
  return authJson<InviteIncomingPage>(
    `/api/me/invites/incoming?${params.toString()}`,
  );
}

export async function markInvitesSeen(
  body: InviteMarkSeenRequest,
): Promise<InviteMarkSeenResponse> {
  return authPost<InviteMarkSeenResponse>("/api/me/invites/mark-seen", body);
}

export async function acceptInvite(token: string): Promise<InviteActionResponse> {
  return authPost<InviteActionResponse>(
    `/api/me/invites/${encodeURIComponent(token)}/accept`,
    {},
  );
}

export async function declineInvite(token: string): Promise<InviteActionResponse> {
  return authPost<InviteActionResponse>(
    `/api/me/invites/${encodeURIComponent(token)}/decline`,
    {},
  );
}

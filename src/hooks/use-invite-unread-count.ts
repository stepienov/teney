"use client";

import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/components/providers/auth-provider";
import { fetchInviteUnreadCount } from "@/lib/api/invites";
import { inviteQueryKeys } from "@/lib/query/invites";

export function useInviteUnreadCount() {
  const { status } = useAuth();

  return useQuery({
    queryKey: inviteQueryKeys.unreadCount(),
    queryFn: fetchInviteUnreadCount,
    enabled: status === "authenticated",
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}

"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { useAuth } from "@/components/providers/auth-provider";
import { markInvitesSeen } from "@/lib/api/invites";
import { inviteQueryKeys } from "@/lib/query/invites";
import type { InviteType } from "@/lib/types/invites";

export function useMarkInvitesSeenOnMount(
  types: InviteType[],
  enabled = true,
): void {
  const { status } = useAuth();
  const queryClient = useQueryClient();
  const typesKey = types.join(",");

  useEffect(() => {
    const inviteTypes = typesKey.split(",").filter(Boolean) as InviteType[];
    if (status !== "authenticated" || !enabled || inviteTypes.length === 0) {
      return;
    }

    let cancelled = false;

    void markInvitesSeen({ inviteTypes }).then(() => {
      if (!cancelled) {
        void queryClient.invalidateQueries({ queryKey: inviteQueryKeys.all });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [status, typesKey, enabled, queryClient]);
}

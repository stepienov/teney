"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { fetchSharedWithMe } from "@/lib/api/user-lists";
import { listQueryKeys } from "@/lib/query/lists";
import type { ListAccessLevel } from "@/lib/types/user-lists";

export type ListAccessInfo = {
  isOwner: boolean;
  accessLevel: ListAccessLevel | "OWNER";
  canEditItems: boolean;
  canRate: boolean;
  canShare: boolean;
  canEditMeta: boolean;
  isLoading: boolean;
};

export function useListAccess(listId: number): ListAccessInfo {
  const sharedQuery = useQuery({
    queryKey: listQueryKeys.sharedWithMe(0, 100),
    queryFn: () => fetchSharedWithMe(0, 100),
  });

  return useMemo(() => {
    const loading = sharedQuery.isLoading;
    const shared = sharedQuery.data?.content.find((l) => l.id === listId);

    if (shared) {
      const level = shared.accessLevel;
      return {
        isOwner: false,
        accessLevel: level,
        canEditItems: level === "EDIT",
        canRate: level === "EDIT" || level === "REVIEWER",
        canShare: false,
        canEditMeta: false,
        isLoading: loading,
      };
    }

    return {
      isOwner: true,
      accessLevel: "OWNER",
      canEditItems: true,
      canRate: true,
      canShare: true,
      canEditMeta: true,
      isLoading: loading,
    };
  }, [listId, sharedQuery.data, sharedQuery.isLoading]);
}

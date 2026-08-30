import type { ListItemSort } from "@/lib/types/user-lists";

export const listQueryKeys = {
  all: ["lists"] as const,
  myLists: (page: number, size: number) =>
    ["lists", "mine", page, size] as const,
  list: (id: number) => ["lists", "detail", id] as const,
  items: (id: number, locale: string, sort: ListItemSort) =>
    ["lists", "items", id, locale, sort] as const,
  shares: (id: number) => ["lists", "shares", id] as const,
  sharedWithMe: (page: number, size: number) =>
    ["lists", "shared-with-me", page, size] as const,
};

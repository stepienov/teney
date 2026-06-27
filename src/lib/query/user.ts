export const userQueryKeys = {
  me: ["user", "me"] as const,
  favoriteIds: (locale: string) => ["user", "favoriteIds", locale] as const,
  favorites: (locale: string) => ["user", "favorites", locale] as const,
};

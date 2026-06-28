"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  clearAuthState,
  registerRefreshHandler,
} from "@/lib/api/authenticated-fetch";
import {
  loginUser,
  logoutUser,
  oauthGoogle,
  refreshUserSession,
  registerUser,
} from "@/lib/api/user-auth";
import {
  addFavorite,
  fetchFavorites,
  fetchMe,
  patchMe,
  removeFavorite,
} from "@/lib/api/user-me";
import { getStoredRefreshToken } from "@/lib/auth/storage";
import { inviteQueryKeys } from "@/lib/query/invites";
import { userQueryKeys } from "@/lib/query/user";
import { listQueryKeys } from "@/lib/query/lists";
import type {
  AuthSession,
  LoginRequest,
  PatchMeRequest,
  RegisterRequest,
  UserProfile,
} from "@/lib/types/user-auth";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  status: AuthStatus;
  session: AuthSession | null;
  user: UserProfile | null;
  favoriteIds: ReadonlySet<number>;
  isFavorite: (poiId: number) => boolean;
  login: (body: LoginRequest, locale?: string) => Promise<void>;
  register: (body: RegisterRequest) => Promise<void>;
  loginWithGoogle: (
    idToken: string,
    options?: { preferredLocale?: string; countryCode?: string },
  ) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (body: PatchMeRequest) => Promise<UserProfile>;
  toggleFavorite: (poiId: number) => Promise<void>;
  refreshFavorites: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function loadFavoriteIds(locale: string): Promise<Set<number>> {
  const favorites = await fetchFavorites(locale);
  return new Set(favorites.map((item) => item.id));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [session, setSession] = useState<AuthSession | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());

  const applySession = useCallback(
    async (next: AuthSession, locale: string) => {
      setSession(next);
      setStatus("authenticated");
      queryClient.setQueryData(userQueryKeys.me, next.user);
      try {
        const ids = await loadFavoriteIds(locale);
        setFavoriteIds(ids);
        queryClient.setQueryData(userQueryKeys.favoriteIds(locale), ids);
        void queryClient.invalidateQueries({ queryKey: listQueryKeys.all });
        void queryClient.invalidateQueries({ queryKey: inviteQueryKeys.all });
      } catch {
        setFavoriteIds(new Set());
      }
    },
    [queryClient],
  );

  const clearSession = useCallback(() => {
    clearAuthState();
    setSession(null);
    setFavoriteIds(new Set());
    setStatus("unauthenticated");
    queryClient.removeQueries({ queryKey: ["user"] });
    queryClient.removeQueries({ queryKey: inviteQueryKeys.all });
  }, [queryClient]);

  const refreshSession = useCallback(async (): Promise<AuthSession | null> => {
    const stored = getStoredRefreshToken();
    if (stored == null) {
      clearSession();
      return null;
    }
    try {
      const next = await refreshUserSession(stored);
      setSession(next);
      setStatus("authenticated");
      queryClient.setQueryData(userQueryKeys.me, next.user);
      return next;
    } catch {
      clearSession();
      return null;
    }
  }, [clearSession, queryClient]);

  useEffect(() => {
    registerRefreshHandler(refreshSession);
  }, [refreshSession]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const stored = getStoredRefreshToken();
      if (stored == null) {
        if (!cancelled) {
          setStatus("unauthenticated");
        }
        return;
      }

      try {
        const next = await refreshUserSession(stored);
        if (cancelled) {
          return;
        }
        setSession(next);
        setStatus("authenticated");
        queryClient.setQueryData(userQueryKeys.me, next.user);
        try {
          const me = await fetchMe();
          if (!cancelled) {
            setSession((prev) =>
              prev ? { ...prev, user: me } : prev,
            );
          }
          const locale = next.user.preferredLocale ?? "en";
          const ids = await loadFavoriteIds(locale);
          if (!cancelled) {
            setFavoriteIds(ids);
          }
        } catch {
          // keep session from refresh response
        }
      } catch {
        if (!cancelled) {
          clearSession();
        }
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [clearSession, queryClient]);

  const login = useCallback(
    async (body: LoginRequest, locale = "en") => {
      const next = await loginUser(body);
      await applySession(next, next.user.preferredLocale ?? locale);
    },
    [applySession],
  );

  const register = useCallback(
    async (body: RegisterRequest) => {
      const next = await registerUser(body);
      const locale = body.preferredLocale ?? "en";
      await applySession(next, locale);
    },
    [applySession],
  );

  const loginWithGoogle = useCallback(
    async (
      idToken: string,
      options?: { preferredLocale?: string; countryCode?: string },
    ) => {
      const next = await oauthGoogle(idToken, options);
      const locale = options?.preferredLocale ?? next.user.preferredLocale ?? "en";
      await applySession(next, locale);
    },
    [applySession],
  );

  const logout = useCallback(async () => {
    const token = session?.refreshToken ?? getStoredRefreshToken();
    if (token) {
      try {
        await logoutUser(token);
      } catch {
        // clear local state even if server call fails
      }
    }
    clearSession();
  }, [clearSession, session?.refreshToken]);

  const updateProfile = useCallback(
    async (body: PatchMeRequest) => {
      const updated = await patchMe(body);
      setSession((prev) =>
        prev ? { ...prev, user: updated } : prev,
      );
      queryClient.setQueryData(userQueryKeys.me, updated);
      return updated;
    },
    [queryClient],
  );

  const refreshFavorites = useCallback(async () => {
    if (status !== "authenticated") {
      return;
    }
    const locale = session?.user.preferredLocale ?? "en";
    const ids = await loadFavoriteIds(locale);
    setFavoriteIds(ids);
  }, [session?.user.preferredLocale, status]);

  const toggleFavorite = useCallback(
    async (poiId: number) => {
      if (status !== "authenticated") {
        throw new Error("NOT_AUTHENTICATED");
      }

      const wasFavorite = favoriteIds.has(poiId);
      const optimistic = new Set(favoriteIds);
      if (wasFavorite) {
        optimistic.delete(poiId);
      } else {
        optimistic.add(poiId);
      }
      setFavoriteIds(optimistic);

      setSession((prev) =>
        prev
          ? {
              ...prev,
              user: {
                ...prev.user,
                favoriteCount: Math.max(
                  0,
                  prev.user.favoriteCount + (wasFavorite ? -1 : 1),
                ),
              },
            }
          : prev,
      );

      try {
        if (wasFavorite) {
          await removeFavorite(poiId);
        } else {
          await addFavorite(poiId);
        }
        const locale = session?.user.preferredLocale ?? "en";
        queryClient.invalidateQueries({
          queryKey: userQueryKeys.favoriteIds(locale),
        });
        queryClient.invalidateQueries({
          queryKey: userQueryKeys.favorites(locale),
        });
      } catch (error) {
        setFavoriteIds(favoriteIds);
        setSession((prev) =>
          prev
            ? {
                ...prev,
                user: {
                  ...prev.user,
                  favoriteCount: Math.max(
                    0,
                    prev.user.favoriteCount + (wasFavorite ? 1 : -1),
                  ),
                },
              }
            : prev,
        );
        throw error;
      }
    },
    [favoriteIds, queryClient, session, status],
  );

  const isFavorite = useCallback(
    (poiId: number) => favoriteIds.has(poiId),
    [favoriteIds],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      session,
      user: session?.user ?? null,
      favoriteIds,
      isFavorite,
      login,
      register,
      loginWithGoogle,
      logout,
      updateProfile,
      toggleFavorite,
      refreshFavorites,
    }),
    [
      status,
      session,
      favoriteIds,
      isFavorite,
      login,
      register,
      loginWithGoogle,
      logout,
      updateProfile,
      toggleFavorite,
      refreshFavorites,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx == null) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

export function useOptionalAuth(): AuthContextValue | null {
  return useContext(AuthContext);
}

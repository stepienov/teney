import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from "@/lib/auth/access-token";
import {
  clearStoredRefreshToken,
  getStoredRefreshToken,
  setStoredRefreshToken,
} from "@/lib/auth/storage";
import { ApiError } from "@/lib/api-client";
import { getPublicApiBaseUrl } from "@/lib/env";
import type { AuthSession, UserAuthResponse } from "@/lib/types/user-auth";

type RefreshHandler = () => Promise<AuthSession | null>;

let refreshHandler: RefreshHandler | null = null;
let refreshInFlight: Promise<AuthSession | null> | null = null;

export function registerRefreshHandler(handler: RefreshHandler): void {
  refreshHandler = handler;
}

export function sessionFromAuthResponse(response: UserAuthResponse): AuthSession {
  setAccessToken(response.accessToken, response.expiresInSeconds);
  setStoredRefreshToken(response.refreshToken);
  return {
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
    expiresAt: Date.now() + response.expiresInSeconds * 1000,
    user: response.user,
  };
}

export function clearAuthState(): void {
  clearAccessToken();
  clearStoredRefreshToken();
}

async function tryRefreshSession(): Promise<AuthSession | null> {
  if (refreshHandler == null) {
    return null;
  }
  if (refreshInFlight == null) {
    refreshInFlight = refreshHandler().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

function buildUrl(path: string): string {
  const base = getPublicApiBaseUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

export async function authFetch(
  path: string,
  init: RequestInit = {},
  retryOnUnauthorized = true,
): Promise<Response> {
  const token = getAccessToken();
  const headers = new Headers(init.headers);
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(buildUrl(path), { ...init, headers });

  if (
    res.status === 401 &&
    retryOnUnauthorized &&
    getStoredRefreshToken() != null
  ) {
    const refreshed = await tryRefreshSession();
    if (refreshed) {
      return authFetch(path, init, false);
    }
    clearAuthState();
  }

  return res;
}

export async function authJson<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await authFetch(path, init);
  const text = await res.text();

  if (!res.ok) {
    throw new ApiError(`HTTP ${res.status}`, res.status, text || undefined);
  }

  if (text.length === 0) {
    return undefined as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new ApiError("Response is not valid JSON", res.status, text);
  }
}

export async function authPost<T>(path: string, body: unknown): Promise<T> {
  return authJson<T>(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function authPatch<T>(path: string, body: unknown): Promise<T> {
  return authJson<T>(path, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function authPut(path: string): Promise<void> {
  await authJson<void>(path, { method: "PUT" });
}

export async function authDelete(path: string): Promise<void> {
  await authJson<void>(path, { method: "DELETE" });
}

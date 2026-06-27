import { apiPost } from "@/lib/api-client";
import { sessionFromAuthResponse } from "@/lib/api/authenticated-fetch";
import type {
  AuthSession,
  LoginRequest,
  RegisterRequest,
  UserAuthResponse,
} from "@/lib/types/user-auth";

export async function registerUser(
  body: RegisterRequest,
): Promise<AuthSession> {
  const response = await apiPost<UserAuthResponse>("/api/auth/register", body);
  return sessionFromAuthResponse(response);
}

export async function loginUser(body: LoginRequest): Promise<AuthSession> {
  const response = await apiPost<UserAuthResponse>("/api/auth/login", body);
  return sessionFromAuthResponse(response);
}

export async function refreshUserSession(
  refreshToken: string,
): Promise<AuthSession> {
  const response = await apiPost<UserAuthResponse>("/api/auth/refresh", {
    refreshToken,
  });
  return sessionFromAuthResponse(response);
}

export async function logoutUser(refreshToken: string): Promise<void> {
  await apiPost<void>("/api/auth/logout", { refreshToken });
}

export async function oauthGoogle(
  idToken: string,
  options?: { preferredLocale?: string; countryCode?: string },
): Promise<AuthSession> {
  const response = await apiPost<UserAuthResponse>("/api/auth/oauth/google", {
    idToken,
    ...options,
  });
  return sessionFromAuthResponse(response);
}

export async function oauthApple(
  idToken: string,
  options?: { preferredLocale?: string; countryCode?: string },
): Promise<AuthSession> {
  const response = await apiPost<UserAuthResponse>("/api/auth/oauth/apple", {
    idToken,
    ...options,
  });
  return sessionFromAuthResponse(response);
}

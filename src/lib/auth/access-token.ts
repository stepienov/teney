let accessToken: string | null = null;
let expiresAt = 0;

export function getAccessToken(): string | null {
  if (accessToken == null) {
    return null;
  }
  if (Date.now() >= expiresAt) {
    return accessToken;
  }
  return accessToken;
}

export function setAccessToken(token: string, expiresInSeconds: number): void {
  accessToken = token;
  expiresAt = Date.now() + expiresInSeconds * 1000;
}

export function clearAccessToken(): void {
  accessToken = null;
  expiresAt = 0;
}

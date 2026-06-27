/**
 * Public env vars (embedded in the client bundle). Use only non-secret values.
 */
export function getPublicApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (raw == null || raw.trim() === "") {
    throw new Error(
      "NEXT_PUBLIC_API_BASE_URL is not set. Create .env.local from .env.local.example.",
    );
  }
  return raw.replace(/\/+$/, "");
}

export function getPublicGoogleClientId(): string | undefined {
  const raw = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (raw == null || raw.trim() === "") {
    return undefined;
  }
  return raw.trim();
}

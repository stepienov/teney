import { getPublicApiBaseUrl } from "@/lib/env";

export class ApiError extends Error {
  readonly status: number;
  readonly bodyText: string | undefined;

  constructor(message: string, status: number, bodyText?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.bodyText = bodyText;
  }
}

/**
 * Small JSON-oriented fetch wrapper (works in the browser and in Capacitor WebView).
 */
export async function apiJson<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const base = getPublicApiBaseUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const url = `${base}${normalized}`;

  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      ...init?.headers,
    },
  });

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

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  return apiJson<T>(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

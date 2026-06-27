const AUTH_RETURN_URL_KEY = "teney-auth-return-url";

const AUTH_PATHS = ["/login", "/register", "/auth"] as const;

export function isAuthReturnPath(pathname: string): boolean {
  return AUTH_PATHS.some(
    (segment) => pathname === segment || pathname.startsWith(`${segment}/`),
  );
}

export function saveAuthReturnPath(pathname: string): void {
  if (typeof window === "undefined" || !pathname || isAuthReturnPath(pathname)) {
    return;
  }
  sessionStorage.setItem(AUTH_RETURN_URL_KEY, pathname);
}

export function peekAuthReturnPath(fallback = "/"): string {
  if (typeof window === "undefined") {
    return fallback;
  }
  const stored = sessionStorage.getItem(AUTH_RETURN_URL_KEY);
  if (!stored || isAuthReturnPath(stored)) {
    return fallback;
  }
  return stored;
}

export function consumeAuthReturnPath(fallback = "/"): string {
  const path = peekAuthReturnPath(fallback);
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(AUTH_RETURN_URL_KEY);
  }
  return path;
}

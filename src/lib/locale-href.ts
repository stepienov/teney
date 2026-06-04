/** Query string from the current URL (client-only; use in click handlers). */
export function currentSearchQuery(): string {
  if (typeof window === "undefined") return "";
  return window.location.search.replace(/^\?/, "");
}

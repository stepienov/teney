"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "teney-beach-recent-searches";
const MAX_RECENT = 8;
const EMPTY_RECENT: readonly string[] = [];

let cachedRaw: string | null | undefined;
let cachedSearches: readonly string[] = EMPTY_RECENT;

function subscribe(onStoreChange: () => void) {
  const handler = (event: Event) => {
    if (
      event.type === "storage" ||
      (event instanceof CustomEvent && event.detail?.key === STORAGE_KEY)
    ) {
      onStoreChange();
    }
  };
  window.addEventListener("storage", handler);
  window.addEventListener("teney-local-storage", handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener("teney-local-storage", handler);
  };
}

function notifyChange() {
  window.dispatchEvent(
    new CustomEvent("teney-local-storage", { detail: { key: STORAGE_KEY } }),
  );
}

function parseRecentSearches(raw: string | null): readonly string[] {
  if (!raw) {
    return EMPTY_RECENT;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return EMPTY_RECENT;
    }

    const filtered = parsed.filter(
      (item): item is string => typeof item === "string" && item.trim().length > 0,
    );

    return filtered.length > 0 ? filtered : EMPTY_RECENT;
  } catch {
    return EMPTY_RECENT;
  }
}

function updateCache(raw: string | null, searches: readonly string[]) {
  cachedRaw = raw;
  cachedSearches = searches;
}

export function readRecentBeachSearches(): readonly string[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === cachedRaw) {
    return cachedSearches;
  }

  const searches = parseRecentSearches(raw);
  updateCache(raw, searches);
  return searches;
}

export function addRecentBeachSearch(query: string): void {
  const trimmed = query.trim();
  if (!trimmed) {
    return;
  }

  const current = [...readRecentBeachSearches()];
  const next = [
    trimmed,
    ...current.filter((item) => item !== trimmed),
  ].slice(0, MAX_RECENT);

  const raw = JSON.stringify(next);
  localStorage.setItem(STORAGE_KEY, raw);
  updateCache(raw, next.length > 0 ? next : EMPTY_RECENT);
  notifyChange();
}

export function useRecentBeachSearches(): readonly string[] {
  return useSyncExternalStore(
    subscribe,
    readRecentBeachSearches,
    () => EMPTY_RECENT,
  );
}

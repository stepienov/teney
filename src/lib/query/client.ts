"use client";

import {
  dehydrate,
  hydrate,
  QueryClient,
  type Query,
} from "@tanstack/react-query";

import { CACHE_POLICY } from "@/lib/query/cache-policy";

const { storageKey, maxAgeMs } = CACHE_POLICY.queryPersist;

function shouldPersistQuery(query: Query): boolean {
  const key = query.queryKey;
  if (!Array.isArray(key) || key.length === 0) {
    return false;
  }

  const root = key[0];
  return root === "poi" || root === "reference";
}

function restorePersistedQueries(client: QueryClient): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const raw = sessionStorage.getItem(storageKey);
    if (raw == null) {
      return;
    }

    const parsed = JSON.parse(raw) as { savedAt?: number; state?: unknown };
    if (
      parsed.savedAt == null ||
      Date.now() - parsed.savedAt > maxAgeMs ||
      parsed.state == null
    ) {
      sessionStorage.removeItem(storageKey);
      return;
    }

    hydrate(client, parsed.state as Parameters<typeof hydrate>[1]);
  } catch {
    sessionStorage.removeItem(storageKey);
  }
}

function persistQueries(client: QueryClient): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const state = dehydrate(client, {
      shouldDehydrateQuery: (query) =>
        shouldPersistQuery(query) && query.state.status === "success",
    });

    sessionStorage.setItem(
      storageKey,
      JSON.stringify({
        savedAt: Date.now(),
        state,
      }),
    );
  } catch {
    /* quota exceeded */
  }
}

function attachQueryPersistence(client: QueryClient): void {
  if (typeof window === "undefined") {
    return;
  }

  let timer: ReturnType<typeof setTimeout> | null = null;

  client.getQueryCache().subscribe(() => {
    if (timer != null) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      persistQueries(client);
      timer = null;
    }, 1_000);
  });
}

export function createQueryClient(): QueryClient {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: CACHE_POLICY.poiSearch.staleTime,
        gcTime: CACHE_POLICY.poiSearch.gcTime,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });

  restorePersistedQueries(client);
  attachQueryPersistence(client);

  return client;
}

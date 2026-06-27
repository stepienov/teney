"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(hover: hover) and (pointer: fine)";

function subscribe(onStoreChange: () => void) {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

/** True when the primary input supports hover (typically mouse on desktop). */
export function usePrefersHover(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

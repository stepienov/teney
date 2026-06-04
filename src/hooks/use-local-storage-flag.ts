"use client";

import { useCallback, useSyncExternalStore } from "react";

function subscribe(key: string) {
  return (onStoreChange: () => void) => {
    const handler = (event: Event) => {
      if (
        event.type === "storage" ||
        (event instanceof CustomEvent && event.detail?.key === key)
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
  };
}

function readFlag(key: string): boolean {
  return localStorage.getItem(key) === "1";
}

function notifyLocalStorage(key: string) {
  window.dispatchEvent(
    new CustomEvent("teney-local-storage", { detail: { key } }),
  );
}

export function useLocalStorageFlag(
  key: string,
  defaultValue = false,
): [boolean, (next: boolean) => void] {
  const value = useSyncExternalStore(
    subscribe(key),
    () => readFlag(key),
    () => defaultValue,
  );

  const setValue = useCallback(
    (next: boolean) => {
      localStorage.setItem(key, next ? "1" : "0");
      notifyLocalStorage(key);
    },
    [key],
  );

  return [value, setValue];
}

export function useLocalStorageChoice<T extends string>(
  key: string,
  allowed: readonly T[],
  defaultValue: T,
): [T, (next: T) => void] {
  const value = useSyncExternalStore(
    subscribe(key),
    () => {
      const stored = localStorage.getItem(key);
      return allowed.includes(stored as T) ? (stored as T) : defaultValue;
    },
    () => defaultValue,
  );

  const setValue = useCallback(
    (next: T) => {
      localStorage.setItem(key, next);
      notifyLocalStorage(key);
    },
    [key],
  );

  return [value, setValue];
}

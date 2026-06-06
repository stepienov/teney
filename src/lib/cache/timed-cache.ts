type TimedCacheEntry<T> = {
  value: T;
  savedAt: number;
};

export function readTimedCache<T>(
  key: string,
  maxAgeMs: number,
): T | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  try {
    const raw = localStorage.getItem(key);
    if (raw == null) {
      return undefined;
    }

    const parsed = JSON.parse(raw) as TimedCacheEntry<T>;
    if (
      parsed == null ||
      typeof parsed !== "object" ||
      !("value" in parsed) ||
      !("savedAt" in parsed) ||
      typeof parsed.savedAt !== "number"
    ) {
      localStorage.removeItem(key);
      return undefined;
    }

    if (Date.now() - parsed.savedAt > maxAgeMs) {
      localStorage.removeItem(key);
      return undefined;
    }

    return parsed.value;
  } catch {
    localStorage.removeItem(key);
    return undefined;
  }
}

export function writeTimedCache<T>(key: string, value: T): void {
  if (typeof window === "undefined") {
    return;
  }

  const entry: TimedCacheEntry<T> = {
    value,
    savedAt: Date.now(),
  };

  try {
    localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    /* quota exceeded or private mode */
  }
}

export function readTimedCacheEntry<T>(
  key: string,
): TimedCacheEntry<T> | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  try {
    const raw = localStorage.getItem(key);
    if (raw == null) {
      return undefined;
    }

    const parsed = JSON.parse(raw) as TimedCacheEntry<T>;
    if (
      parsed == null ||
      typeof parsed !== "object" ||
      !("value" in parsed) ||
      !("savedAt" in parsed) ||
      typeof parsed.savedAt !== "number"
    ) {
      localStorage.removeItem(key);
      return undefined;
    }

    return parsed;
  } catch {
    localStorage.removeItem(key);
    return undefined;
  }
}

export function clearTimedCache(key: string): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(key);
}

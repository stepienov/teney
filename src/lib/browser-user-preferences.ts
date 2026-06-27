import { locales, type AppLocale } from "@/i18n/routing";

/** Map browser language to a supported app locale. */
export function detectBrowserAppLocale(fallback: AppLocale = "en"): AppLocale {
  if (typeof navigator === "undefined") {
    return fallback;
  }

  const candidates = navigator.languages?.length
    ? [...navigator.languages]
    : [navigator.language];

  for (const raw of candidates) {
    const primary = raw.split("-")[0]?.toLowerCase();
    if (primary != null && (locales as readonly string[]).includes(primary)) {
      return primary as AppLocale;
    }
  }

  return fallback;
}

/** ISO 3166-1 alpha-2 from browser locale (e.g. pl-PL → PL). */
export function detectBrowserCountryCode(): string | undefined {
  if (typeof navigator === "undefined") {
    return undefined;
  }

  const candidates = navigator.languages?.length
    ? [...navigator.languages]
    : [navigator.language];

  for (const raw of candidates) {
    try {
      const intlLocale = new Intl.Locale(raw);
      const region = intlLocale.region?.toUpperCase();
      if (region != null && /^[A-Z]{2}$/.test(region)) {
        return region;
      }
    } catch {
      const parts = raw.split("-");
      const region = parts[1]?.toUpperCase();
      if (region != null && /^[A-Z]{2}$/.test(region)) {
        return region;
      }
    }
  }

  return undefined;
}

import type { BeachDisplayWeather } from "@/lib/types/beach-list";

export type PrecipDisplayLevel = "none" | "chance" | "likely";

export type CloudDisplayLevel = "clear" | "partly" | "cloudy";

export type WindSpeedTone = "calm" | "moderate" | "strong";

const DRY_MAX_PRECIP_PROB = 20;
const LIKELY_RAIN_PRECIP_PROB = 50;
const CLEAR_MAX_CLOUD_COVER = 20;
const PARTLY_MAX_CLOUD_COVER = 60;
const CALM_WIND_MAX_KMH = 15;
const MODERATE_WIND_MAX_KMH = 24;

export function precipDisplayLevel(
  precipProb: number | null | undefined,
): PrecipDisplayLevel {
  if (precipProb == null || !Number.isFinite(precipProb) || precipProb <= DRY_MAX_PRECIP_PROB) {
    return "none";
  }
  if (precipProb >= LIKELY_RAIN_PRECIP_PROB) {
    return "likely";
  }
  return "chance";
}

export function cloudDisplayLevel(
  cloudCover: number | null | undefined,
): CloudDisplayLevel | null {
  if (cloudCover == null || !Number.isFinite(cloudCover)) {
    return null;
  }
  if (cloudCover <= CLEAR_MAX_CLOUD_COVER) {
    return "clear";
  }
  if (cloudCover <= PARTLY_MAX_CLOUD_COVER) {
    return "partly";
  }
  return "cloudy";
}

const CONDITION_LABEL_KEYS: Record<string, string> = {
  clear: "conditionClear",
  cloudy: "conditionCloudy",
  overcast: "conditionOvercast",
  "partially cloudy": "conditionPartiallyCloudy",
  "partly cloudy": "conditionPartiallyCloudy",
  rain: "conditionRain",
  "heavy rain": "conditionHeavyRain",
  drizzle: "conditionDrizzle",
  fog: "conditionFog",
  mist: "conditionMist",
  snow: "conditionSnow",
  thunderstorm: "conditionThunderstorm",
};

export function translateCondition(
  raw: string | null | undefined,
  t: (key: string) => string,
): string | null {
  if (!raw?.trim()) {
    return null;
  }

  const key = raw.trim().toLowerCase();
  const labelKey = CONDITION_LABEL_KEYS[key];
  return labelKey ? t(labelKey) : raw.trim();
}

/** Prefer VC `conditions`, fall back to first phrase of `description`; max 2 words. */
export function shortWeatherLabel(
  weather: BeachDisplayWeather,
  t: (key: string) => string,
  maxWords = 2,
): string | null {
  const fromConditions = translateCondition(weather.conditions, t);
  const source =
    fromConditions ??
    weather.description?.trim().split(/[.,;]/)[0]?.trim() ??
    null;

  if (!source) {
    return null;
  }

  const words = source.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) {
    return words.join(" ");
  }
  return words.slice(0, maxWords).join(" ");
}

export function formatTempRange(
  tempMin: number | null | undefined,
  tempMax: number | null | undefined,
  locale: string,
): string | null {
  const hasMin = tempMin != null && Number.isFinite(tempMin);
  const hasMax = tempMax != null && Number.isFinite(tempMax);

  if (!hasMin && !hasMax) {
    return null;
  }

  const fmt = (value: number) =>
    new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(
      Math.round(value),
    );

  if (hasMin && hasMax) {
    return `${fmt(tempMin!)}° / ${fmt(tempMax!)}°`;
  }

  return `${fmt((hasMin ? tempMin : tempMax)!)}°`;
}

export function windSpeedTone(
  windSpeed: number | null | undefined,
): WindSpeedTone | null {
  if (windSpeed == null || !Number.isFinite(windSpeed)) {
    return null;
  }
  if (windSpeed <= CALM_WIND_MAX_KMH) {
    return "calm";
  }
  if (windSpeed <= MODERATE_WIND_MAX_KMH) {
    return "moderate";
  }
  return "strong";
}

export function formatWindSpeed(
  windSpeed: number,
  locale: string,
): string {
  const rounded = Math.round(windSpeed);
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(rounded)} km/h`;
}

/** True when the compact weather strip would show real values (not "—"). */
export function hasRenderableBeachWeather(
  weather: BeachDisplayWeather | null | undefined,
): boolean {
  if (weather == null) {
    return false;
  }

  const hasTemp =
    (weather.tempMin != null && Number.isFinite(weather.tempMin)) ||
    (weather.tempMax != null && Number.isFinite(weather.tempMax));
  const cloud = cloudDisplayLevel(weather.cloudCover);
  const precip = precipDisplayLevel(weather.precipProb);
  const hasWind = weather.windSpeed != null && Number.isFinite(weather.windSpeed);

  return hasTemp || cloud != null || precip !== "none" || hasWind;
}

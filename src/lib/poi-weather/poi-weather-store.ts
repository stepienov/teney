import type {
  BeachWeather,
  PoiDto,
  PoiWeatherEntry,
  Weather,
  WeatherReadinessStatus,
} from "@/lib/types/poi";

export type PoiWeatherSlice = {
  weather: Weather | null;
  weatherStatus: WeatherReadinessStatus;
  beachWeather: BeachWeather | null;
  beachWeatherStatus: WeatherReadinessStatus | null;
};

type Listener = () => void;

function preferStatus(
  prev: WeatherReadinessStatus | undefined,
  next: WeatherReadinessStatus,
): WeatherReadinessStatus {
  if (prev === "READY") {
    return "READY";
  }
  return next;
}

function buildSlice(
  prev: PoiWeatherSlice | undefined,
  patch: Partial<PoiWeatherSlice> & { weatherStatus: WeatherReadinessStatus },
): PoiWeatherSlice {
  const weatherStatus = preferStatus(prev?.weatherStatus, patch.weatherStatus);
  const beachWeatherStatus =
    patch.beachWeatherStatus != null
      ? preferStatus(prev?.beachWeatherStatus ?? undefined, patch.beachWeatherStatus)
      : (prev?.beachWeatherStatus ?? null);

  return {
    weather:
      weatherStatus === "READY" && patch.weather != null
        ? patch.weather
        : prev?.weatherStatus === "READY"
          ? (prev.weather ?? patch.weather ?? null)
          : (patch.weather ?? prev?.weather ?? null),
    weatherStatus,
    beachWeather:
      beachWeatherStatus === "READY" && patch.beachWeather != null
        ? patch.beachWeather
        : prev?.beachWeatherStatus === "READY"
          ? (prev.beachWeather ?? patch.beachWeather ?? null)
          : (patch.beachWeather ?? prev?.beachWeather ?? null),
    beachWeatherStatus,
  };
}

class PoiWeatherStore {
  private entries = new Map<number, PoiWeatherSlice>();
  private listeners = new Set<Listener>();
  private version = 0;

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getVersion = (): number => this.version;

  getSnapshot = (poiId: number): PoiWeatherSlice | undefined =>
    this.entries.get(poiId);

  mergeFromPoi(poi: PoiDto): void {
    const weatherStatus =
      poi.beachDetails == null
        ? "NOT_APPLICABLE"
        : (poi.weatherStatus ??
          (poi.coordinates == null
            ? "NOT_APPLICABLE"
            : poi.weather != null
              ? "READY"
              : "PENDING"));

    const prev = this.entries.get(poi.id);
    const next = buildSlice(prev, {
      weather: poi.weather,
      weatherStatus,
      beachWeather: poi.beachWeather,
      beachWeatherStatus: poi.beachWeatherStatus ?? null,
    });

    if (
      prev?.weather === next.weather &&
      prev.weatherStatus === next.weatherStatus &&
      prev.beachWeather === next.beachWeather &&
      prev.beachWeatherStatus === next.beachWeatherStatus
    ) {
      return;
    }

    this.entries.set(poi.id, next);
    this.version += 1;
    this.emit();
  }

  mergeFromBatchEntry(entry: PoiWeatherEntry): void {
    const prev = this.entries.get(entry.poiId);
    const next = buildSlice(prev, {
      weather: entry.current,
      weatherStatus: entry.currentStatus,
      beachWeather: entry.beachWeather ?? null,
      beachWeatherStatus: entry.beachStatus ?? null,
    });

    if (
      prev?.weather === next.weather &&
      prev.weatherStatus === next.weatherStatus &&
      prev.beachWeather === next.beachWeather &&
      prev.beachWeatherStatus === next.beachWeatherStatus
    ) {
      return;
    }

    this.entries.set(entry.poiId, next);
    this.version += 1;
    this.emit();
  }

  private emit(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }
}

export const poiWeatherStore = new PoiWeatherStore();

export function chunkIds(ids: number[], size: number): number[][] {
  const chunks: number[][] = [];
  for (let index = 0; index < ids.length; index += size) {
    chunks.push(ids.slice(index, index + size));
  }
  return chunks;
}

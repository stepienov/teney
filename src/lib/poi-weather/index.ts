import { poiWeatherStore } from "@/lib/poi-weather/poi-weather-store";
import type { PoiDto } from "@/lib/types/poi";

/** Read cached weather for a POI (e.g. detail fetch enrichment). No UI. */
export function applyCachedPoiWeather(poi: PoiDto): PoiDto {
  const cached = poiWeatherStore.getSnapshot(poi.id);
  if (cached == null) {
    return poi;
  }

  return {
    ...poi,
    weather:
      cached.weatherStatus === "READY" ? cached.weather : poi.weather,
    weatherStatus: cached.weatherStatus ?? poi.weatherStatus,
    beachWeather:
      cached.beachWeatherStatus === "READY"
        ? cached.beachWeather
        : poi.beachWeather,
    beachWeatherStatus: cached.beachWeatherStatus ?? poi.beachWeatherStatus,
  };
}

export { poiWeatherStore } from "@/lib/poi-weather/poi-weather-store";
